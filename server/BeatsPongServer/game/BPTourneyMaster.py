import asyncio
import time
import sys
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.layers import get_channel_layer
from channels.exceptions import DenyConnection
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import parse_qs
from BPDAL.views import async_query_profile_data
from BPDAL.views import init_tourney_history
from .BPTourneySlave import TourneyGame

"""
This class handles all game related traffic. Below is a high level abstract of it's workflow
1. accept traffic and insert it into a que
2. create a room when there are enough players
3. a room consists of an independant game class and it's players
"""

class BPTourneyMaster(AsyncJsonWebsocketConsumer):
    # Players in que for tournamant
    que_tourney = []

    queForFinals = {}

    activeTourneys = 0

    channelToRoomNameMap = {}

    finalistUsernames = []

    onlinePlayers = []

    disconnectedPlayers = []

    def __init__(self, *args, **kwargs):
        # game mode
        super().__init__(*args, **kwargs)
        self.game_mode = ''
        self.username = ''
        # active rooms with games running
        # round 1
        self.game1 = None
        self.game2 = None
        self.id = None
        # final round
        self.finalGame = None

        self.finalistDisplayNameMap = {}
        self.executor = ThreadPoolExecutor(max_workers=10)  # Initialize ThreadPoolExecutor

    # handles a new connection, put them into a que, pop them when enough players to start game
    async def connect(self):
        print("connecting")
        print(self.channel_name, flush=True)
        query_string = self.scope['query_string'].decode()
        query_params = parse_qs(query_string)
        self.username = query_params.get('username', [None])[0]
        if self.username in BPTourneyMaster.onlinePlayers:
            BPTourneyMaster.onlinePlayers.append(self.username)
            raise DenyConnection("Username already online") 
        BPTourneyMaster.onlinePlayers.append(self.username)
        await self.accept()
        # parse url parameter to determine which game mode the user is queing for.
        self.displayName = query_params.get('displayName', [None])[0]
        
        BPTourneyMaster.que_tourney.append(
            { 
                "self": self, 
                "username": self.username ,
                "displayName": self.displayName
            }
        )
        await self.check_ques()
            
    # if enough players exist in the que, pop the first two players and put them into a room with a game.
    async def check_ques(self):
        if len(BPTourneyMaster.que_tourney) >= 4:
            BPTourneyMaster.disconnectedPlayers = None
            BPTourneyMaster.disconnectedPlayers = []
            BPTourneyMaster.activeTourneys += 1
            # create channel layer for first game
            player1 = BPTourneyMaster.que_tourney.pop(0)
            player2 = BPTourneyMaster.que_tourney.pop(0)
            channelLayer1 = get_channel_layer()
            await channelLayer1.group_add("game1_" + str(BPTourneyMaster.activeTourneys), player1.get("self").channel_name)
            await channelLayer1.group_add("game1_" + str(BPTourneyMaster.activeTourneys), player2.get("self").channel_name)

            # initiate db entry for tournament history
            tourneyHistory = await self.run_in_thread(init_tourney_history)
            id = tourneyHistory.matchId
            self.id = id

            BPTourneyMaster.channelToRoomNameMap["game1_" + str(BPTourneyMaster.activeTourneys)] = TourneyGame(
                room_name="game1_" + str(BPTourneyMaster.activeTourneys), 
                player1=player1.get("self"),
                player2=player2.get("self"),
                channelLayer=channelLayer1,
                player1Username=player1.get("username"), 
                player2Username=player2.get("username"),
                player1DisplayName=player1.get("displayName"),
                player2DisplayName=player2.get("displayName"),
                gameId=id,
                autoWinPlayer=None
            )
            print("Rooms: ", BPTourneyMaster.channelToRoomNameMap, flush=True)
            # start first game
            
            asyncio.create_task(BPTourneyMaster.channelToRoomNameMap["game1_" + str(BPTourneyMaster.activeTourneys)].start_game())

            # create channel layer for second game
            player3 = BPTourneyMaster.que_tourney.pop(0)
            player4 = BPTourneyMaster.que_tourney.pop(0)
            channelLayer2 = get_channel_layer()
            await channelLayer2.group_add("game2_" + str(BPTourneyMaster.activeTourneys), player3.get("self").channel_name)
            await channelLayer2.group_add("game2_"+ str(BPTourneyMaster.activeTourneys), player4.get("self").channel_name)

            # start second game
            BPTourneyMaster.channelToRoomNameMap["game2_" + str(BPTourneyMaster.activeTourneys)] = TourneyGame(
                room_name="game2_" + str(BPTourneyMaster.activeTourneys), 
                player1=player3.get("self"),
                player2=player4.get("self"),
                channelLayer=channelLayer2,
                player1Username=player3.get("username"), 
                player2Username=player4.get("username"),
                player1DisplayName=player3.get("displayName"),
                player2DisplayName=player4.get("displayName"),
                gameId=id,
                autoWinPlayer=None
            )
            print("Rooms: ", BPTourneyMaster.channelToRoomNameMap, flush=True)
            asyncio.create_task(BPTourneyMaster.channelToRoomNameMap["game2_" + str(BPTourneyMaster.activeTourneys)].start_game())

    # Function to search for a key in the list of dictionaries
    def find_index_by_key(self, search_key):
        for index, dictionary in enumerate(BPTourneyMaster.queForFinals): 
            if search_key in dictionary: 
                return index 
        return -1

    def run_in_thread(self, func, *args): 
        loop = asyncio.get_event_loop() 
        return loop.run_in_executor(self.executor, func, *args)
   
    # called when the game message anounces a winner for the first game. Adds the winner's channel into a que for the final round. If there are 2 players in the que, create a new channel layyer and start the finals
    async def handle_game1_winner(self, winnerChannel, roomName, gameId):
        username = winnerChannel.get("username")
        if username in BPTourneyMaster.finalistUsernames:
            print("User already in finals", flush=True)
            return
        print("queForFinals", BPTourneyMaster.queForFinals, flush=True)
        roomIndex = roomName.split("_", 1)[1]
        que = BPTourneyMaster.queForFinals.get(roomIndex)
        if not que:
            BPTourneyMaster.queForFinals[roomIndex] = [winnerChannel]
        else:
            BPTourneyMaster.queForFinals[roomIndex].append(winnerChannel)
        # time.sleep(1)
        # Find the game room this player is part of and handle the disconnect
        if len(BPTourneyMaster.queForFinals.get(roomIndex)) >= 2:
            channelList = BPTourneyMaster.queForFinals.get(roomIndex)
            print("starting finals", flush=True)

            player1 = channelList.pop(0)
            player2 = channelList.pop(0)
            autowinPlayer = None
            player1Profile = await self.run_in_thread(async_query_profile_data, player1.get("username"))
            player2Profile = await self.run_in_thread(async_query_profile_data, player2.get("username"))
            player1DisplayName = player1Profile.displayName
            player2DisplayName = player2Profile.displayName
            BPTourneyMaster.queForFinals.pop(roomIndex)

            channelLayer = get_channel_layer()
            await channelLayer.group_add("finals_" + str(BPTourneyMaster.activeTourneys), player1.get("self"))
            await channelLayer.group_add("finals_" + str(BPTourneyMaster.activeTourneys), player2.get("self"))

            
            # if not "finals_" in roomName:
            # check if a player disconnected and make the connected one autowin
            if player1.get("username") in BPTourneyMaster.disconnectedPlayers:
                print("player1 disconnected from first game", flush=True)
                print("player1 discon:", player1.get("username"))
                autowinPlayer = player2.get("username")
                BPTourneyMaster.disconnectedPlayers = [player for player in BPTourneyMaster.disconnectedPlayers if player != player1.get("username")]
            elif player2.get("username") in BPTourneyMaster.disconnectedPlayers:
                print("player2 disconnected from first game", flush=True)
                print("player2 discon:", player1.get("username"))
                autowinPlayer = player1.get("username")
                BPTourneyMaster.disconnectedPlayers = [player for player in BPTourneyMaster.disconnectedPlayers if player != player2.get("username")]
            
            print("autowinPLayer: ", autowinPlayer, flush=True)
            await self.send_json({"eventMsg": "starting finals"})
            BPTourneyMaster.channelToRoomNameMap["finals_" + str(BPTourneyMaster.activeTourneys)] = TourneyGame(
                room_name="finals_" + str(BPTourneyMaster.activeTourneys), 
                player1=player1["self"],
                player2=player2["self"],
                channelLayer=channelLayer,
                player1Username=player1.get("username"), 
                player2Username=player2.get("username"),
                player1DisplayName=player1DisplayName,
                player2DisplayName=player2DisplayName,
                gameId=gameId,
                autoWinPlayer=autowinPlayer,
            )
            print("Rooms: ", BPTourneyMaster.channelToRoomNameMap, flush=True)
            asyncio.create_task(BPTourneyMaster.channelToRoomNameMap["finals_" + str(BPTourneyMaster.activeTourneys)].start_game())


    async def receive_json(self, content):
        if not content.get("roomName"):
            return
        
        roomName = content.get("roomName")
        targetRoom = BPTourneyMaster.channelToRoomNameMap.get(roomName)
        if targetRoom:
            await targetRoom.receive_json(content, self)

    # remove players from que when they disconnect
    async def disconnect(self, code):
        print(f"Disconnected with code: {code}")
        # put the disconnected username into a list to track it
        BPTourneyMaster.disconnectedPlayers.append(self.username)

        for player in BPTourneyMaster.que_tourney:
            print("player in que: ", player.get("username"), flush=True)
            if self.username == player.get("username"):
                print("Removing player from online players list", flush=True)
                BPTourneyMaster.onlinePlayers.remove(self.username)
                break
        
        # Remove the player from the appropriate queue
        for player in BPTourneyMaster.que_tourney:
            if isinstance(player, dict) and player['self'] == self:
                BPTourneyMaster.que_tourney.remove(player)
        # Find the game room this player is part of and handle the disconnect
        for room in BPTourneyMaster.channelToRoomNameMap:
            if self in [BPTourneyMaster.channelToRoomNameMap[room].player1, BPTourneyMaster.channelToRoomNameMap[room].player2]:
                await BPTourneyMaster.channelToRoomNameMap[room].handle_player_disconnect(self)
                BPTourneyMaster.channelToRoomNameMap.pop(room)
                break
            if "finals" in room:
                await BPTourneyMaster.channelToRoomNameMap[room].handle_player_disconnect(self)
                BPTourneyMaster.activeTourneys -= 1
        
        for key, value in BPTourneyMaster.channelToRoomNameMap.items():
            if self.username in [value.player1Username, value.player2Username] and not value.running:
                print("Removing player from online players list", flush=True)
                # BPTourneyMaster.onlinePlayers.remove(self.username)
                break
        
        print("Rooms: ", BPTourneyMaster.channelToRoomNameMap, flush=True)
        print("Que: ", BPTourneyMaster.que_tourney, flush=True)
        print("Room length: ", len(BPTourneyMaster.channelToRoomNameMap), flush=True)
        print("Que length: ", len(BPTourneyMaster.que_tourney), flush=True)


    async def game_message(self, event):
        message = event['message']
        winnerChannel = event['tourneyWinnerChannel']
        if winnerChannel.get("username"):
            if message.get("player1") == winnerChannel.get("username"):
                BPTourneyMaster.onlinePlayers = [player for player in BPTourneyMaster.onlinePlayers if player != message.get("player2")]
            if message.get("player2") == winnerChannel.get("username"):
                BPTourneyMaster.onlinePlayers = [player for player in BPTourneyMaster.onlinePlayers if player != message.get("player1")]
            if "final" in message.get("roomName"):
                BPTourneyMaster.finalistUsernames = [username for username in BPTourneyMaster.finalistUsernames if username != message.get("player1")]
                BPTourneyMaster.finalistUsernames = [username for username in BPTourneyMaster.finalistUsernames if username != message.get("player2")]
                BPTourneyMaster.onlinePlayers = [player for player in BPTourneyMaster.onlinePlayers if player != message.get("player1")]
                BPTourneyMaster.onlinePlayers = [player for player in BPTourneyMaster.onlinePlayers if player != message.get("player2")]
                BPTourneyMaster.activeTourneys -= 1
                await self.send_json(message)
                return
            print("winnerChannel", winnerChannel, flush=True)
            self.finalistDisplayNameMap[winnerChannel.get("username")] = message.get("winnerDisplayName")
            if "final" not in message.get("roomName"):
                await self.handle_game1_winner(winnerChannel, roomName=message.get("roomName"), gameId=message.get("gameId"))
            BPTourneyMaster.finalistUsernames.append(winnerChannel.get("username"))
        try:
            await self.send_json(message)
        except Exception as e:
            print("socket closed", flush=True)
            pass

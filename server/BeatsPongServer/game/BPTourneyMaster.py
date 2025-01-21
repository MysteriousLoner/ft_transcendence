import asyncio
import sys
from urllib.parse import parse_qs
from .BPTourneySlave import TourneyGame
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.layers import get_channel_layer

"""
This class handles all game related traffic. Below is a high level abstract of it's workflow
1. accept traffic and insert it into a que
2. create a room when there are enough players
3. a room consists of an independant game class and it's players
"""

class BPTourneyMaster(AsyncJsonWebsocketConsumer):
    # Players in que for tournamant
    que_tourney = []

    queForFinals = []

    activeTourneys = 0

    def __init__(self, *args, **kwargs):
        # game mode
        super().__init__(*args, **kwargs)
        self.game_mode = ''
        self.username = ''
        # active rooms with games running
        # round 1
        self.game1 = None
        self.game2 = None
        # final round
        self.finalGame = None

    # handles a new connection, put them into a que, pop them when enough players to start game
    async def connect(self):
        print("connecting")
        print(self.channel_name, flush=True)
        await self.accept()
        # parse url parameter to determine which game mode the user is queing for.
        query_string = self.scope['query_string'].decode()
        query_params = parse_qs(query_string)
        self.username = query_params.get('username', [None])[0]
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
            BPTourneyMaster.activeTourneys += 1
            # create channel layer for first game
            player1 = BPTourneyMaster.que_tourney.pop(0)
            player2 = BPTourneyMaster.que_tourney.pop(0)
            channelLayer1 = get_channel_layer()
            await channelLayer1.group_add("game1" + str(BPTourneyMaster.activeTourneys), player1.get("self").channel_name)
            await channelLayer1.group_add("game1" + str(BPTourneyMaster.activeTourneys), player2.get("self").channel_name)

            # start first game
            self.game1 = TourneyGame(
                room_name="game1" + str(BPTourneyMaster.activeTourneys), 
                player1=player1.get("self"),
                player2=player2.get("self"),
                channelLayer=channelLayer1,
                player1Username=player1.get("username"), 
                player2Username=player2.get("username"),
            )
            asyncio.create_task(self.game1.start_game())

            # create channel layer for second game
            player3 = BPTourneyMaster.que_tourney.pop(0)
            player4 = BPTourneyMaster.que_tourney.pop(0)
            channelLayer2 = get_channel_layer()
            await channelLayer2.group_add("game2" + str(BPTourneyMaster.activeTourneys), player3.get("self").channel_name)
            await channelLayer2.group_add("game2"+ str(BPTourneyMaster.activeTourneys), player4.get("self").channel_name)

            # start second game
            self.game2 = TourneyGame(
                room_name="game2" + str(BPTourneyMaster.activeTourneys), 
                player1=player3.get("self"),
                player2=player4.get("self"),
                channelLayer=channelLayer2,
                player1Username=player3.get("username"), 
                player2Username=player4.get("username"),
            )
            asyncio.create_task(self.game2.start_game())

    # Function to search for a key in the list of dictionaries
    def find_index_by_key(self, search_key):
        for index, dictionary in enumerate(BPTourneyMaster.queForFinals): 
            if search_key in dictionary: 
                return index 
        return -1

    # called when the game message anounces a winner for the first game. Adds the winner's channel into a que for the final round. If there are 2 players in the que, create a new channel layyer and start the finals
    async def handle_game1_winner(self, winnerChannel, roomName):
        print("handling finals winnerChannel", winnerChannel, flush=True)
        index = self.find_index_by_key(roomName)
        if index == -1:
            BPTourneyMaster.queForFinals.append({roomName: [winnerChannel], })
        else:
            BPTourneyMaster.queForFinals[index][roomName].append(winnerChannel) 
        if len(BPTourneyMaster.queForFinals[index][roomName]) >= 2:
            print("starting finals", flush=True)
            player1 = BPTourneyMaster.queForFinals[index][roomName].pop(0)
            player2 = BPTourneyMaster.queForFinals[index][roomName].pop(0)
            channelLayer = get_channel_layer()
            await channelLayer.group_add("finals" + str(BPTourneyMaster.activeTourneys), player1.get("self"))
            await channelLayer.group_add("finals" + str(BPTourneyMaster.activeTourneys), player2.get("self"))

            self.finalGame = TourneyGame(
                room_name="finals" + str(BPTourneyMaster.activeTourneys), 
                player1=player1["self"],
                player2=player2["self"],
                channelLayer=channelLayer,
                player1Username=player1.get("username"), 
                player2Username=player2.get("username"),
            )
            asyncio.create_task(self.finalGame.start_game())


    async def receive_json(self, content):
        sender_channel = self.channel_name  # Get the name of the channel sending the message
        # If the game mode is not vanilla, allow messages from both channel1 and channel2
        if self.game1 and sender_channel in [self.game1.channel1_name, self.game1.channel2_name]:
            await self.game1.receive_json(content, self)
        if self.game2 and sender_channel in [self.game2.channel1_name, self.game2.channel2_name]:
            await self.game2.receive_json(content, self)
        if self.finalGame and sender_channel in [self.finalGame.channel1_name, self.finalGame.channel2_name]:
            await self.finalGame.receive_json(content, self)

    # remove players from que when they disconnect
    async def disconnect(self, code):
        print(f"Disconnected with code: {code}")
        
        # Remove the player from the appropriate queue
        for queue in BPTourneyMaster.que_tourney:
            for player in queue:
                if player['self'] == self:
                    queue.remove(player)
        
        # Find the game room this player is a part of
        if self.game1 and self in [self.game1.player1, self.game1.player2]:
            await self.game1.handle_player_disconnect(self)
        if self.game2 and self in [self.game2.player1, self.game2.player2]:
            await self.game2.handle_player_disconnect(self)
        if self.finalGame and self in [self.finalGame.player1, self.finalGame.player2]:
            await self.finalGame.handle_player_disconnect(self)
            BPTourneyMaster.activeTourneys -= 1

    async def game_message(self, event):
        message = event['message']
        winnerChannel = event['tourneyWinnerChannel']
        if winnerChannel.get("username"):
            if "final" in message.get("roomName"):
                BPTourneyMaster.activeTourneys -= 1
                await self.send_json(message)
                return
            print("winnerChannel", winnerChannel, flush=True)
            await self.handle_game1_winner(winnerChannel, roomName=message.get("roomName"))
        await self.send_json(message)

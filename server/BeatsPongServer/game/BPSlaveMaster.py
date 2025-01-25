import asyncio
import sys
from urllib.parse import parse_qs
from .BPSlave import PongGame
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.exceptions import DenyConnection
"""
This class handles all game related traffic. Below is a high level abstract of it's workflow
1. accept traffic and insert it into a que
2. create a room when there are enough players
3. a room consists of an independant game class and it's players
"""

class BPSlaveMaster(AsyncJsonWebsocketConsumer):
    # Class level variables for room management-------------------------------------------------------

    # Players in que for 1v1
    que_solo = [] 
    
    # Players in que for tournamant
    que_tourney = []
    # active rooms with games running
    rooms = []

    # Vanilla players
    que_vanilla = []

    onlinePlayers = []

    # instance level variables-------------------------------------------------------------------------
    def __init__(self, *args, **kwargs):
        # game mode
        super().__init__(*args, **kwargs)
        self.game_mode = ''
        self.username = ''

    # websocket functions-----------------------------------------------------------------------------

    # handles a new connection, put them into a que, pop them when enough players to start game
    async def connect(self):
        print("connecting")
        print("Online Players: ", BPSlaveMaster.onlinePlayers, flush=True)
        print(self.channel_name, flush=True)
        query_string = self.scope['query_string'].decode()
        query_params = parse_qs(query_string)
        self.username = query_params.get('username', [None])[0]
        if self.username in BPSlaveMaster.onlinePlayers:
            raise DenyConnection("Username already online") 
        BPSlaveMaster.onlinePlayers.append(self.username)
        print("Online Players: ", BPSlaveMaster.onlinePlayers, flush=True)
        await self.accept()
        # parse url parameter to determine which game mode the user is queing for.
        self.game_mode = query_params.get('gameMode', [None])[0]
        self.displayName = query_params.get('displayName', [None])[0]
        
        if self.game_mode == 'solo':
            BPSlaveMaster.que_solo.append(
                { 
                    "self": self, 
                    "username": self.username ,
                    "displayName": self.displayName
                }
            )
            print("added to list")
            sys.stdout.flush()
            await self.check_ques()
        elif self.game_mode == 'tourney':
            BPSlaveMaster.que_tourney.append(
                { 
                    "self": self, 
                    "username": self.username ,
                    "displayName": self.displayName
                }
            )
            await self.check_ques()
        elif self.game_mode == 'vanilla':
            print("added to vanilla player to list")
            BPSlaveMaster.que_vanilla.append(
                { 
                    "self": self, 
                    "username": self.username ,
                    "displayName": self.displayName
                }
            )
            await self.check_ques_vanilla()
            
    # if enough players exist in the que, pop the first two players and put them into a room with a game.
    async def check_ques(self):
        print("checking que...")
        sys.stdout.flush() # Ensure the message is printed immediately
        if len(BPSlaveMaster.que_solo) >= 2:
            player1 = BPSlaveMaster.que_solo.pop(0)
            player2 = BPSlaveMaster.que_solo.pop(0)
            print("starting game")
            sys.stdout.flush()
            await self.start_game(player1.get("self"), player2.get("self"), player1.get("username"), player2.get("username"), player1.get("displayName"), player2.get("displayName"))

    async def receive_json(self, content):
        sender_channel = self.channel_name  # Get the name of the channel sending the message
        # Loop through the list of rooms to find the matching game
        for game in BPSlaveMaster.rooms:

            # If the game mode is vanilla, only allow messages from channel1
            if self.game_mode == 'vanilla' and sender_channel in [game.channel1_name]:
                await game.receive_json(content, self)
                break

            # If the game mode is not vanilla, allow messages from both channel1 and channel2
            if self.game_mode != 'vanilla' and sender_channel in [game.channel1_name, game.channel2_name]:
                await game.receive_json(content, self)
                break

    # remove players from que when they disconnect
    async def disconnect(self, code):
        print(f"Disconnected with code: {code}")
        
        # Remove the player from the appropriate queue
        for queue in [BPSlaveMaster.que_solo, BPSlaveMaster.que_tourney, BPSlaveMaster.que_vanilla]:
            for player in queue:
                if player['self'] == self:
                    queue.remove(player)
        
        # Find the game room this player is a part of
        for game in BPSlaveMaster.rooms:
            if self in [game.player1, game.player2]:
                # Notify the game about the disconnection
                await game.handle_player_disconnect(self)
                break
        
        # Remove the player from the list of online players
        print("disconnecting plater username: ", self.username, flush=True)
        print("Online Players (disconnect): ", BPSlaveMaster.onlinePlayers, flush=True)
        for room in BPSlaveMaster.rooms:
            if self.username in [room.player1Username, room.player2Username] and not room.running:
                print("Removing player from online players list", flush=True)
                BPSlaveMaster.onlinePlayers = [player for player in BPSlaveMaster.onlinePlayers if player != self.username]
        print("Online Players (disconnect, after clean): ", BPSlaveMaster.onlinePlayers, flush=True)


    # room management functions--------------------------------------------------------------------------


    async def start_game(self, player1, player2, username1, username2, displayName1, displayName2):
        # create a simple, valid room name using the index in the list of active rooms
        room_index = len(BPSlaveMaster.rooms)
        room_name = f"game_room_{room_index}"

        # add players to the room, create game object and add players to it
        game = PongGame(
            room_name=room_name, 
            player1=player1, 
            player2=player2, 
            player1Username=username1, 
            player2Username=username2,
            player1DisplayName=displayName1,
            player2DisplayName=displayName2
        ) # 'AI' determines if the game is single player or multiplayer
        BPSlaveMaster.rooms.append(game)

        # start game
        asyncio.create_task(game.start_game())

# Vanilla game mode -------------------------------------------------------------------------------------

    async def check_ques_vanilla(self):
        print("checking vanilla que...")
        sys.stdout.flush() # Ensure the message is printed immediately
        if len(BPSlaveMaster.que_vanilla) >= 1:
            player = BPSlaveMaster.que_vanilla.pop(0)
            await self.start_game_vanilla(player.get("self"), player.get("username"), player.get("displayName"))

    async def start_game_vanilla(self, player1, username, displayName):
        # create a simple, valid room name using the index in the list of active rooms
        room_index = len(BPSlaveMaster.rooms)
        room_name = f"game_room_{room_index}"

        # add players to the room, create game object and add players to it
        game = PongGame(
            room_name=room_name, 
            player1=player1, 
            player2='AI', 
            player1Username=username,
            player2Username="AI",
            player1DisplayName=displayName,
            player2DisplayName="AI"         
        ) # 'AI' determines if the game is single player or multiplayer
        BPSlaveMaster.rooms.append(game)

        # start game
        asyncio.create_task(game.start_game())

# End of vanilla game mode ------------------------------------------------------------------------------

    async def game_message(self, event):
        message = event['message']
        await self.send_json(message)

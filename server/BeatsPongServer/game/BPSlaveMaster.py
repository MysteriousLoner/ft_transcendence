import asyncio
import sys
from urllib.parse import parse_qs
from .BPSlave import PongGame
from channels.generic.websocket import AsyncJsonWebsocketConsumer

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

    # websocket functions-----------------------------------------------------------------------------

    # handles a new connection, put them into a que, pop them when enough players to start game
    async def connect(self):
        print("connecting")
        print(self.channel_name)
        sys.stdout.flush() # Ensure the message is printed immediately
        await self.accept()
        # parse url parameter to determine which game mode the user is queing for.
        query_string = self.scope['query_string'].decode()
        query_params = parse_qs(query_string)
        game_mode = query_params.get('gameMode', [None])[0]
        if game_mode == 'solo':
            BPSlaveMaster.que_solo.append(self)
            print("added to list")
            sys.stdout.flush()
            await self.check_ques()
        elif game_mode == 'tourney':
            BPSlaveMaster.que_tourney.append(self)
            await self.check_ques()

    async def receive_json(self, content):
        sender_channel = self.channel_name  # Get the name of the channel sending the message
        # Loop through the list of rooms to find the matching game
        for game in BPSlaveMaster.rooms:
            if sender_channel in [game.channel1_name, game.channel2_name]:
                print("message received!")
                print("sender: " + sender_channel)
                print(content)
                # If the sender channel matches either player's channel name, pass the content to the game
                await game.receive_json(content, self)
                break

    # remove players from que when they disconnect
    async def disconnect(self):
        if self in BPSlaveMaster.que_solo:
            BPSlaveMaster.que_solo.remove(self)
        if self in BPSlaveMaster.que_tourney:
            BPSlaveMaster.que_tourney.remove(self)

    # room management functions--------------------------------------------------------------------------

    # if enough players exist in the que, pop the first two players and put them into a room with a game.
    async def check_ques(self):
        print("checking que...")
        sys.stdout.flush() # Ensure the message is printed immediately
        if len(BPSlaveMaster.que_solo) >= 2:
            player1 = BPSlaveMaster.que_solo.pop(0)
            player2 = BPSlaveMaster.que_solo.pop(0)
            print("starting game")
            sys.stdout.flush()
            await self.start_game(player1, player2)

    async def start_game(self, player1, player2):
        # create a simple, valid room name using the index in the list of active rooms
        room_index = len(BPSlaveMaster.rooms)
        room_name = f"game_room_{room_index}"

        # add players to the room, create game object and add players to it
        game = PongGame(room_name=room_name, player1=player1, player2=player2)
        BPSlaveMaster.rooms.append(game)

        # start game
        asyncio.create_task(game.start_game())

    async def game_message(self, event):
        message = event['message']
        await self.send_json(message)

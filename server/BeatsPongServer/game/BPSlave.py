import asyncio, random
from channels.layers import get_channel_layer

'''
This class is an object to represent an instance of a running game in regular mode.
It consists of an independant game container and a channel that connects 2 websocket connections of 2 players

Constructor builds the object with 3 arguements: room_name, player1 and player2
1. a channel group will be initiated, and the websockets passed in as player1 and player2 will be added to the group.
2. Game starts afterwards.

Note: AsyncJsonWebsocketConsumer is used. No need to dump.
'''

class PongGame:
    # Class-level variables for default game settings
    cuboidWidth = 15
    cuboidHeight = 10
    cuboidDepth = 0.25
    paddleWidth = 0.2
    paddleHeight = 1.5
    paddleDepth = 0.25
    ballRadius = 0.125
    cameraZ = 10
    leftPaddleSpeed = 0.1
    rightPaddleSpeed = 0.1
    ballSpeed = 0.075
    waitTime = 3

    def __init__(self, room_name, player1, player2):
        print("Game object created", flush=True)
        # identity of the room "I identify as a ......."
        self.room_name = room_name
        # identifies if the game is running
        self.running = False
        # identifies the name of the websocket sending message
        self.channel1_name = player1.channel_name
        self.channel2_name = player2.channel_name

        self.ai_last_refresh_time = 0
        self.ai_refresh_interval = 1
        self.AI_target = 0
        self.predicted_target = 0

        # create group for websockets, add websockets from players to group
        self.channel_layer = get_channel_layer()
        asyncio.create_task(self.channel_layer.group_add(self.room_name, player1.channel_name))
        asyncio.create_task(self.channel_layer.group_add(self.room_name, player2.channel_name))

        # Initialize game state and game objects
        self.cuboid = {
            'width': PongGame.cuboidWidth,
            'height': PongGame.cuboidHeight,
            'depth': PongGame.cuboidDepth
        }
        self.leftPaddle = {
            'width': PongGame.paddleWidth,
            'height': PongGame.paddleHeight,
            'depth': PongGame.paddleDepth,
            'x': -PongGame.cuboidWidth / 2,
            'y': 0,
            'z': 0
        }
        self.rightPaddle = {
            'width': PongGame.paddleWidth,
            'height': PongGame.paddleHeight,
            'depth': PongGame.paddleDepth,
            'x': PongGame.cuboidWidth / 2,
            'y': 0,
            'z': 0
        }
        self.ball = {
            'radius': PongGame.ballRadius,
            'speedX': random.choice([-PongGame.ballSpeed, PongGame.ballSpeed]),
            'speedY': random.choice([-PongGame.ballSpeed, PongGame.ballSpeed]),
            'x': 0,
            'y': 0,
            'z': 0
        }
        self.score = {
            'left': 0,
            'right': 0
        }
        self.keys = {
            'w': False,
            's': False,
            'ArrowUp': False,
            'ArrowDown': False
        }

    async def start_game(self):
        self.running = True
        await self.game_loop()

    async def game_loop(self):
        target_interval = 1/60
        while self.running:
            start_time = asyncio.get_event_loop().time()

            self.update_game_state()
            await self.send_game_state()
            elapsed_time = asyncio.get_event_loop().time() - start_time
            sleep_time = target_interval - elapsed_time
            await asyncio.sleep(sleep_time)

    async def receive_json(self, content, socket):
        sender_channel = socket.channel_name
        print(f"Data received from WebSocket with channel name: {sender_channel}")

        f_keys = content.get('keys')

        self.keys['w'] = f_keys['w']
        self.keys['s'] = f_keys['s']

        if  sender_channel == self.channel1_name:
            if self.keys['w'] and self.leftPaddle['y'] < (self.cuboid['height'] / 2 - self.leftPaddle['height'] / 2):
                self.leftPaddle['y'] += self.leftPaddleSpeed
            elif self.keys['s'] and self.leftPaddle['y'] > (-self.cuboid['height'] / 2 + self.leftPaddle['height'] / 2):
                self.leftPaddle['y'] -= self.leftPaddleSpeed

        if  sender_channel == self.channel2_name:
            if self.keys['w'] and self.rightPaddle['y'] < (self.cuboid['height'] / 2 - self.rightPaddle['height'] / 2):
                self.rightPaddle['y'] += self.rightPaddleSpeed
            elif self.keys['s'] and self.rightPaddle['y'] > (-self.cuboid['height'] / 2 + self.rightPaddle['height'] / 2):
                self.rightPaddle['y'] -= self.rightPaddleSpeed


    def update_game_state(self):
        self.ball['x'] += self.ball['speedX']
        self.ball['y'] += self.ball['speedY']

        if self.ball['y'] + self.ball['radius'] > self.cuboid['height'] / 2 or self.ball['y'] - self.ball['radius'] < -self.cuboid['height'] / 2:
            self.ball['speedY'] = -self.ball['speedY']
        
        if self.ball['x'] + self.ball['radius'] > self.cuboid['width'] / 2:
            self.score['left'] += 1
            self.reset_game()
        elif self.ball['x'] - self.ball['radius'] < -self.cuboid['width'] / 2:
            self.score['right'] += 1
            self.reset_game()

        if self.ball['x'] - self.ball['radius'] < self.leftPaddle['x'] + self.leftPaddle['width'] / 2 and \
                self.leftPaddle['y'] - self.leftPaddle['height'] / 2 < self.ball['y'] < self.leftPaddle['y'] + self.leftPaddle['height'] / 2:
            self.ball['speedX'] = -self.ball['speedX']
        if self.ball['x'] + self.ball['radius'] > self.rightPaddle['x'] - self.rightPaddle['width'] / 2 and \
                self.rightPaddle['y'] - self.rightPaddle['height'] / 2 < self.ball['y'] < self.rightPaddle['y'] + self.rightPaddle['height'] / 2:
            self.ball['speedX'] = -self.ball['speedX']

    def reset_game(self):
        self.ball['x'] = 0
        self.ball['y'] = 0
        self.ball['speedX'] = random.choice([-PongGame.ballSpeed, PongGame.ballSpeed])
        self.ball['speedY'] = random.choice([-PongGame.ballSpeed, PongGame.ballSpeed])
        self.leftPaddle['y'] = 0
        self.rightPaddle['y'] = 0

    async def send_game_state(self):
        game_state = {
            'cuboid': f'{self.cuboid["width"]:.2f},{self.cuboid["height"]:.2f},{self.cuboid["depth"]:.2f}',
            'ball': f'{self.ball["radius"]:.2f},{self.ball["x"]:.2f},{self.ball["y"]:.2f},{self.ball["z"]:.2f}',
            'paddle_dimensions': f'{PongGame.paddleWidth:.2f},{PongGame.paddleHeight:.2f},{PongGame.paddleDepth:.2f}',
            'leftPaddle': f'{self.leftPaddle["x"]:.2f},{self.leftPaddle["y"]:.2f},{self.leftPaddle["z"]:.2f}',
            'rightPaddle': f'{self.rightPaddle["x"]:.2f},{self.rightPaddle["y"]:.2f},{self.rightPaddle["z"]:.2f}',
            'score': f'{self.score["left"]},{self.score["right"]}'
        }
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'game_message',
                'message': game_state
            }
        )

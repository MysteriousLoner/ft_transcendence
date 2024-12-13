import asyncio, json, random
from channels.generic.websocket import AsyncWebsocketConsumer


# Default values for the game -----------------------------------------------
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
run = False

# Game mechanics class -----------------------------------------------------
class PongGameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.running = False

        self.cuboid = {
            'width': cuboidWidth,
            'height': cuboidHeight,
            'depth': cuboidDepth
        }
        self.leftPaddle = {
            'width': paddleWidth,
            'height': paddleHeight,
            'depth': paddleDepth,
            'x': -cuboidWidth / 2,
            'y': 0,
            'z': 0
        }
        self.rightPaddle = {
            'width': paddleWidth,
            'height': paddleHeight,
            'depth': paddleDepth,
            'x': cuboidWidth / 2,
            'y': 0,
            'z': 0
        }
        self.ball = {
            'radius': ballRadius,
            'speedX': random.choice([-ballSpeed, ballSpeed]),
            'speedY': random.choice([-ballSpeed, ballSpeed]),
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

    async def connect(self):
        await self.accept()
        self.running = True
        asyncio.create_task(self.game_loop())

    async def disconnect(self, close_code):
        self.running = False

    async def receive(self, text_data):
        data = json.loads(text_data)
        f_keys = data.get('keys')

        self.keys['w'] = f_keys['w']
        self.keys['s'] = f_keys['s']
        self.keys['ArrowUp'] = f_keys['ArrowUp']
        self.keys['ArrowDown'] = f_keys['ArrowDown']

        if self.keys['w'] and self.leftPaddle['y'] < (self.cuboid['height'] / 2 - self.leftPaddle['height'] / 2):
            self.leftPaddle['y'] += leftPaddleSpeed
        elif self.keys['s'] and self.leftPaddle['y'] > (-self.cuboid['height'] / 2 + self.leftPaddle['height'] / 2):
            self.leftPaddle['y'] -= leftPaddleSpeed

        if self.keys['ArrowUp'] and self.rightPaddle['y'] < (self.cuboid['height'] / 2 - self.rightPaddle['height'] / 2):
            self.rightPaddle['y'] += rightPaddleSpeed
        elif self.keys['ArrowDown'] and self.rightPaddle['y'] > (-self.cuboid['height'] / 2 + self.rightPaddle['height'] / 2):
            self.rightPaddle['y'] -= rightPaddleSpeed

    async def game_loop(self):
        target_interval = 1/60
        while self.running:
            start_time = asyncio.get_event_loop().time()

            self.update_game_state()
            await self.send_game_state()
            elapsed_time = asyncio.get_event_loop().time() - start_time
            sleep_time = target_interval - elapsed_time
            await asyncio.sleep(sleep_time)

    def update_game_state(self):
       # Update ball position
        self.ball['x'] += self.ball['speedX']
        self.ball['y'] += self.ball['speedY']

        # Ball collision with cuboid top edges
        if self.ball['y'] + self.ball['radius'] > self.cuboid['height'] / 2 or self.ball['y'] - self.ball["radius"] < -self.cuboid['height'] / 2:
            self.ball['speedY'] = -self.ball['speedY']
        
        # Ball collision with cuboid side edges
        if self.ball['x'] + self.ball['radius'] > self.cuboid['width'] / 2:
            self.score['left'] += 1
            self.reset_game()
        elif self.ball['x'] - self.ball['radius'] < -self.cuboid['width'] / 2:
            self.score['right'] += 1
            self.reset_game()

        # Ball collision with paddles
        if self.ball['x'] - self.ball['radius'] < self.leftPaddle['x'] + self.leftPaddle['width'] / 2 and \
                self.leftPaddle['y'] - (self.leftPaddle['height'] / 2) < self.ball['y'] < self.leftPaddle['y'] + (self.leftPaddle['height'] / 2):
            self.ball['speedX'] = -self.ball['speedX']
        if self.ball['x'] + self.ball["radius"] > self.rightPaddle['x'] - self.rightPaddle['width'] / 2 and \
                self.rightPaddle['y'] - (self.rightPaddle['height'] / 2) < self.ball['y'] < self.rightPaddle['y'] + (self.rightPaddle['height'] / 2):
            self.ball['speedX'] = -self.ball['speedX']

    def reset_game(self):
        self.ball['x'] = 0
        self.ball['y'] = 0
        self.ball['speedX'] = random.choice([-ballSpeed, ballSpeed])
        self.ball['speedY'] = random.choice([-ballSpeed, ballSpeed])
        self.leftPaddle['y'] = 0
        self.rightPaddle['y'] = 0

    async def send_game_state(self):
        game_state = {
            "cuboid": f"{self.cuboid['width']:.2f},{self.cuboid['height']:.2f},{self.cuboid['depth']:.2f}",
            "ball": f"{self.ball['radius']:.2f},{self.ball['x']:.2f},{self.ball['y']:.2f},{self.ball['z']:.2f}",
            "paddle_dimensions": f"{paddleWidth:.2f},{paddleHeight:.2f},{paddleDepth:.2f}",
            "leftPaddle": f"{self.leftPaddle['x']:.2f},{self.leftPaddle['y']:.2f},{self.leftPaddle['z']:.2f}",
            "rightPaddle": f"{self.rightPaddle['x']:.2f},{self.rightPaddle['y']:.2f},{self.rightPaddle['z']:.2f}",
            "score": f"{self.score['left']},{self.score['right']}"
        }
        print(f"\r{json.dumps(game_state)}", end='')  # Print the game state in the same line
        await self.send(text_data=json.dumps(game_state))
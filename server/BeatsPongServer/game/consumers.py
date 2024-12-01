import asyncio
import json
import random
from channels.generic.websocket import AsyncWebsocketConsumer

class PongGameConsumer(AsyncWebsocketConsumer):
    game_map_width = 36
    game_map_height = 18
    ball_speed = 1
    player_paddle_speed = 0.2
    opponent_paddle_speed = 1

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ball = {'x': 18, 'y': 9}  # Center of the map
        self.player_paddle = {'x': -1, 'y': 9}  # Left side center
        self.opponent_paddle = {'x': 35, 'y': 9}  # Right side center
        self.ball_direction = random.choice([(1, 1), (1, -1), (-1, 1), (-1, -1)])  # Random initial direction
        self.score = {'player': 0, 'opponent': 0}
        self.running = False

    async def connect(self):
        await self.accept()
        self.running = True
        asyncio.create_task(self.game_loop())

    async def disconnect(self, close_code):
        self.running = False

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        print("message received: " + text_data)

        if action == 'move_up':
            self.move_paddle('up')
        elif action == 'move_down':
            self.move_paddle('down')

    async def game_loop(self):
        while self.running:
            await asyncio.sleep(0.05)  # Control the game loop speed
            self.update_game_state()
            await self.send_game_state()

    def move_paddle(self, direction):
        if direction == 'up':
            self.player_paddle['y'] = max(0, self.player_paddle['y'] + self.player_paddle_speed)
        elif direction == 'down':
            self.player_paddle['y'] = min(self.game_map_height - 1, self.player_paddle['y'] - self.player_paddle_speed)

    def update_game_state(self):
        # Update ball position
        self.ball['x'] += self.ball_direction[0] * self.ball_speed
        self.ball['y'] += self.ball_direction[1] * self.ball_speed

        # Ball collision with top and bottom
        if self.ball['y'] <= 0 or self.ball['y'] >= self.game_map_height - 1:
            self.ball_direction = (self.ball_direction[0], -self.ball_direction[1])  # Bounce

        # Ball collision with paddles
        if self.ball['x'] <= 1 and self.player_paddle['y'] - 1 <= self.ball['y'] <= self.player_paddle['y'] + 1:
            self.ball_direction = (1, self.ball_direction[1])  # Bounce towards right
        elif self.ball['x'] >= 34 and self.opponent_paddle['y'] - 1 <= self.ball['y'] <= self.opponent_paddle['y'] + 1:
            self.ball_direction = (-1, self.ball_direction[1])  # Bounce towards left
        elif self.ball['x'] < 0:
            # Player missed the ball
            self.score['opponent'] += 1
            self.reset_game()
        elif self.ball['x'] > self.game_map_width:
            # Opponent missed the ball
            self.score['player'] += 1
            self.reset_game()

        # AI movement for opponent paddle
        if self.ball['y'] < self.opponent_paddle['y']:
            self.opponent_paddle['y'] -= self.opponent_paddle_speed
        elif self.ball['y'] > self.opponent_paddle['y']:
            self.opponent_paddle['y'] += self.opponent_paddle_speed
        # Keep opponent paddle within bounds
        self.opponent_paddle['y'] = max(0, min(self.game_map_height - 1, self.opponent_paddle['y']))

    def reset_game(self):
        self.ball = {'x': 18, 'y': 9}
        self.player_paddle = {'x': 0, 'y': 9}
        self.opponent_paddle = {'x': 35, 'y': 9}
        self.ball_direction = random.choice([(1, 1), (1, -1), (-1, 1), (-1, -1)])

    async def send_game_state(self):
        game_state = {
            "ball": f"{self.ball['x']},{self.ball['y']}",
            "player_paddle": f"{self.player_paddle['x']},{self.player_paddle['y']}",
            "opponent_paddle": f"{self.opponent_paddle['x']},{self.opponent_paddle['y']}",
            "score": f"{self.score['player']},{self.score['opponent']}"
        }
        await self.send(json.dumps(game_state))

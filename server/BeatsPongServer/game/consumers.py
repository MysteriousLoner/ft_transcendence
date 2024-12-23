import asyncio, json, random, math
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
ballSpeed = 0.04
min_speed = ballSpeed - 0.005
max_speed = ballSpeed + 0.005

waitTime = 3
run = False

# Game mechanics class -----------------------------------------------------
class PongGameConsumer(AsyncWebsocketConsumer):
    waiting_players = []

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
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
            'speedX': random.uniform(min_speed, max_speed) * random.choice([-1, 1]),
            'speedY': random.uniform(min_speed, max_speed) * random.choice([-1, 1]),
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
            'ArrowDown': False,
            'AI_L': False,
            'AI_R': False,
            'AI_Mode': False,
        }

        self.running = False
        self.ai_last_refresh_time = 0
        self.ai_refresh_interval = 1
        self.AI_target = 0
        self.predicted_target = 0

    async def connect(self):
        await self.accept()
        PongGameConsumer.waiting_players.append(self)
        self.running = True
        asyncio.create_task(self.game_loop())

    async def disconnect(self, close_code):
        self.running = False

    async def receive(self, text_data):
        data = json.loads(text_data)
        f_keys = data.get('keys')

        self.keys['AI_L'] = f_keys['AI_L']
        self.keys['AI_R'] = f_keys['AI_R']
        self.keys['AI_Mode'] = f_keys['AI_Mode']

        if self.keys['AI_L'] is False:
            self.keys['w'] = f_keys['w']
            self.keys['s'] = f_keys['s']

        if self.keys['AI_R'] is False:
            self.keys['ArrowUp'] = f_keys['ArrowUp']
            self.keys['ArrowDown'] = f_keys['ArrowDown']



    def predict_ball_position(self, mode):
        # Nerf AI
        if mode == False:
            self.predicted_target = self.ball['y']
            return
        
        # Unbeatable AI
        if mode == True:
            if self.ball['speedX'] > 0:
                ball_distance_to_wall = (self.cuboid['width'] / 2) - self.ball['x']
            else:
                ball_distance_to_wall = -(self.cuboid['width'] / 2) - self.ball['x']
            time_to_wall = ball_distance_to_wall / (self.ball['speedX'])

            # print(f"Distance to wall: {ball_distance_to_wall:.2f} Time to wall: {time_to_wall:.2f}", end='\r')

            predicted_y = self.ball['y'] + (time_to_wall * self.ball['speedY'])

            # Modify when prediction is out of bounds
            if predicted_y > self.cuboid['height'] / 2:
                predicted_y = (self.cuboid['height'] / 2) - (predicted_y - self.cuboid['height'] / 2)
            elif predicted_y < -self.cuboid['height'] / 2:
                predicted_y = (-self.cuboid['height'] / 2) + (-self.cuboid['height'] / 2 - predicted_y)

            self.predicted_target = predicted_y


    async def game_loop(self):
        target_interval = 1/60
        while self.running:
            start_time = asyncio.get_event_loop().time()
            self.update_game_state()

            if self.keys['AI_L'] is True:
                await self.AI_Control('Left')
            if self.keys['AI_R'] is True:
                await self.AI_Control('Right')

            await self.send_game_state()
            elapsed_time = asyncio.get_event_loop().time() - start_time
            sleep_time = max(0, target_interval - elapsed_time)
            await asyncio.sleep(sleep_time)

    def update_game_state(self):
        # Update ball position
        self.ball['x'] += self.ball['speedX']
        self.ball['y'] += self.ball['speedY']
        self.move_paddles()
        self.update_ball_position()
        self.predict_ball_position(self.keys['AI_Mode'])

    def update_ball_position(self):
        steps = 10
        step_size_x = self.ball['speedX'] / steps
        step_size_y = self.ball['speedY'] / steps

        for _ in range(steps):
            self.ball['x'] += step_size_x
            self.ball['y'] += step_size_y

            if self.wall_collision() or self.paddle_collision():
                break

    def move_paddles(self):
        if self.keys['w'] and self.leftPaddle['y'] < (self.cuboid['height'] / 2 - self.leftPaddle['height'] / 2):
            self.leftPaddle['y'] += leftPaddleSpeed
        elif self.keys['s'] and self.leftPaddle['y'] > (-self.cuboid['height'] / 2 + self.leftPaddle['height'] / 2):
            self.leftPaddle['y'] -= leftPaddleSpeed

        if self.keys['ArrowUp'] and self.rightPaddle['y'] < (self.cuboid['height'] / 2 - self.rightPaddle['height'] / 2):
            self.rightPaddle['y'] += rightPaddleSpeed
        elif self.keys['ArrowDown'] and self.rightPaddle['y'] > (-self.cuboid['height'] / 2 + self.rightPaddle['height'] / 2):
            self.rightPaddle['y'] -= rightPaddleSpeed


    def wall_collision(self):
        # Ball collision with cuboid top edges
        if self.ball['y'] + self.ball['radius'] > self.cuboid['height'] / 2 or self.ball['y'] - self.ball["radius"] < -self.cuboid['height'] / 2:
            self.ball['speedY'] = -self.ball['speedY']
            return True
        # Ball collision with cuboid side edges
        elif self.ball['x'] + self.ball['radius'] > self.cuboid['width'] / 2:
            self.score['left'] += 1
            self.reset_game()
            return True
        elif self.ball['x'] - self.ball['radius'] < -self.cuboid['width'] / 2:
            self.score['right'] += 1
            self.reset_game()
            return True
        return False


    def paddle_collision(self):
        # Ball collision with paddles
        if self.ball['x'] - self.ball['radius'] < self.leftPaddle['x'] + self.leftPaddle['width'] / 2 and \
                self.leftPaddle['y'] - (self.leftPaddle['height'] / 2) < self.ball['y'] < self.leftPaddle['y'] + (self.leftPaddle['height'] / 2):
            self.ball_impact_physics()
            return True

        elif self.ball['x'] + self.ball["radius"] > self.rightPaddle['x'] - self.rightPaddle['width'] / 2 and \
                self.rightPaddle['y'] - (self.rightPaddle['height'] / 2) < self.ball['y'] < self.rightPaddle['y'] + (self.rightPaddle['height'] / 2):
            self.ball_impact_physics()
            return True
        return False
    
    def adjust_ball_speed(self, change, vector):
        if vector == 'x':
            if self.ball['speedX'] > 0:
                self.ball['speedX'] += change
            else:
                self.ball['speedX'] -= change
        elif vector == 'y':
            if self.ball['speedY'] > 0:
                self.ball['speedY'] += change
            else:
                self.ball['speedY'] -= change
    
    def ball_impact_physics(self):
        """ If paddle hits the ball when moving up, the ball reflect angle increases 10%. And vice versa. """
        if self.keys['w'] or self.keys['ArrowUp']:
            paddle_movement = 'up'
        elif self.keys['s'] or self.keys['ArrowDown']:
            paddle_movement = 'down'
        else:
            paddle_movement = 'none'

        # If padddle is moving in the direction of the ball, decrease vertical, increase horizontal speed of the ball.
        if (paddle_movement == 'up' and self.ball['speedY'] > 0) or (paddle_movement == 'down' and self.ball['speedY'] < 0):
            self.adjust_ball_speed(-0.01, 'y')
            self.adjust_ball_speed(0.01, 'x')
        
        # If padddle is moving in the opposite direction of the ball, increase the verticle, decrease horizontal speed of the ball.
        elif (paddle_movement == 'up' and self.ball['speedY'] < 0) or (paddle_movement == 'down' and self.ball['speedY'] > 0):
            self.adjust_ball_speed(0.01, 'y')
            self.adjust_ball_speed(-0.01, 'x')

        self.ball['speedX'] = -self.ball['speedX']
            

    async def AI_Control(self, side):

        # Refresh AI target every 1 second
        current_time = asyncio.get_event_loop().time()
        if current_time - self.ai_last_refresh_time >= self.ai_refresh_interval:
            self.AI_target = self.predicted_target
            self.ai_last_refresh_time = current_time

        # side = right
        paddle_side = self.rightPaddle
        up_key = 'ArrowUp'
        down_key = 'ArrowDown'
        ball_towards_paddle = self.ball['speedX'] > 0

        if side == 'Left':
            paddle_side = self.leftPaddle
            up_key = 'w'
            down_key = 's'
            ball_towards_paddle = self.ball['speedX'] < 0

        if ball_towards_paddle:
            if abs(self.AI_target - paddle_side['y']) < 0.1:
                self.keys[up_key] = False
                self.keys[down_key] = False
            elif self.AI_target > paddle_side['y']:
                self.keys[up_key] = True
                self.keys[down_key] = False
            elif self.AI_target < paddle_side['y']:
                self.keys[up_key] = False
                self.keys[down_key] = True

    def reset_game(self):
        self.ball['x'] = 0
        self.ball['y'] = 0
        self.ball['speedX'] = random.uniform(min_speed, max_speed) * random.choice([-1, 1])
        self.ball['speedY'] = random.uniform(min_speed, max_speed) * random.choice([-1, 1])

        # self.leftPaddle['y'] = 0
        # self.rightPaddle['y'] = 0

    async def send_game_state(self):
        paddle = self.rightPaddle['x']
        if self.ball['speedX'] < 0:
            paddle = self.leftPaddle['x']

        game_state = {
            "cuboid": f"{self.cuboid['width']:.2f},{self.cuboid['height']:.2f},{self.cuboid['depth']:.2f}",
            "ball": f"{self.ball['radius']:.2f},{self.ball['x']:.2f},{self.ball['y']:.2f},{self.ball['z']:.2f}",
            "paddle_dimensions": f"{paddleWidth:.2f},{paddleHeight:.2f},{paddleDepth:.2f}",
            "leftPaddle": f"{self.leftPaddle['x']:.2f},{self.leftPaddle['y']:.2f},{self.leftPaddle['z']:.2f}",
            "rightPaddle": f"{self.rightPaddle['x']:.2f},{self.rightPaddle['y']:.2f},{self.rightPaddle['z']:.2f}",
            "score": f"{self.score['left']},{self.score['right']}",
            "ballTarget": f"{paddle:.2f},{self.AI_target},{0}",
            "ballSpeed": f"{self.ball['speedX']:.4f},{self.ball['speedY']:.4f}",
        }

        # print(f"\r{json.dumps(self.keys['AI_toggle'])}", end='')  # Print the game state in the same line
        await self.send(text_data=json.dumps(game_state))

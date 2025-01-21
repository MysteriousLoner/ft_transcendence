import asyncio, random
from channels.layers import get_channel_layer
from BPDAL.views import update_match_data
from concurrent.futures import ThreadPoolExecutor
from BPDAL.views import async_query_profile_data
import threading


'''
This class is an object to represent an instance of a running game in regular mode.
It consists of an independant game container and a channel that connects 2 websocket connections of 2 players

Constructor builds the object with 3 arguements: room_name, player1 and player2
1. a channel group will be initiated, and the websockets passed in as player1 and player2 will be added to the group.
2. Game starts afterwards.

Note: AsyncJsonWebsocketConsumer is used. No need to dump.
'''

class TourneyGame:
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

    def __init__(self, room_name, player1, player2, channelLayer, player1Username, player2Username):
        self.game_mode = "Tourney"

        # make usernames local
        self.executor = ThreadPoolExecutor(max_workers=10)
        self.player1Username = player1Username
        self.player2Username = player2Username
        self.player1DisplayName = self.getProfileData(player1Username)
        self.player2DisplayName = self.getProfileData(player2Username)
        print(f"Player 1: {self.player1Username} vs Player 2: {self.player2Username}", flush=True)
        self.winner = None

        # identity of the room "I identify as a ......."
        self.room_name = room_name
        self.channelLayer = channelLayer
        # identifies if the game is running
        self.running = False

        self.player1 = player1
        self.player2 = player2

        # identifies the name of the websocket sending message
        if ("final" in room_name):
            self.channel1_name = player1
            self.channel2_name = player2
        else:
            self.channel1_name = player1.channel_name
            self.channel2_name = player2.channel_name
        self.tourneyWinnerChannel = None

        # Initialize game state and game objects
        self.cuboid = {
            'width': TourneyGame.cuboidWidth,
            'height': TourneyGame.cuboidHeight,
            'depth': TourneyGame.cuboidDepth
        }
        self.leftPaddle = {
            'width': TourneyGame.paddleWidth,
            'height': TourneyGame.paddleHeight,
            'depth': TourneyGame.paddleDepth,
            'x': -TourneyGame.cuboidWidth / 2,
            'y': 0,
            'z': 0
        }
        self.rightPaddle = {
            'width': TourneyGame.paddleWidth,
            'height': TourneyGame.paddleHeight,
            'depth': TourneyGame.paddleDepth,
            'x': TourneyGame.cuboidWidth / 2,
            'y': 0,
            'z': 0
        }
        self.ball = {
            'radius': TourneyGame.ballRadius,
            'speedX': random.choice([-TourneyGame.ballSpeed, TourneyGame.ballSpeed]),
            'speedY': random.choice([-TourneyGame.ballSpeed, TourneyGame.ballSpeed]),
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
            'ai_lvl': 'easy' # Default AI level is easy
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
        f_keys = content.get('keys')

        self.keys['w'] = f_keys['w']
        self.keys['s'] = f_keys['s']

        if sender_channel == self.channel1_name:
            if self.keys['w'] and self.leftPaddle['y'] < (self.cuboid['height'] / 2 - self.leftPaddle['height'] / 2):
                self.leftPaddle['y'] += self.leftPaddleSpeed
            elif self.keys['s'] and self.leftPaddle['y'] > (-self.cuboid['height'] / 2 + self.leftPaddle['height'] / 2):
                self.leftPaddle['y'] -= self.leftPaddleSpeed

        elif sender_channel == self.channel2_name:
            if self.keys['w'] and self.rightPaddle['y'] < (self.cuboid['height'] / 2 - self.rightPaddle['height'] / 2):
                self.rightPaddle['y'] += self.rightPaddleSpeed
            elif self.keys['s'] and self.rightPaddle['y'] > (-self.cuboid['height'] / 2 + self.rightPaddle['height'] / 2):
                self.rightPaddle['y'] -= self.rightPaddleSpeed

# Game State Functions Set ------------------------------------------------------------------------------------------------------------

    def update_game_state(self):
        # Update ball position
        self.ball['x'] += self.ball['speedX']
        self.ball['y'] += self.ball['speedY']
        # self.move_paddles()
        self.update_ball_position()
        self.predict_ball_position(self.keys['ai_lvl'])

    def update_ball_position(self):
        steps = 10
        step_size_x = self.ball['speedX'] / steps
        step_size_y = self.ball['speedY'] / steps

        for _ in range(steps):
            self.ball['x'] += step_size_x
            self.ball['y'] += step_size_y

            if self.wall_collision() or self.paddle_collision():
                break
    
    # left side channel is self.channel1_name
    # right side channel is self.channel2_name
    def checkWinCondition(self):
        if self.score['left'] == 5: 
            print(f"Player 1: {self.player1Username} wins!", flush=True)
            self.running = False
            self.winner = self.player1Username
            self.tourneyWinnerChannel = self.channel1_name
            if not self.game_mode == 'AI':
                self.run_in_thread(update_match_data, self.player1Username, self.player2Username)
            return True
        if self.score['right'] == 5:
            print(f"Player 2: {self.player2Username} wins!", flush=True)
            self.running = False
            self.winner = self.player2Username
            self.tourneyWinnerChannel = self.channel2_name
            if not self.game_mode == 'AI':
                self.run_in_thread(update_match_data, self.player2Username, self.player1Username)
            return True
        print("no one wins", flush=True)
        return False
    
    def run_in_thread(self, func, *args): 
        loop = asyncio.get_event_loop() 
        return loop.run_in_executor(self.executor, func, *args)
    
    def wall_collision(self):
        # Ball collision with cuboid top edges
        if self.ball['y'] + self.ball['radius'] > self.cuboid['height'] / 2 or self.ball['y'] - self.ball["radius"] < -self.cuboid['height'] / 2:
            self.ball['speedY'] = -self.ball['speedY']
            return True
        # Ball collision with cuboid side edges
        elif self.ball['x'] + self.ball['radius'] > self.cuboid['width'] / 2:
            self.score['left'] += 1
            if not self.checkWinCondition():
                self.reset_game()
            return True
        elif self.ball['x'] - self.ball['radius'] < -self.cuboid['width'] / 2:
            self.score['right'] += 1
            if not self.checkWinCondition():
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
    
    def ball_impact_physics(self):
        """ If paddle hits the ball when moving up, the ball reflect angle increases 5%. And vice versa. """
        if self.keys['w'] or self.keys['ArrowUp']:
            paddle_movement = 'up'
        elif self.keys['s'] or self.keys['ArrowDown']:
            paddle_movement = 'down'
        else:
            paddle_movement = 'none'

        # If padddle is moving in the direction of the ball, decrease vertical, increase horizontal speed of the ball.
        if (paddle_movement == 'up' and self.ball['speedY'] > 0) or (paddle_movement == 'down' and self.ball['speedY'] < 0):
            self.adjust_ball_speed(-0.005, 'y')
            self.adjust_ball_speed(0.005, 'x')
        
        # If padddle is moving in the opposite direction of the ball, increase the verticle, decrease horizontal speed of the ball.
        elif (paddle_movement == 'up' and self.ball['speedY'] < 0) or (paddle_movement == 'down' and self.ball['speedY'] > 0):
            self.adjust_ball_speed(0.005, 'y')
            self.adjust_ball_speed(-0.005, 'x')

        self.ball['speedX'] = -self.ball['speedX']

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

# End of Game State Functions Set ------------------------------------------------------------------------------------------------------------

# AI Functions Set ---------------------------------------------------------------------------------------------------------------------------
    def predict_ball_position(self, mode):
        if mode == 'easy':
            self.predicted_target = self.ball['y']
            return
        
        if mode == 'hard':
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

    async def AI_Control(self, side):

        # Refresh AI target every 1 second
        current_time = asyncio.get_event_loop().time()
        if current_time - self.ai_last_refresh_time >= self.ai_refresh_interval:
            self.AI_target = self.predicted_target
            self.ai_last_refresh_time = current_time

        # Right side by default
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

# End of AI Functions Set --------------------------------------------------------------------------------------------------------------------------

    async def handle_player_disconnect(self, player):
        if player.channel_name == self.channel1_name:
            print(f"Player 1: {self.player1Username} disconnected", flush=True)
            self.running = False
            self.winner = self.player2Username
            if not self.game_mode == 'AI':
                self.run_in_thread(update_match_data, self.player2Username, self.player1Username)
        elif player.channel_name == self.channel2_name:
            print(f"Player 2: {self.player2Username} disconnected", flush=True)
            self.running = False
            self.winner = self.player1Username
            if not self.game_mode == 'AI':
                self.run_in_thread(update_match_data, self.player1Username, self.player2Username)
        await self.send_game_state()

    def reset_game(self):
        self.ball['x'] = 0
        self.ball['y'] = 0
        self.ball['speedX'] = random.choice([-TourneyGame.ballSpeed, TourneyGame.ballSpeed])
        self.ball['speedY'] = random.choice([-TourneyGame.ballSpeed, TourneyGame.ballSpeed])
        self.leftPaddle['y'] = 0
        self.rightPaddle['y'] = 0

    async def getProfileData(self, username):
        profileData = self.run_in_thread(async_query_profile_data, username)
        return profileData.get("displayName")
    
    async def send_game_state(self):
        # Determines which ball target to show
        paddle = self.rightPaddle['x']
        if self.ball['speedX'] < 0:
            paddle = self.leftPaddle['x']

        # todo: use the new information from the message to make a game over screen and display the player 1 and player 2 username on the respective sides
        game_state = {
            "cuboid": f"{self.cuboid['width']:.2f},{self.cuboid['height']:.2f},{self.cuboid['depth']:.2f}",
            "ball": f"{self.ball['radius']:.2f},{self.ball['x']:.2f},{self.ball['y']:.2f},{self.ball['z']:.2f}",
            "paddle_dimensions": f"{TourneyGame.paddleWidth:.2f},{TourneyGame.paddleHeight:.2f},{TourneyGame.paddleDepth:.2f}",
            "leftPaddle": f"{self.leftPaddle['x']:.2f},{self.leftPaddle['y']:.2f},{self.leftPaddle['z']:.2f}",
            "rightPaddle": f"{self.rightPaddle['x']:.2f},{self.rightPaddle['y']:.2f},{self.rightPaddle['z']:.2f}",
            "score": f"{self.score['left']},{self.score['right']}",
            "ballSpeed": f"{self.ball['speedX']:.4f},{self.ball['speedY']:.4f}",
            "running": self.running,
            "game_mode": self.game_mode,
            "player1": self.player1Username,
            "player2": self.player2Username,
            # "player1DisplayName": self.player1DisplayName,
            # "player2DisplayName": self.player2DisplayName,
            "winner": self.winner,
            "roomName": self.room_name
        }
        await self.channelLayer.group_send(
            self.room_name,
            {
                'type': 'game_message',
                'message': game_state,
                'tourneyWinnerChannel': {"self": self.tourneyWinnerChannel, "username": self.winner }
            }
        )

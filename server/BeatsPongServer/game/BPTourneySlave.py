import asyncio, random
from BPDAL.views import update_match_data
from concurrent.futures import ThreadPoolExecutor
from BPDAL.views import async_query_profile_data, update_game1_players, update_game2_players, update_tourney_winner
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
    paddleWidth = 0.2 * 1.2
    paddleHeight = 1.5 * 1.5
    paddleDepth = 0.25
    ballRadius = 0.125
    cameraZ = 10
    leftPaddleSpeed = 0.1
    rightPaddleSpeed = 0.1
    ballSpeed = 0.075
    waitTime = 3

    def __init__(self, room_name, player1, player2, channelLayer, player1Username, player2Username, player1DisplayName, player2DisplayName, gameId, autoWinPlayer):
        if player1Username == player2Username:
            print("Player 1 and Player 2 are the same", flush=True)
            return
        self.game_mode = "Tourney"
        self.gameId = gameId

        # make usernames local
        self.executor = ThreadPoolExecutor(max_workers=10)
        self.player1Username = player1Username
        self.player2Username = player2Username
        self.player1DisplayName = self.getProfileData(player1Username)
        self.player2DisplayName = self.getProfileData(player2Username)
        self.winnerDisplayName = None
        print(f"Player 1: {self.player1Username} vs Player 2: {self.player2Username}", flush=True)
        self.winner = None
        self.endMessageSent = False
        self.autoWinPlayer = autoWinPlayer

        # identity of the room "I identify as a ......."
        self.room_name = room_name
        self.channelLayer = channelLayer
        self.player1DisplayName = player1DisplayName
        self.player2DisplayName = player2DisplayName
        # identifies if the game is running
        self.running = False

        self.player1 = player1
        self.player2 = player2

        self.player1Disconnect = False
        self.player2Disconnect = False

        self.before_paddle_hit = True
        self.paddle_active = True

        self.winningScore = 5

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
            'speedX': random.choice([-TourneyGame.ballSpeed * 0.5, TourneyGame.ballSpeed * 0.5]),
            'speedY': random.choice([-TourneyGame.ballSpeed * 0.5, TourneyGame.ballSpeed * 0.5]),
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

        # flags for idempotency
        self.dbUpdated = False

    async def start_game(self):
        self.running = True
        # if self.autoWinPlayer is not None:
        #     print("autowin not none in slave", flush=True)
        #     print("currentRoomName", self.room_name, flush=True)
        #     self.winner = self.autoWinPlayer
        #     self.running = False
        #     await self.send_game_state()
        #     self.run_in_thread(tourney_win, self.autoWinPlayer)
        #     return
        await self.channelLayer.group_send(
            self.room_name,
            {
                'type': 'game_message',
                'message': {"event": "game_start"},
                'tourneyWinnerChannel': {"self": None }
            }
        )
        await self.game_loop()

    async def game_loop(self):
        target_interval = 1/60
        while self.running:
            start_time = asyncio.get_event_loop().time()
            self.update_game_state()
            await self.send_game_state()
            elapsed_time = asyncio.get_event_loop().time() - start_time
            sleep_time = max(0, target_interval - elapsed_time)
            await asyncio.sleep(sleep_time)

        # Ensure game stops running
        self.running = False

    async def receive_json(self, content, socket):
        # print("content received", content, flush=True)
        sender_channel = socket.channel_name
        # print("message received from channe: ", sender_channel, flush=True)
        f_keys = content.get('keys')

        self.keys['w'] = f_keys['w']
        self.keys['s'] = f_keys['s']

        if sender_channel == self.channel1_name:
            # print("message received from channel 1", flush=True)
            if self.keys['w'] and self.leftPaddle['y'] < (self.cuboid['height'] / 2 - self.leftPaddle['height'] / 4):
                self.leftPaddle['y'] += self.leftPaddleSpeed
            elif self.keys['s'] and self.leftPaddle['y'] > (-self.cuboid['height'] / 2 + self.leftPaddle['height'] / 4):
                self.leftPaddle['y'] -= self.leftPaddleSpeed

        elif sender_channel == self.channel2_name:
            # print("message received from channel 2", flush=True)
            if self.keys['w'] and self.rightPaddle['y'] < (self.cuboid['height'] / 2 - self.rightPaddle['height'] / 4):
                self.rightPaddle['y'] += self.rightPaddleSpeed
            elif self.keys['s'] and self.rightPaddle['y'] > (-self.cuboid['height'] / 2 + self.rightPaddle['height'] / 4):
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

            if self.paddle_collision() or self.wall_collision():
                break
    
    # left side channel is self.channel1_name
    # right side channel is self.channel2_name
    def checkWinCondition(self):
        if self.winner:
            return False
        if self.score['left'] == self.winningScore or self.winner == self.player1Username: 
            print(f"Player 1: {self.player1Username} wins!", flush=True)
            self.running = False
            self.winner = self.player1Username
            self.winnerDisplayName = self.player1DisplayName
            self.tourneyWinnerChannel = self.channel1_name
            if not self.game_mode == 'AI' and not self.dbUpdated:
                self.dbUpdated = True
                if "final" in self.room_name:
                    self.run_in_thread(update_tourney_winner, self.gameId, self.player1Username, self.player2Username)
                if "game1" in self.room_name:
                    self.run_in_thread(update_game1_players, self.gameId, self.player1Username, self.player2Username)
                elif "game2" in self.room_name:
                    self.run_in_thread(update_game2_players, self.gameId, self.player1Username, self.player2Username)
            return True
        if self.score['right'] == self.winningScore or self.winner == self.player2Username:
            print(f"Player 2: {self.player2Username} wins!", flush=True)
            self.running = False
            self.winner = self.player2Username
            self.winnerDisplayName = self.player2DisplayName
            self.tourneyWinnerChannel = self.channel2_name
            if not self.game_mode == 'AI' and not self.dbUpdated:
                self.dbUpdated = True
                if "final" in self.room_name:
                    self.run_in_thread(update_tourney_winner, self.gameId, self.player2Username, self.player1Username)
                if "game1" in self.room_name:
                    self.run_in_thread(update_game1_players, self.gameId, self.player2Username, self.player1Username)
                elif "game2" in self.room_name:
                    self.run_in_thread(update_game2_players, self.gameId, self.player2Username, self.player1Username)
            return True
        # print("no one wins", flush=True)
        return False
    
    def closeSockets(self):
        self.player1.close()
        self.player2.close()
    
    def run_in_thread(self, func, *args): 
        loop = asyncio.get_event_loop() 
        return loop.run_in_executor(self.executor, func, *args)
    
    def wall_collision(self):
        # Ball collision with cuboid top edges
        if self.ball['y'] + self.ball['radius'] > self.cuboid['height'] / 2 or self.ball['y'] - self.ball["radius"] < -self.cuboid['height'] / 2:
            self.ball['speedY'] *= -1
            return True
        
        # Ball passes the paddle without collision
        elif self.ball['x'] + self.ball['radius'] > self.cuboid['width'] / 2 * 1.5:
            self.score['left'] += 1
            if not self.checkWinCondition():
                self.reset_game()
            return True
        elif self.ball['x'] - self.ball['radius'] < -self.cuboid['width'] / 2 * 1.5:
            self.score['right'] += 1
            if not self.checkWinCondition():
                self.reset_game()
            return True

        # Let the ball pass the paddle until it reaches the end of the cuboid
        elif self.ball['x'] + self.ball['radius'] > self.rightPaddle['x'] - self.rightPaddle['width'] / 2:
            self.paddle_active = False
            return True
        elif self.ball['x'] - self.ball['radius'] < self.leftPaddle['x'] + self.leftPaddle['width'] / 2:
            self.paddle_active = False
            return True
        return False


    def paddle_collision(self):
        # Ball collision with paddles
        if self.paddle_active and self.ball['x'] - self.ball['radius'] < self.leftPaddle['x'] + self.leftPaddle['width'] / 2 and \
        self.leftPaddle['y'] - self.leftPaddle['height'] / 2 < self.ball['y'] + self.ball['radius'] and \
        self.ball['y'] - self.ball['radius'] < self.leftPaddle['y'] + self.leftPaddle['height'] / 2:
            self.ball_impact_physics()
            return True

        elif self.paddle_active and self.ball['x'] + self.ball["radius"] > self.rightPaddle['x'] - self.rightPaddle['width'] / 2 and \
            self.rightPaddle['y'] - self.rightPaddle['height'] / 2 < self.ball['y'] + self.ball['radius'] and \
            self.ball['y'] - self.ball['radius'] < self.rightPaddle['y'] + self.rightPaddle['height'] / 2:
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

        self.ball['speedX'] *= -1

        if self.before_paddle_hit is True:
            self.ball['speedX'] /= 0.5
            self.ball['speedY'] /= 0.5
            self.before_paddle_hit = False

        # If padddle is moving in the direction of the ball, decrease vertical, increase horizontal speed of the ball.
        if (paddle_movement == 'up' and self.ball['speedY'] > 0) or (paddle_movement == 'down' and self.ball['speedY'] < 0):
            self.adjust_ball_speed(-0.005, 'y')
            self.adjust_ball_speed(0.005, 'x')
        
        # If padddle is moving in the opposite direction of the ball, increase the verticle, decrease horizontal speed of the ball.
        elif (paddle_movement == 'up' and self.ball['speedY'] < 0) or (paddle_movement == 'down' and self.ball['speedY'] > 0):
            self.adjust_ball_speed(0.005, 'y')
            self.adjust_ball_speed(-0.005, 'x')


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
            self.tourneyWinnerChannel = self.channel2_name
            if not self.game_mode == 'AI' and not self.dbUpdated:
                self.dbUpdated = True
                if "final" in self.room_name:
                    self.run_in_thread(update_tourney_winner, self.gameId, self.player2Username, self.player1Username)
                if "game1" in self.room_name:
                    self.run_in_thread(update_game1_players, self.gameId, self.player2Username, self.player1Username)
                elif "game2" in self.room_name:
                    self.run_in_thread(update_game2_players, self.gameId, self.player2Username, self.player1Username)
        elif player.channel_name == self.channel2_name:
            print(f"Player 2: {self.player2Username} disconnected", flush=True)
            self.running = False
            self.winner = self.player1Username
            self.tourneyWinnerChannel = self.channel1_name
            if not self.game_mode == 'AI' and not self.dbUpdated:
                self.dbUpdated = True
                if "final" in self.room_name:
                    self.run_in_thread(update_tourney_winner, self.gameId, self.player1Username, self.player2Username)
                if "game1" in self.room_name:
                    self.run_in_thread(update_game1_players, self.gameId, self.player1Username, self.player2Username)
                elif "game2" in self.room_name:
                    self.run_in_thread(update_game2_players, self.gameId, self.player1Username, self.player2Username)
        await self.send_game_state()

    def reset_game(self):
        self.before_paddle_hit = True
        self.paddle_active = True
        self.ball['x'] = 0
        self.ball['y'] = 0
        self.ball['speedX'] = random.choice([-TourneyGame.ballSpeed * 0.5, TourneyGame.ballSpeed * 0.5])
        self.ball['speedY'] = random.choice([-TourneyGame.ballSpeed * 0.5, TourneyGame.ballSpeed * 0.5])
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
            "player1DisplayName": self.player1DisplayName,
            "player2DisplayName": self.player2DisplayName,
            "winner": self.winner,
            "winnerDisplayName": self.winnerDisplayName,
            "roomName": self.room_name,
            "gameId": self.gameId,
        }
        # print("game state", game_state, flush=True)
        # print("room name", self.room_name, flush=True)
        await self.channelLayer.group_send(
            self.room_name,
            {
                'type': 'game_message',
                'message': game_state,
                'tourneyWinnerChannel': {"self": None }

            }
        )
        if self.winner and not self.endMessageSent:
            self.endMessageSent = True
            await self.channelLayer.group_send(
            self.room_name,
            {
                'type': 'game_message',
                'message': game_state,
                'tourneyWinnerChannel': {"self": self.tourneyWinnerChannel, "username": self.winner, "gameId": self.gameId}
            }
            )
            self.endMessageSent = True

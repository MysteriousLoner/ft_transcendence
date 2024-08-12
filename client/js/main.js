// main.js
import { setupScene } from './scene.js';
import { createBall } from './ball.js';
import { createPaddles } from './paddle.js';
import { gameLoop } from './gameLogic.js';
import { listenInput } from './inputHandler.js';

setupScene();
createBall();
createPaddles();
listenInput();
gameLoop();
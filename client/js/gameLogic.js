// gameLogic.js
import { moveBall } from './ball.js';
import { movePaddle, moveAiPaddle } from './paddle.js';

export async function gameLoop() {
    moveBall();
    movePaddle();
    moveAiPaddle();

    requestAnimationFrame(gameLoop);
}
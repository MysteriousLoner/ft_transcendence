//main.js
import World from "./World.js";
import Paddle from "./Paddle.js";
import setupInputHandlers from './inputHandler.js';
import Ball from './Ball.js';
import AiPaddle from './AiPaddle.js';

document.addEventListener('DOMContentLoaded', () => {
    const world = new World();
    const paddle = new Paddle();
    const aiPaddle = new AiPaddle();
    aiPaddle.updateHitDirection(0);
    aiPaddle.updatePosition(0);
    const ball = new Ball(paddle, aiPaddle);
    let gameRunning = false;

    paddle.reference.position.set(-5, 0, 0);
    aiPaddle.reference.position.set(5, 0, 0);

    world.addObj(paddle.reference);
    world.addObj(aiPaddle.reference);
    world.addObj(ball.mesh);
    // Define the paddle's animation and bind the correct context
    const animatePaddle = paddle.animation.bind(paddle);

    // Add the paddle's animation to the world's animations
    world.addAnimation(animatePaddle);
    world.addAnimation(aiPaddle.animation.bind(aiPaddle));
    world.addAnimation(ball.update.bind(ball));

    // Start the animation loop
    world.setAnimationLoop();

    // Set up input handlers
    setupInputHandlers(paddle);

    gameRunning = true;
});
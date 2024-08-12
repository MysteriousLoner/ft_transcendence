import World from "./World.js";
import Paddle from "./Paddle.js";
import setupInputHandlers from './inputHandler.js';

const world = new World();
const paddle = new Paddle();

paddle.reference.position.set(-5, 0, 0);

world.addObj(paddle.reference);

// Define the paddle's animation and bind the correct context
const animatePaddle = paddle.animation.bind(paddle);

// Add the paddle's animation to the world's animations
world.addAnimation(animatePaddle);

// Start the animation loop
world.setAnimationLoop();

// Set up input handlers
setupInputHandlers(paddle);
class PongAI {
    constructor(paddle) {
        this.paddle = paddle;
    }

    update(ballPosition) {
        // Simple AI: move towards the ball's y position
        this.paddle.position.y += (ballPosition.y - this.paddle.position.y) * 0.1;
        
        // Ensure the paddle stays within bounds
        this.paddle.position.y = Math.max(Math.min(this.paddle.position.y, 250), -250);
    }
}

export default PongAI;
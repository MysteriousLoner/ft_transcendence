// inputHandler.js
export default function setupInputHandlers(paddle) {
    document.addEventListener('keydown', (event) => {
        switch(event.code) {
            case 'ArrowUp':
                paddle.updatePosition(0, 0.1, 0); // Move up
                break;
            case 'ArrowDown':
                paddle.updatePosition(0, -0.1, 0); // Move down
                break;
            case 'ArrowLeft':
                paddle.updatePosition(-0.1, 0, 0); // Move left
                break;
            case 'ArrowRight':
                paddle.updatePosition(0.1, 0, 0); // Move right
                break;
        }
    });
}
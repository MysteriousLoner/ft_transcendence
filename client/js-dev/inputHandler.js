// inputHandler.js
export default async function setupInputHandlers(paddle) {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'w') {
            paddle.isMovingUp = true;
        } else if (event.key === 's') {
            paddle.isMovingDown = true;
        } else if (event.key === 'a') {
            paddle.isAimingUp = true;
        } else if (event.key === 'd') {
            paddle.isAimingDown = true;
        } else if (event.key === 'Escape') {
            togglePause();
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === 'w') {
            paddle.isMovingUp = false;
        } else if (event.key === 's') {
            paddle.isMovingDown = false;
        } else if (event.key === 'a') {
            paddle.isAimingUp = false;
        } else if (event.key === 'd') {
            paddle.isAimingDown = false;
        }
    });
}
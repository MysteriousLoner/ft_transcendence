// inputHandler.js
export async function listenInput() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'w') {
            playerPaddleMovingUp = true;
        } else if (event.key === 's') {
            playerPaddleMovingDown = true;
        } else if (event.key === 'a') {
            playerHitDirectionLeft = true;
        } else if (event.key === 'd') {
            playerHitDirectionRight = true;
        } else if (event.key === 'Escape') {
            togglePause();
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === 'w') {
            playerPaddleMovingUp = false;
        } else if (event.key === 's') {
            playerPaddleMovingDown = false;
        } else if (event.key === 'a') {
            playerHitDirectionLeft = false;
        } else if (event.key === 'd') {
            playerHitDirectionRight = false;
        }
    });
}
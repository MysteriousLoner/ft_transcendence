function updateScore(playerScore, aiScore) {
    document.getElementById('score').innerText = `Player: ${playerScore} | AI: ${aiScore}`;
}

function showGameOver(result) {
    document.getElementById('result').innerText = result;
    document.getElementById('gameOver').style.display = 'block';
}

function hideGameOver() {
    document.getElementById('gameOver').style.display = 'none';
}
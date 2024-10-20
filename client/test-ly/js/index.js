document.addEventListener("DOMContentLoaded", function() {
    const nameInput = document.getElementById('nameInput');
    const startButton = document.getElementById('startButton');

    nameInput.addEventListener('input', function() {
        // If the input is not empty or just spaces, show the button
        if (nameInput.value.trim() !== '') {
            startButton.classList.remove('hidden');
        } else {
            startButton.classList.add('hidden');
        }
    });

    document.addEventListener("DOMContentLoaded", function() {
        const nameInput = document.getElementById('nameInput');
        const startButton = document.getElementById('startButton');
    
        nameInput.addEventListener('input', function() {
            // If the input is not empty or just spaces, show the button
            if (nameInput.value.trim() !== '') {
                startButton.classList.remove('hidden');
            } else {
                startButton.classList.add('hidden');
            }
        });
    
        startButton.addEventListener('click', function() {
            // Redirect to game.html
            window.location.href = 'game.html';
        });
    });
});

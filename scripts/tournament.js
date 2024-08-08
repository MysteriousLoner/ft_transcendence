class Tournament {
    constructor(startGameCallback) {
        this.players = [];
        this.brackets = [];
        this.currentMatch = null;
        this.startGameCallback = startGameCallback;
        this.updateBracketsDisplay = null;
        this.currentRound = 0;
        this.isMatchInProgress = false;
    }

    initTournament(playerCount) {
        // Reset tournament data
        this.players = [];
        this.brackets = [];
        this.currentMatch = null;
        this.currentRound = 0;
        this.isMatchInProgress = false;

        // Create player entry form
        let form = document.createElement('form');
        form.id = 'tournamentForm';
        for (let i = 0; i < playerCount; i++) {
            let input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Player ${i + 1} name`;
            input.required = true;
            input.classList.add('form-control', 'mb-2');
            form.appendChild(input);
        }
        let submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.textContent = 'Start Tournament';
        submitBtn.classList.add('btn', 'btn-primary');
        form.appendChild(submitBtn);

        // Add form to the page
        let container = document.getElementById('tournamentSetup');
        container.innerHTML = '';
        container.appendChild(form);

        // Handle form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.players = Array.from(form.querySelectorAll('input')).map(input => input.value);
            this.generateBrackets();
            this.displayBrackets();
            container.style.display = 'none'; // Hide the form
            this.startNextMatch();
        });
    }

    generateBrackets() {
        this.brackets = [this.players];
        while (this.brackets[this.brackets.length - 1].length > 1) {
            let currentRound = this.brackets[this.brackets.length - 1];
            let nextRound = [];
            for (let i = 0; i < currentRound.length; i += 2) {
                if (i + 1 < currentRound.length) {
                    nextRound.push(null);  // Placeholder for winner
                } else {
                    nextRound.push(currentRound[i]);  // Odd player gets a bye
                }
            }
            this.brackets.push(nextRound);
        }
    }

    displayBrackets() {
        if (this.updateBracketsDisplay) {
            this.updateBracketsDisplay(this.brackets);
        }
    }

    startNextMatch() {
        if (this.isMatchInProgress) return;

        // Find the next match to play
        for (let i = this.currentRound; i < this.brackets.length - 1; i++) {
            for (let j = 0; j < this.brackets[i].length; j += 2) {
                if (this.brackets[i][j] && this.brackets[i][j+1] && this.brackets[i+1][j/2] === null) {
                    this.currentMatch = {
                        round: i,
                        position: j,
                        players: [this.brackets[i][j], this.brackets[i][j+1]]
                    };
                    this.isMatchInProgress = true;
                    // Start the game with these two players
                    this.startGameCallback('tournament', this.currentMatch.players);
                    return;
                }
            }
            this.currentRound = i + 1;  // Move to next round if current round is complete
        }
        // If we get here, the tournament is over
        this.endTournament();
    }

    updateBracket(winner) {
        if (this.currentMatch && this.isMatchInProgress) {
            this.brackets[this.currentMatch.round + 1][this.currentMatch.position / 2] = winner;
            this.displayBrackets();
            this.currentMatch = null;
            this.isMatchInProgress = false;
            setTimeout(() => this.startNextMatch(), 2000); // Add a delay before starting the next match
        }
    }

    endTournament() {
        const winner = this.brackets[this.brackets.length - 1][0];
        alert(`Tournament ended! The winner is ${winner}`);
        // Return to main menu or show final results
        document.getElementById('tournamentSetup').style.display = 'none';
        document.getElementById('bracketDisplay').style.display = 'none';
        document.getElementById('startMenu').style.display = 'block';
    }

    isTournamentComplete() {
        return this.currentRound >= this.brackets.length - 1;
    }
}

export default Tournament;
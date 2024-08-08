class Leaderboard {
    constructor() {
        this.leaderboardKey = 'pongLeaderboard';
    }

    saveScore(nickname, score) {
        const leaderboard = this.getLeaderboard();
        leaderboard.push({ nickname, score });
        leaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem(this.leaderboardKey, JSON.stringify(leaderboard.slice(0, 10)));
    }

    getLeaderboard() {
        return JSON.parse(localStorage.getItem(this.leaderboardKey)) || [];
    }

    displayLeaderboard() {
        const leaderboard = this.getLeaderboard();
        const leaderboardBody = document.getElementById('leaderboardBody');
        leaderboardBody.innerHTML = '';
        
        leaderboard.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.nickname}</td>
                <td>${entry.score}</td>
            `;
            leaderboardBody.appendChild(row);
        });
    }
}

// Export the Leaderboard class
export default Leaderboard;
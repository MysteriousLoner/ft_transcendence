
import makeRequest from "./utils/requestWrapper.js";


const userData1 = {
    username: "JohnDoe",
    profilePicture: "https://example.com/profile.jpg",
    friendList: ["leeyang2004", "etlaw", "folim", "David", "Eve", "Frank", "Grace", "Henry", "Ivy", "Jack"],
    winRate: 65.5
};

const friendRequests = ["Kevin", "Liam"];

const allUsers = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Henry", "Ivy", "Jack", "Kevin", "Liam", "Mike", "Nancy", "Oscar", "Patty", "Quinn", "Rachel", "Sam", "Tom"];

let currentPage = 1;
let currentNewPage = 1;
const friendsPerPage = 5;

// Initialize the page
async function initPage(name) {

	const req = { username : name };
	const userData = await makeRequest("GET", "api/auth/user");
    document.getElementById("username").textContent = userData.username;
    document.getElementById("profilePicture").src = userData.profilePicture;
    updateWinRate(userData.winRate);
    
    updateFriendList();
    updateFriendRequests();

    // Add event listeners for game buttons
    document.getElementById("vanillaPong").addEventListener("click", playVanillaPong);
    document.getElementById("friendsPong").addEventListener("click", playFriendsPong);

    // Add event listeners for pagination
    document.getElementById("prevPage").addEventListener("click", () => changePage(-1));
    document.getElementById("nextPage").addEventListener("click", () => changePage(1));
    document.getElementById("prevNewPage").addEventListener("click", () => changeNewPage(-1));
    document.getElementById("nextNewPage").addEventListener("click", () => changeNewPage(1));
}

// Update win rate
function updateWinRate(winRate) {
    document.getElementById("winRate").textContent = winRate.toFixed(1);
    document.getElementById("winRateProgress").style.width = `${winRate}%`;
}

// Update friend list
function updateFriendList() {
    const friendsList = document.getElementById("friendsList");
    friendsList.innerHTML = "";
    
    const startIndex = (currentPage - 1) * friendsPerPage;
    const endIndex = startIndex + friendsPerPage;
    const displayedFriends = userData.friendList.slice(startIndex, endIndex);

    displayedFriends.forEach(friend => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${friend}</span>
            <div>
                <button class="invite-friend" onclick="inviteFriend('${friend}')">Invite</button>
                <button class="delete-friend" onclick="deleteFriend('${friend}')">Delete</button>
            </div>
        `;
        friendsList.appendChild(li);
    });

    updatePagination(userData.friendList.length, currentPage, "currentPage", "prevPage", "nextPage");
}

// Update pagination
function updatePagination(totalItems, currentPageNum, currentPageId, prevPageId, nextPageId) {
    const totalPages = Math.ceil(totalItems / friendsPerPage);
    document.getElementById(currentPageId).textContent = `${currentPageNum} / ${totalPages}`;
    document.getElementById(prevPageId).disabled = currentPageNum === 1;
    document.getElementById(nextPageId).disabled = currentPageNum === totalPages;
}

// Change page
function changePage(direction) {
    const totalPages = Math.ceil(userData.friendList.length / friendsPerPage);
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    updateFriendList();
}

// Change new friends page
function changeNewPage(direction) {
    const totalPages = Math.ceil(filteredNewFriends.length / friendsPerPage);
    currentNewPage += direction;
    if (currentNewPage < 1) currentNewPage = 1;
    if (currentNewPage > totalPages) currentNewPage = totalPages;
    displayNewFriends();
}

// Update friend requests
function updateFriendRequests() {
    const requestsList = document.getElementById("friendRequests");
    requestsList.innerHTML = "";
    friendRequests.forEach(friend => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${friend}</span>
            <button onclick="acceptFriend('${friend}')">Accept</button>
        `;
        requestsList.appendChild(li);
    });
}

// Search friends
function searchFriends() {
    const searchTerm = document.getElementById("friendSearch").value.toLowerCase();
    const filteredFriends = userData.friendList.filter(friend => 
        friend.toLowerCase().includes(searchTerm)
    );
    
    const friendsList = document.getElementById("friendsList");
    friendsList.innerHTML = "";
    
    const startIndex = (currentPage - 1) * friendsPerPage;
    const endIndex = startIndex + friendsPerPage;
    const displayedFriends = filteredFriends.slice(startIndex, endIndex);

    displayedFriends.forEach(friend => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${friend}</span>
            <div>
                <button class="invite-friend" onclick="inviteFriend('${friend}')">Invite</button>
                <button class="delete-friend" onclick="deleteFriend('${friend}')">Delete</button>
            </div>
        `;
        friendsList.appendChild(li);
    });

    currentPage = 1;
    updatePagination(filteredFriends.length, currentPage, "currentPage", "prevPage", "nextPage");
}

// Accept friend request
function acceptFriend(friend) {
    userData.friendList.push(friend);
    friendRequests.splice(friendRequests.indexOf(friend), 1);
    updateFriendList();
    updateFriendRequests();
}

// Delete friend
function deleteFriend(friend) {
    const index = userData.friendList.indexOf(friend);
    if (index > -1) {
        userData.friendList.splice(index, 1);
        updateFriendList();
    }
}

// Invite friend
function inviteFriend(friend) {
    alert(`Invited ${friend} to play a game!`);
    // Add code here to handle the game invitation
}

// Play Vanilla Pong
function playVanillaPong() {
    alert("Starting Vanilla Pong game...");
    // Add code here to start the Vanilla Pong game
}

// Play Friends Pong
function playFriendsPong() {
    alert("Starting Friends Pong game...");
    // Add code here to start the Friends Pong game
}

// Search new friends
let filteredNewFriends = [];
function searchNewFriends() {
    const searchTerm = document.getElementById("addFriendSearch").value.toLowerCase();
    filteredNewFriends = allUsers.filter(user => 
        user.toLowerCase().includes(searchTerm) && !userData.friendList.includes(user)
    );
    currentNewPage = 1;
    displayNewFriends();
}

// Display new friends
function displayNewFriends() {
    const newFriendsList = document.getElementById("newFriendsList");
    newFriendsList.innerHTML = "";
    
    const startIndex = (currentNewPage - 1) * friendsPerPage;
    const endIndex = startIndex + friendsPerPage;
    const displayedNewFriends = filteredNewFriends.slice(startIndex, endIndex);

    displayedNewFriends.forEach(friend => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${friend}</span>
            <button class="add-friend-button" onclick="addFriend('${friend}')">Add Friend</button>
        `;
        newFriendsList.appendChild(li);
    });

    updatePagination(filteredNewFriends.length, currentNewPage, "currentNewPage", "prevNewPage", "nextNewPage");
}

// Add friend
function addFriend(friend) {
    if (!userData.friendList.includes(friend)) {
        userData.friendList.push(friend);
        updateFriendList();
        alert(`${friend} has been added to your friend list!`);
    } else {
        alert(`${friend} is already in your friend list.`);
    }
    searchNewFriends(); // Refresh the new friends list
}

// Initialize the page when the DOM is loaded
document.addEventListener("DOMContentLoaded", initPage);


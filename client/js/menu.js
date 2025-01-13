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

let friendList = [];
let userName = "";

// Initialize the page
async function initPage(inputUser) {

	userName = inputUser;
	const req = { username: userName };
	console.log(req);
	try {
		const userData = await makeRequest('POST', 'api/menu/getProfileData/', req);
		document.getElementById("username").textContent = userName;
		document.getElementById("profilePicture").src = userData.profilePicture;
		updateWinRate(userData.winRate);
	}
	catch (error) {
		console.error('Error:', error);
	}

	updateFriendList();
	updateFriendRequests();

	// edit modal
	document.getElementById('profilePicture').addEventListener('click', openEditProfileModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeEditProfileModal);
    document.getElementById('profileImageUpload').addEventListener('change', handleImageUpload);
    document.getElementById('uploadImageBtn').addEventListener('click', () => document.getElementById('profileImageUpload').click());
    document.getElementById('saveUsernameBtn').addEventListener('click', saveUsername);
}

// Update win rate
function updateWinRate(winRate) {
	document.getElementById("winRate").textContent = winRate.toFixed(1);
	document.getElementById("winRateProgress").style.width = `${winRate}%`;
}

// Update friend list
async function updateFriendList() {
	const friendsList = document.getElementById("friendsList");
	friendsList.innerHTML = "";

	const startIndex = (currentPage - 1) * friendsPerPage;
	const endIndex = startIndex + friendsPerPage;

	const req = { username: userName };
	try {
		friendList = await makeRequest('POST', 'api/menu/getFriendList/', req);
		console.log(friendList);
	}
	catch (error) {
		console.error('Error:', error);
	}

	if (friendList.length > 0) {
		const displayedFriends = friendList.slice(startIndex, endIndex);
		// const displayedFriends = userData.friendList.slice(startIndex, endIndex);

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
	}
	else {
		console.log('No friends found');
	}

	updatePagination(friendList.length, currentPage, "currentPage", "prevPage", "nextPage");
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

function openEditProfileModal() {
    document.getElementById('editProfileModal').style.display = 'block';
}

function closeEditProfileModal() {
    document.getElementById('editProfileModal').style.display = 'none';
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profileImagePreview').src = e.target.result;
            document.getElementById('profilePicture').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

function saveUsername() {
    const newUsername = document.getElementById('usernameInput').value;
    if (newUsername) {
        userData.username = newUsername;
        document.getElementById('username').textContent = newUsername;
        closeEditProfileModal();
    } else {
        alert('Please enter a valid username');
    }
}

export default initPage;

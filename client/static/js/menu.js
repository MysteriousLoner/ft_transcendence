import makeRequest from "./utils/requestWrapper.js";


const userData1 = {
	username: "JohnDoe",
	profilePicture: "https://example.com/profile.jpg",
	friendList: ["leeyang2004", "etlaw", "folim", "David", "Eve", "Frank", "Grace", "Henry", "Ivy", "Jack"],
	winRate: 65.5
};

const friendRequests = ["Kevin", "Liam"];

let currentPage = 1;
let currentNewPage = 1;
const friendsPerPage = 5;

let friendList = [];
let userName = "";
let userData = {};
let profilePicture = {};


// Initialize the page
async function initPage(inputUser) {

	document.getElementById("prevPage").addEventListener("click", () => changePage(-1));
	document.getElementById("nextPage").addEventListener("click", () => changePage(1));
	// document.getElementById("prevNewPage").addEventListener("click", () => changeNewPage(-1));
	// document.getElementById("nextNewPage").addEventListener("click", () => changeNewPage(1));


	// get profile data
	userName = inputUser;
	const req = { username: userName };
	console.log(req);
	try {
		userData = await makeRequest('POST', 'api/account/getProfileData/', req);
		document.getElementById("usernameTitle1").textContent = userData.username;
		document.getElementById("displaynameTitle").textContent = userData.displayName;
		updateWinRate(userData.winRate);
	}
	catch (error) {
		console.error('Error:', error);
	}


	// get profile picture
	try {
		profilePicture = await makeRequest('POST', 'api/account/getProfilePicture/', req);
		document.getElementById("profilePictureMenu1").src = profilePicture.image;
	}
	catch (error) {
		console.error('Error:', error);
	}


	updateFriendList();
	updateFriendRequests();

	// edit modal
	document.getElementById('profilePictureMenu1').addEventListener('click', openEditProfileModal);
	document.getElementById('closeModalBtn').addEventListener('click', closeEditProfileModal);
	document.getElementById('profileImageUpload').addEventListener('change', handleImageUpload);
	document.getElementById('uploadImageBtn').addEventListener('click', () => document.getElementById('profileImageUpload').click());
	document.getElementById('saveUsernameBtn').addEventListener('click', saveUsername);

	document.getElementById('addNewFriend').addEventListener('click', addNewFriend);
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

	// const req = { username: userName };
	try {
		// friendList = await makeRequest('POST', 'api/account/getFriendList/', req);
		friendList = userData.friendList | [];
		// console.log(friendList);
	}
	catch (error) {
		console.error('Error:', error);
	}

	if (friendList.length > 0) {
		const displayedFriends = friendList.slice(startIndex, endIndex);

		displayedFriends.forEach(friend => {
			const li = document.createElement("li");
			li.innerHTML = `
            <span>${friend}</span>
            <div>
                <button class="invite-friend"">Invite</button>
                <button class="delete-friend">Delete</button>
            </div>
        `;
			friendsList.appendChild(li);
			li.querySelector(".invite-friend").addEventListener("click", () => inviteFriend(friend));
			li.querySelector(".delete-friend").addEventListener("click", () => deleteFriend(friend));
		});

	}
	else {
		console.log('No friends found');
	}

	updatePagination(friendList.length, currentPage, "currentPage", "prevPage", "nextPage");
}

// Update pagination
function updatePagination(totalItems, currentPageNum, currentPageId, prevPageId, nextPageId) {
	const totalPages = Math.ceil(totalItems / friendsPerPage) | 1;
	document.getElementById(currentPageId).textContent = `${currentPageNum} / ${totalPages}`;
	document.getElementById(prevPageId).disabled = currentPageNum === 1;
	document.getElementById(nextPageId).disabled = currentPageNum === totalPages;
}

// Change page
function changePage(direction) {
	const totalPages = Math.ceil(userData1.friendList.length / friendsPerPage);
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

	const friendRequests = userData.pendingRequests | [];

	if (friendRequests.length > 0) {
		friendRequests.forEach(friend => {
			const li = document.createElement("li");
			li.innerHTML = `
            <span>${friend}</span>
            <button onclick="acceptFriend('${friend}')">Accept</button>
        `;
			requestsList.appendChild(li);
		});
	}
	else {
		console.log('No friend requests found');
	}
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
async function addNewFriend() {
	const searchTerm = document.getElementById("addFriendSearch").value;

	if (searchTerm === "") {
		alert("Please enter a username to search.");
		return;
	}
	try {
		const response = await makeRequest('POST', 'api/friends/sendFriendRequest/', { selfUsername: userName, targetUsername: searchTerm });

		if (response.error) {
			alert(response.error);
		}
	}
	catch (error) {
		alert('Add Friend Error:', error);
	}


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
// function addFriend(friend) {
// 	if (!userData.friendList.includes(friend)) {
// 		userData.friendList.push(friend);
// 		updateFriendList();
// 		alert(`${friend} has been added to your friend list!`);
// 	} else {
// 		alert(`${friend} is already in your friend list.`);
// 	}
// 	searchNewFriends(); // Refresh the new friends list
// }

async function openEditProfileModal() {
	profilePicture = await makeRequest('POST', 'api/account/getProfilePicture/', { username: userData.username });
	const profileImagePreview = document.getElementById('profileImagePreview'); // Get the image preview element
	profileImagePreview.src = profilePicture.image // Default image source
	document.getElementById('editProfileModal').style.display = 'block';
}

async function closeEditProfileModal() {
	profilePicture = await makeRequest('POST', 'api/account/getProfilePicture/', { username: userData.username });
	document.getElementById("profilePictureMenu1").src = profilePicture.image;
	document.getElementById('editProfileModal').style.display = 'none';

	userData = await makeRequest('POST', 'api/account/getProfileData/', { username: userData.username });
}


function handleImageUpload(event) {
	const file = event.target.files[0]; // Get the uploaded file
	const profileImagePreview = document.getElementById('profileImagePreview'); // Get the image preview element
	const defaultSrc = profilePicture.image // Default image source

	if (file) {
		console.log("File selected:", file.name); // Log the name of the selected file
		const reader = new FileReader(); // Create a FileReader object
		reader.onload = async function (e) {
			console.log("File read successfully."); // Log when the file is read successfully
			profileImagePreview.src = e.target.result; // Set the image preview to the uploaded file
			const response = await makeRequest('POST', 'api/account/updateProfilePicture/', { username: userData.username, image: e.target.result });
		}
		reader.readAsDataURL(file); // Read the file as a data URL
	} else {
		console.log("No file selected, using default image."); // Log when no file is selected
		profileImagePreview.src = defaultSrc; // Set to default image if no file is selected
	}
}


async function saveUsername() {
	const newUsername = document.getElementById('usernameInput').value;
	if (newUsername) {
		userData.displayName = newUsername;
		document.getElementById('displaynameTitle').textContent = newUsername;
		try {
			const response = await makeRequest('POST', 'api/account/updateDisplayName/', { username: userData.username, displayName: newUsername });
			console.log(response.message);
		}
		catch (error) {
			console.error('Change Dispaly name error:', error);
		}
		closeEditProfileModal();
	} else {
		alert('Please enter a valid display Name');
	}
}

export default initPage;

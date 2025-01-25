import makeRequest from "./utils/requestWrapper.js";


const exampleUserData = {
	username: "JohnDoe",
	profilePicture: "https://example.com/profile.jpg",
	friendList: ["leeyang2004", "etlaw", "folim", "David", "Eve", "Frank", "Grace", "Henry", "Ivy", "Jack"],
	winRate: 65.5
};


let currentPage = 1;
let currentNewPage = 1;
const friendsPerPage = 5;

let friendList = [];
let friendRequests = [];
let userName = "";
let userData = {};
let profilePicture = {};


// Initialize the page
async function initPage(inputUser) {

	document.getElementById("prevPage").addEventListener("click", () => changePage(-1));
	document.getElementById("nextPage").addEventListener("click", () => changePage(1));
	document.getElementById("prevNewPage").addEventListener("click", () => changeNewPage(-1));
	document.getElementById("nextNewPage").addEventListener("click", () => changeNewPage(1));


	// get profile data
	userName = inputUser;
	const req = { username: userName };
	console.log(req);
	try {
		userData = await makeRequest('POST', 'api/account/getProfileData/', req);
		document.getElementById("usernameTitle1").textContent = userData.username;
		document.getElementById("displaynameTitle").textContent = userData.displayName;
		document.getElementById("totalMatch").textContent = userData.totalMatches;
		document.getElementById("loseMatch").textContent = userData.matchesLost;
		document.getElementById("winMatch").textContent = userData.matchesWon;
		document.getElementById("TourneyMatches").textContent = userData.tourneyMatches;
		document.getElementById("TourneyMatchesWon").textContent = userData.tourneyMatchesWon;
		document.getElementById("TourneyMatchesLost").textContent = userData.tourneyMatchesLost;
		document.getElementById("winRate").textContent = userData.winRate.toFixed(1);
		document.getElementById("winRateProgress").style.width = `${userData.winRate}%`;
		document.getElementById("tourneyWinRate").textContent = userData.tourneyWinRate.toFixed(1);
		document.getElementById("tourneyProgress").style.width = `${userData.tourneyWinRate}%`;
		console.log(userData);
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

	document.getElementById('addNewFriend').addEventListener('click', addNewFriend);
	document.getElementById('searchFriends').addEventListener('click', searchFriends);

	document.getElementById('refresh').addEventListener('click', refresh);
	document.getElementById('closeInfo').addEventListener('click', closeFriendProfileModal);
}

// Update friend list
async function updateFriendList() {

	const friendsList = document.getElementById("friendsList");
	friendsList.innerHTML = "";

	const startIndex = (currentPage - 1) * friendsPerPage;
	const endIndex = startIndex + friendsPerPage;


	friendList = userData.friendList || [];

	if (friendList.length > 0) {
		const displayedFriends = friendList.slice(startIndex, endIndex);

		displayedFriends.forEach(friend => {
			const li = document.createElement("li");
			li.innerHTML = `
            <span>${friend}</span>
            <div>
				<button class="info-button">Info</button>
                <button class="delete-friend">Delete</button>
            </div>
        `;
			friendsList.appendChild(li);
			li.querySelector(".info-button").addEventListener("click", () => openFriendProfileModal(friend));
			li.querySelector(".delete-friend").addEventListener("click", () => deleteFriend(friend));
		});

	}
	else {
		console.log('No friends found');
	}

	updatePagination(friendList.length, currentPage, "currentPage", "prevPage", "nextPage");
}

// Update friend requests
function updateFriendRequests() {
	const requestsList = document.getElementById("friendRequests");
	requestsList.innerHTML = "";

	const startIndex = (currentNewPage - 1) * friendsPerPage;
	const endIndex = startIndex + friendsPerPage;

	friendRequests = userData.pendingRequests || [];

	if (friendRequests.length > 0) {

		const displayedRequests = friendRequests.slice(startIndex, endIndex);
		displayedRequests.forEach(friend => {
			const li = document.createElement("li");
			li.innerHTML = `
			<span>${friend}</span>
			<button class="accept-friend">Accept</button>
			<button class="decline-friend">Decline</button>
		`;
			requestsList.appendChild(li);
			li.querySelector(".accept-friend").addEventListener("click", () => acceptFriend(friend));
			li.querySelector(".decline-friend").addEventListener("click", () => declineFriend(friend));
		});
	}
	else {
		console.log('No friend requests found');
	}

	updatePagination(friendRequests.length, currentNewPage, "currentNewPage", "prevNewPage", "nextNewPage");
}


// Update pagination
function updatePagination(totalItems, currentPageNum, currentPageId, prevPageId, nextPageId) {
	const totalPages = Math.ceil(totalItems / friendsPerPage) || 1;
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
	const totalPages = Math.ceil(userData.pendingRequests.length / friendsPerPage);
	currentNewPage += direction;
	if (currentNewPage < 1) currentNewPage = 1;
	if (currentNewPage > totalPages) currentNewPage = totalPages;
	updateFriendRequests();
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
				<button class="info-button">Info</button>
                <button class="delete-friend">Delete</button>
            </div>
        `;
		friendsList.appendChild(li);
		li.querySelector(".info-button").addEventListener("click", () => openFriendProfileModal(friend));
		li.querySelector(".delete-friend").addEventListener("click", () => deleteFriend(friend));
	});

	currentPage = 1;
	updatePagination(filteredFriends.length, currentPage, "currentPage", "prevPage", "nextPage");
}

// Accept friend request
async function acceptFriend(friend) {

	try {
		const response = await makeRequest('POST', 'api/friends/acceptFriendRequest/', { selfUsername: userName, targetUsername: friend });
		if (response.error) {
			alert(response.error);
			return;
		}
		alert('Friend request from ' + friend + ' accepted');
		userData.friendList.push(friend);
		userData.pendingRequests.splice(userData.pendingRequests.indexOf(friend), 1);
		updateFriendList();
		updateFriendRequests();
	}
	catch (error) {
		console.error('Accept Friend Error:', error);
	}
}

async function declineFriend(friend) {

	try {
		const response = await makeRequest('POST', 'api/friends/declineFriendRequest/', { selfUsername: userName, targetUsername: friend });
		if (response.error) {
			alert(response.error);
			return;
		}
		userData.pendingRequests.splice(userData.pendingRequests.indexOf(friend), 1);
		alert('Friend request from ' + friend + ' declined');
		updateFriendRequests();
	}
	catch (error) {
		console.error('Decline Friend Error:', error);
	}
}

// Delete friend
async function deleteFriend(friend) {
	try {
		const response = await makeRequest('POST', 'api/friends/removeFriend/', { selfUsername: userName, targetUsername: friend });
		if (response.error) {
			alert(response.error);
			return;
		}
		alert('Friend: ' + friend + ' removed');
		const index = userData.friendList.indexOf(friend);
		if (index > -1) {
			userData.friendList.splice(index, 1);
			updateFriendList();
		}
	} catch (error) {
		console.error('Delete Friend Error:', error);
	}
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
		else {
			alert('Friend request sent to ' + searchTerm);
		}
	}
	catch (error) {
		alert('Add Friend Error:', error);
	}


}

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


async function refresh() {
	userData = await makeRequest('POST', 'api/account/getProfileData/', { username: userData.username });
	updateFriendRequests();
	updateFriendList();
}


async function openFriendProfileModal(friend) {
	const modal = document.getElementById("friendProfileModal")
	const friendProfilePicture = document.getElementById("friendProfilePicture")
	const friendUsername = document.getElementById("friendUsername")
	const friendDisplayName = document.getElementById("friendDisplayName")
	const friendWinRate = document.getElementById("friendWinRate")
	const friendWinRateProgress = document.getElementById("friendWinRateProgress")
	const totalMatches = document.getElementById("friendMatchPlayed")
	const winMatches = document.getElementById("friendMatchWon")
	const loseMatches = document.getElementById("friendMatchLost")
	const friendTourneyMatches = document.getElementById("friendTourneyMatches")
	const friendTourneyMatchesWon = document.getElementById("friendTourneyMatchesWon")
	const friendTourneyMatchesLost = document.getElementById("friendTourneyMatchesLost")
	const tourneyWinRate = document.getElementById("friendTourneyWinRate")
	const friendTourneyProgress = document.getElementById("friendTourneyProgress")
  

	const friendData = await makeRequest('POST', 'api/account/getProfileData/', { username: friend })
	const friendProfilePictureData = await makeRequest('POST', 'api/account/getProfilePicture/', { username: friend })
  
	friendProfilePicture.src = friendProfilePictureData.image
	friendUsername.textContent = friendData.username
	friendDisplayName.textContent = friendData.displayName
	friendWinRate.textContent = friendData.winRate.toFixed(1)
  	friendWinRateProgress.style.width = `${friendData.winRate}%`
	totalMatches.textContent = friendData.totalMatches
	winMatches.textContent = friendData.matchesWon
	loseMatches.textContent = friendData.matchesLost
	friendTourneyMatches.textContent = friendData.tourneyMatches
	friendTourneyMatchesLost.textContent = friendData.tourneyMatchesLost
	friendTourneyMatchesWon.textContent = friendData.tourneyMatchesWon
	tourneyWinRate.textContent = friendData.tourneyWinRate.toFixed(1)
	friendTourneyProgress.style.width = `${friendData.tourneyWinRate}%`
  
	modal.style.display = "block"
  }
  
  function closeFriendProfileModal() {
	const modal = document.getElementById("friendProfileModal")
	modal.style.display = "none"
  }
export default initPage;

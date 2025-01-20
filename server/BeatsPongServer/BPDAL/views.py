from django.views.decorators.csrf import csrf_exempt
from .models import ProfileData, VerificationCode, FriendRequestList, ProfilePicture
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from asgiref.sync import sync_to_async


'''
Functions that interact with the database
Functions are pretty much self explainatory based on their function names.
No additional logic should be present in this module, keep them at the controller layer
Strictly insert, query, update and delete only.
'''

# registration funcitons
# creates a user object
def create_user(username, email, password):
    user = User.objects.create_user(
        username=username, 
        email=email, 
    )
    user.password = password
    user.save()

    profileData = ProfileData.objects.create(
        username=username,
    )
    profileData.save()

    friendRequestList = FriendRequestList.objects.create(
        username=username,
    )
    friendRequestList.save()

    profilePicture = ProfilePicture.objects.create(
        username=username,
    )
    profilePicture.save()

    return user

# user object functions
def query_user(username):
    try:
        user = User.objects.get(username=username)
        return user
    except ObjectDoesNotExist:
        return None

# verification code
def create_verification_code(username, email, code, password, expDate):
    codeObj = VerificationCode.objects.create(
        username = username,
        code = code,
        expriarationDate = expDate,
        password = password,
        email = email,
    )
    return codeObj

# used to search created verification code
def query_verification_code(username):
    try:
        codeObj = VerificationCode.objects.filter(username=username).first()
        return codeObj
    except ObjectDoesNotExist:
        return None

# used to delete verification code after verification
def remove_verification_code(username):
    while True: 
        try:
            code = VerificationCode.objects.get(username=username)
            print(f"Deleting verification code for {username}", flush=True)
            code.delete()
        except VerificationCode.DoesNotExist:
            print(f"No more codes for {username}", flush=True)
            break

# profile data functions
def create_profile(username, profilePicture):
    profile = ProfileData.objects.create(
        username=username,
        profilePicture=profilePicture,
    )
    return profile

def query_profile_data(username):
    try:
        profileData = ProfileData.objects.get(username=username)
        return profileData
    except ObjectDoesNotExist:
        return None
    
# @sync_to_async
def async_query_profile_data(username):
    try:
        profileData = ProfileData.objects.get(username=username)
        return profileData
    except ObjectDoesNotExist:
        return None

# @sync_to_async
def update_match_data(winnerUsername, loserUsername):
    print(f"Updating match data for {winnerUsername} and {loserUsername}", flush=True)
    try:
        winnerProfileData = async_query_profile_data(winnerUsername)
        loserProfileData = async_query_profile_data(loserUsername)

        # update data for winner first
        winnerProfileData.matchesPlayed += 1
        winnerProfileData.matchesWon += 1
        winnerProfileData.winRate = winnerProfileData.matchesWon / winnerProfileData.matchesPlayed * 100
        winnerProfileData.save()

        # update data for loser
        loserProfileData.matchesPlayed += 1
        loserProfileData.matchesLost += 1
        loserProfileData.winRate = loserProfileData.matchesWon / loserProfileData.matchesPlayed * 100
        loserProfileData.save()

        print(f"Updated match data for {winnerUsername} and {loserUsername}", flush=True)
        print(f"Winner: {winnerProfileData.matchesPlayed} {winnerProfileData.matchesWon} {winnerProfileData.winRate}", flush=True)
        print(f"Loser: {loserProfileData.matchesPlayed} {loserProfileData.matchesLost} {loserProfileData.winRate}", flush=True)
        return
    except ObjectDoesNotExist:
        print(f"Error updating match data for {winnerUsername} and {loserUsername}", flush=True)
        return None
    
# profile picture functions
def query_profile_picture(username):
    try:
        profilePicture = ProfilePicture.objects.get(username=username)
        return profilePicture
    except ProfilePicture.DoesNotExist:
        return None

def create_profile_picture(username, image):
    profilePicture = ProfilePicture.objects.create(
        username=username,
        image=image,
    )
    return profilePicture

def update_profile_picture(username, newProfilePicture):
    try:
        profilePic = ProfilePicture.objects.get(username=username)
        profilePic.image = newProfilePicture
        profilePic.save()
    except ObjectDoesNotExist:
        return None

# friend functions
def add_friend(username, friend_username):
    try:
        profile = ProfileData.objects.get(username=username)
        if friend_username not in profile.friendList:
            profile.friendList.append(friend_username)
            profile.save()
        return profile
    except ProfileData.DoesNotExist:
        return None

def remove_friend(username, friend_username):
    try:
        profile = ProfileData.objects.get(username=username)
        if friend_username in profile.friendList:
            profile.friendList.remove(friend_username)
            profile.save()
        return profile
    except ProfileData.DoesNotExist:
        return None

def send_friend_request(username, friend_username):
    try:
        profile = ProfileData.objects.get(username=username)
        if friend_username not in profile.pendingRequests:
            profile.pendingRequests.append(friend_username)
            profile.save()
        return profile
    except ProfileData.DoesNotExist:
        return None
    
def accept_friend_request(username, friend_username):
    try:
        profile = ProfileData.objects.get(username=username)
        if friend_username in profile.pendingRequests:
            profile.pendingRequests.remove(friend_username)
            profile.friendList.append(friend_username)
            profile.save()
        return profile
    except ProfileData.DoesNotExist:
        return None
    
def decline_friend_request(username, friend_username):
    try:
        profile = ProfileData.objects.get(username=username)
        if friend_username in profile.pendingRequests:
            profile.pendingRequests.remove(friend_username)
            profile.save()
        return profile
    except ProfileData.DoesNotExist:
        return None
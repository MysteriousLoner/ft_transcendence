from django.views.decorators.csrf import csrf_exempt
from .models import ProfileData, VerificationCode, FriendRequestList, ProfilePicture
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User

'''
Functions that interact with the database
Functions are pretty much self explainatory based on their function names.
No additional logic should be present in this module, keep them at the controller layer
Strictly insert, query, update and delete only.
'''

# Query funcitons
def query_profile_data(username):
    try:
        profileData = ProfileData.objects.get(username=username)
        return profileData
    except ObjectDoesNotExist:
        return None
    
def query_verification_code(username):
    try:
        codeObj = VerificationCode.objects.filter(username=username).first()
        return codeObj
    except ObjectDoesNotExist:
        return None
    
def query_user(username):
    try:
        user = User.objects.get(username=username)
        return user
    except ObjectDoesNotExist:
        return None
    
def query_friend_request_list(username):
    try:
        friendRequestList = FriendRequestList.objects.get(username=username)
        return friendRequestList
    except FriendRequestList.DoesNotExist:
        return None
    
def query_profile_picture(username):
    try:
        profilePicture = ProfilePicture.objects.get(username=username)
        return profilePicture
    except ProfilePicture.DoesNotExist:
        return None
    
# insert functions
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

def create_profile(username, profilePicture):
    profile = ProfileData.objects.create(
        username=username,
        profilePicture=profilePicture,
    )
    return profile

def create_profile_picture(username, image):
    profilePicture = ProfilePicture.objects.create(
        username=username,
        image=image,
    )
    return profilePicture

def create_verification_code(username, email, code, password, expDate):
    codeObj = VerificationCode.objects.create(
        username = username,
        code = code,
        expriarationDate = expDate,
        password = password,
        email = email,
    )
    return codeObj

def create_friend_request_list(username):
    try:
        friendRequestList = FriendRequestList.objects.create(username=username)
        return friendRequestList
    except FriendRequestList.DoesNotExist:
        return None

# update functions
def update_profile_picture(username, newProfilePicture):
    try:
        profilePic = ProfilePicture.objects.get(username=username)
        profilePic.image = newProfilePicture
        profilePic.save()
    except ObjectDoesNotExist:
        return None
    
def update_win_rate(username, newWinRate):
    try:
        profile = ProfileData.objects.get(username=username)
        profile.winRate = newWinRate
        profile.save()
        return profile
    except ObjectDoesNotExist:
        return None
    
def add_friend(username, friend_username):
    try:
        profile = ProfileData.objects.get(username=username)
        if friend_username not in profile.friendList:
            profile.friendList.append(friend_username)
            profile.save()
        return profile
    except ProfileData.DoesNotExist:
        return None
    
def add_friend_request(username, friend_username):
    try:
        friendRequestList = FriendRequestList.objects.get(username=username)
        if friend_username not in friendRequestList.pendingRequests:
            friendRequestList.pendingRequests.append(friend_username)
            friendRequestList.save()
        return friendRequestList
    except FriendRequestList.DoesNotExist:
        return None
    
def remove_friend_request(username, friend_username):
    try:
        friendRequestList = FriendRequestList.objects.get(username=username)
        if friend_username in friendRequestList.pendingRequests:
            friendRequestList.pendingRequests.remove(friend_username)
            friendRequestList.save()
        return friendRequestList
    except FriendRequestList.DoesNotExist:
        return None
    
# delete functions
def remove_friend(username, friend_username):
    try:
        profile = ProfileData.objects.get(username=username)
        if friend_username in profile.friendList:
            profile.friendList.remove(friend_username)
            profile.save()
        return profile
    except ProfileData.DoesNotExist:
        return None

def remove_verification_code(username):
    while True: 
        try:
            code = VerificationCode.objects.get(username=username)
            print(f"Deleting verification code for {username}", flush=True)
            code.delete()
        except VerificationCode.DoesNotExist:
            print(f"No more codes for {username}", flush=True)
            break

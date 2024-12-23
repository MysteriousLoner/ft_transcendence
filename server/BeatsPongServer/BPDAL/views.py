from django.views.decorators.csrf import csrf_exempt
from .models import ProfileData, VerificationCode
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
        codeObj = VerificationCode.objects.get(username=username)
        return codeObj
    except ObjectDoesNotExist:
        return None
    
def query_user(username):
    try:
        user = User.objects.get(username=username)
        return user
    except ObjectDoesNotExist:
        return None
    
# insert functions
def create_user(username, email, password):
    user = User.objects.create_user(
        username=username, 
        email=email, 
    )
    user.password = password
    user.save()
    return user

def create_profile(username, profilePicture):
    profile = ProfileData.objects.create(
        username=username,
        profilePicture=profilePicture,
    )
    return profile

def create_verification_code(username, email, code, password, expDate):
    codeObj = VerificationCode.objects.create(
        username = username,
        code = code,
        expriarationDate = expDate,
        password = password,
        email = email,
    )
    return codeObj

# update functions
def update_profile_picture(username, newProfilePicture):
    try:
        profile = ProfileData.objects.get(username=username)
        profile.profilePicture = newProfilePicture
        profile.save()
        return profile
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
    try:
        codeObj = VerificationCode.objects.get(username=username)
        codeObj.delete()
    except VerificationCode.DoesNotExist:
        return None
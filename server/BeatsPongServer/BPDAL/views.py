from django.views.decorators.csrf import csrf_exempt
from .models import ProfileData
from django.core.exceptions import ObjectDoesNotExist

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
    
# insert functions
def create_profile(username, profilePicture):
    profile = ProfileData.objects.create(
        username=username,
        profilePicture=profilePicture,
    )
    return profile

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

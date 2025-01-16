from django.urls import path
from .views import getFriendList, sendFriendRequest, rejectFriendRequest, getProfileData, getProfilePicture, update_profile_picture, updateDisplayName

urlpatterns = [
    path('getFriendList/', getFriendList, name='getFriendList'),
    path('sendFriendRequest/', sendFriendRequest, name='sendFriendRequest'),
    path('rejectFriendRequest/', rejectFriendRequest, name='rejectFriendRequest'),
    path('getProfileData/', getProfileData, name='getProfileData'),
    path('getProfilePicture/', getProfilePicture, name='getProfilePicture'),
    path('updateProfilePicture/', update_profile_picture, name='updateProfilePicture'),
    path('updateDisplayName/', updateDisplayName, name='updateDisplayName'),
]

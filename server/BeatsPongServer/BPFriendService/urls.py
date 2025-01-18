from django.urls import path
from .views import getFriendList, sendFriendRequest, rejectFriendRequest, getProfileData, getProfilePicture, updateProfilePicture, updateDisplayName

urlpatterns = [
    path('getFriendList/', getFriendList, name='getFriendList'),
    path('sendFriendRequest/', sendFriendRequest, name='sendFriendRequest'),
    path('rejectFriendRequest/', rejectFriendRequest, name='rejectFriendRequest'),
    path('getProfileData/', getProfileData, name='getProfileData'),
    path('getProfilePicture/', getProfilePicture, name='getProfilePicture'),
    path('updateProfilePicture/', updateProfilePicture, name='updateProfilePicture'),
    path('updateDisplayName/', updateDisplayName, name='updateDisplayName'),
]

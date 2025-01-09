from django.urls import path
from .views import getFriendList, sendFriendRequest, rejectFriendRequest, getProfileData

urlpatterns = [
    path('getFriendList/', getFriendList, name='getFriendList'),
    path('sendFriendRequest/', sendFriendRequest, name='sendFriendRequest'),
    path('rejectFriendRequest/', rejectFriendRequest, name='rejectFriendRequest'),
    path('getProfileData/', getProfileData, name='getProfileData'),
]

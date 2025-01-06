from django.urls import path
from .views import getFriendList, addFriend, removeFriend

urlpatterns = [
    path('getFriendList/', getFriendList, name='getFriendList'),
    path('addFriend/', addFriend, name='addFriend'),
    path('removeFriend/', removeFriend, name='removeFriend'),
]

from django.urls import path
from .views import removeFriend, sendFriendRequest, acceptFriendRequest, declineFriendRequest

urlpatterns = [
    path('removeFriend/', removeFriend, name='removeFriend'),
    path('sendFriendRequest/', sendFriendRequest, name='sendFriendRequest'),
    path('acceptFriendRequest/', acceptFriendRequest, name='acceptFriendRequest'),
    path('declineFriendRequest/', declineFriendRequest, name='declineFriendRequest')
]

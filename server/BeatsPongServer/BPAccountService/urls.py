from django.urls import path
from .views import getProfileData, getProfilePicture, updateProfilePicture, updateDisplayName

urlpatterns = [
    path('getProfileData/', getProfileData, name='getProfileData'),
    path('getProfilePicture/', getProfilePicture, name='getProfilePicture'),
    path('updateProfilePicture/', updateProfilePicture, name='updateProfilePicture'),
    path('updateDisplayName/', updateDisplayName, name='updateDisplayName'),
]
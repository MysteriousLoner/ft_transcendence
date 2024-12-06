from django.urls import path
from .views import create_user, get_user_by_username

urlpatterns = [
    path('create/', create_user, name='create_user'),
    path('get/<str:username>/', get_user_by_username, name='get_user_by_username'),
]

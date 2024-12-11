from django.urls import path
from .views import create_user, login

urlpatterns = [
    path('create/', create_user, name='create_user'),
    path('login/',login, name='login'),
]

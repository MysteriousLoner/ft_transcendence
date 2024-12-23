from django.urls import path
from .views import create_user, login, verify_code

urlpatterns = [
    path('create/', create_user, name='create_user'),
    path('login/',login, name='login'),
    path('verify/', verify_code, name='verify')
]

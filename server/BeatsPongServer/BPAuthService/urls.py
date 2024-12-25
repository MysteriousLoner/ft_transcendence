from django.urls import path
from .views import register_user, login, verify_code

urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('login/',login, name='login'),
    path('verify/', verify_code, name='verify')
]

from django.urls import path
from django.urls import re_path
from . import views
from .consumers import PongGameConsumer

urlpatterns = [
    path('test', views.test),
    re_path('ws/game/pong$', PongGameConsumer.as_asgi()),
]
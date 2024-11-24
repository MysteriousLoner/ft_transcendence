from django.urls import path, re_path
from . import views
from .consumers import PongGameConsumer

app_name = 'game'

urlpatterns = [
    re_path('ws/game/pong$', PongGameConsumer.as_asgi()),
]
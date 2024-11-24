from django.urls import re_path
from .consumers import PongGameConsumer  # You'll need to create this consumers.py file

websocket_urlpatterns = [
    re_path('ws/game/pong$', PongGameConsumer.as_asgi()),
    # Add more WebSocket routes as needed
]

from django.urls import re_path
from .BPSlaveMaster import BPSlaveMaster

app_name = 'game'

urlpatterns = [
    re_path('ws/game/pong$', BPSlaveMaster.as_asgi()),
]
from django.urls import re_path
from .BPSlaveMaster import BPSlaveMaster
from .BPTourneyMaster import BPTourneyMaster

app_name = 'game'

urlpatterns = [
    re_path('ws/game/pong$', BPSlaveMaster.as_asgi()),
    re_path('ws/game/tourney$', BPTourneyMaster.as_asgi()),
]
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import User
from django.shortcuts import get_object_or_404
import json

@csrf_exempt
def create_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user = User.objects.create(username=data['username'], email=data['email'], password=data['password'])
        print("write request received")
        return JsonResponse({'id': user.id, 'username': user.username, 'email': user.email, 'password': user.password})

def get_user_by_username(request, username):
    user = get_object_or_404(User, username=username)
    return JsonResponse({'username': user.username, 'email': user.email, 'password': user.password})

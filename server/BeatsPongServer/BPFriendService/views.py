# Data access layer functions
from BPDAL.views import query_profile_data
from BPDAL.views import query_user
from BPDAL.views import query_friend_request_list
from BPDAL.views import add_friend_request
from BPDAL.views import remove_friend_request
from BPDAL.views import query_profile_picture
from BPDAL.views import update_profile_picture

# django rest framework dependencies
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view

# formatting, data objects
from django.core.serializers import serialize
from django.http import JsonResponse
import json

'''
Conrtroller for friends related services
'''
@csrf_exempt
@api_view(['POST'])
def getProfilePicture(request):
    requestData = json.loads(request.body)
    username = requestData['username']
    if not query_user(username):
        return JsonResponse({"error": "User does not exist."}, status=400)
    profilePicture = query_profile_picture(username)

    return JsonResponse(profilePicture, status=200)

@csrf_exempt
@api_view(['POST'])
def getProfileData(request):
    requestData = json.loads(request.body)
    username = requestData['username']
    if not query_user(username):
        return JsonResponse({"error": "User does not exist."}, status=400)
    profileData = query_profile_data(requestData['username'])

    return JsonResponse(profileData, status=200)

@csrf_exempt
@api_view(['POST'])
def getFriendList(request):        
    requestData = json.loads(request.body)
    username = requestData['username']
    if not query_user(username):
        return JsonResponse({"error": "User does not exist."}, status=400)
    profileData = query_profile_data(requestData['username'])

    return JsonResponse(profileData.friendList, status=200)

@csrf_exempt
@api_view(['POST'])
def sendFriendRequest(request):
    requestData = json.loads(request.body)
    username = requestData['username']
    if not query_user(username):
        return JsonResponse({"error": "User does not exist."}, status=400)
    
    friendRequestList = query_friend_request_list(username)
    if not friendRequestList:
        return JsonResponse({"error": "Friend Request List does not exist."}, status=400)
    
    if username not in friendRequestList.pendingRequests:
        add_friend_request(username, requestData['friend'])
        return JsonResponse({"success": "Friend request sent."}, status=200)
    
    return JsonResponse({"error": "Friend request already sent."}, status=400)
    

@csrf_exempt
@api_view(['POST'])
def rejectFriendRequest(request):
    requestData = json.loads(request.body)
    username = requestData['username']
    if not query_user(username):
        return JsonResponse({"error": "User does not exist."}, status=400)
    
    friendRequestList = query_friend_request_list(username)
    if not friendRequestList:
        return JsonResponse({"error": "Friend Request List does not exist."}, status=400)
    
    if requestData['friend'] in friendRequestList.pendingRequests:
        remove_friend_request(username, requestData['friend'])
        return JsonResponse({"success": "Friend request rejected."}, status=200)
    
    return JsonResponse({"error": "Friend request not found."}, status=400)

@csrf_exempt
@api_view(['GET'])
def getFriendRequestList(request):
    requestData = json.loads(request.body)
    username = requestData['username']
    if not query_user(username):
        return JsonResponse({"error": "User does not exist."}, status=400)
    
    friendRequestList = query_friend_request_list(username)
    if not friendRequestList:
        return JsonResponse({"error": "Friend Request List does not exist."}, status=400)
    
    return JsonResponse(friendRequestList.pendingRequests, status=200)

@csrf_exempt
@api_view(['POST'])
def searchUser(request):
    requestData = json.loads(request.body)
    username = requestData['username']
    if (not username.strip()):
        return JsonResponse({"error": "Invalid username."}, status=400)
    if not query_user(username):
        return JsonResponse({"error": "User does not exist."}, status=400)
    
    profileData = query_profile_data(username)
    if (not profileData):
        return JsonResponse({"error": "Profile Data does not exist"}, status=400)
    
    return serialize('json', [profileData])

@csrf_exempt
@api_view(['POST'])
def changeProfilePicture(request):
    requestData = json.loads(request.body)
    username = requestData['username']
    if not query_user(username):
        return JsonResponse({"error": "User does not exist."}, status=400)
    profilePicture = query_profile_picture(username)
    if not profilePicture:
        return JsonResponse({"error": "Profile Picture does not exist."}, status=400)
    
    update_profile_picture(username, requestData['image'])
    return JsonResponse({"success": "Profile Picture updated."}, status=200)
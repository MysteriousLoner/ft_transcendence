from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
import json
from BPDAL.views import query_profile_picture
from BPDAL.views import update_profile_picture
from BPDAL.views import query_user
from BPDAL.views import query_profile_data

'''
Conrtroller for user account related services
'''
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def getProfilePicture(request):
    requestData = json.loads(request.body)
    username = requestData['username']
    if not query_user(username):
        return JsonResponse({"error": "User does not exist."}, status=400)
    profilePicture = query_profile_picture(username)
    return JsonResponse({"image": profilePicture.image, "code": "success"}, status=200)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def getProfileData(request):
    requestData = json.loads(request.body)
    username = requestData['username']
    if not query_user(username):
        return JsonResponse({"error": "User does not exist."}, status=400)
    profileData = query_profile_data(requestData['username'])

    return JsonResponse({"username": profileData.username, "displayName": profileData.displayName, "winRate": profileData.winRate}, status=200)

# request body should contain username and displayName
# {
#     "username": "username",
#     "displayName": "displayName"
# }
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def updateDisplayName(request):
    requestData = json.loads(request.body)
    username = requestData['username']
    if not query_user(username):
        return JsonResponse({"error": "User does not exist."}, status=400)
    profileData = query_profile_data(requestData['username'])
    profileData.displayName = requestData['displayName']
    profileData.save()
    profileData.refresh_from_db()
    return JsonResponse({"message": "Display name updated to:" + profileData.displayName}, status=200)   

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def updateProfilePicture(request):
    requestData = json.loads(request.body)
    username = requestData['username']
    if not query_user(username):
        return JsonResponse({"error": "User does not exist."}, status=400)
    profilePicture = query_profile_picture(username)
    if not profilePicture:
        return JsonResponse({"error": "Profile Picture does not exist."}, status=400)
    
    update_profile_picture(username, requestData['image'])
    return JsonResponse({"success": "Profile Picture updated."}, status=200)
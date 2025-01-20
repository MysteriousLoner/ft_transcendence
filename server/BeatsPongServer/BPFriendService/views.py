# Data access layer functions
from BPDAL.views import query_profile_data
from BPDAL.views import query_user

# django rest framework dependencies
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

# formatting, data objects
from django.core.serializers import serialize
from django.http import JsonResponse
import json
import os

'''
Conrtroller for friends related services
'''
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def removeFriend(request):
    # load request data
    requestData = json.loads(request.body)
    friendUsername = requestData['targetUsername']
    selfUsername = requestData['selfUsername']
    # error checking
    if not query_user(friendUsername) or not query_user(selfUsername):
        return JsonResponse({"error": "User or friend does not exist."}, status=400)
    # get self profile data and friend profile data
    friendProfileData = query_profile_data(friendUsername)
    selfProfileData = query_profile_data(selfUsername)
    if selfUsername not in friendProfileData.friendList or friendUsername not in selfProfileData.friendList:
        return JsonResponse({"error": "Not friends with this user."}, status=400)
    # remove friend username from self friend list and remove self username from friend's friend list
    friendProfileData.friendList.remove(selfUsername)
    friendProfileData.save()
    selfProfileData.friendList.remove(friendUsername)
    selfProfileData.save()
    selfProfileData.refresh_from_db()
    friendProfileData.refresh_from_db()
    return JsonResponse({"message": "Friend removed."}, status=200)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sendFriendRequest(request):
    # load request data
    requestData = json.loads(request.body)
    targetUsername = requestData['targetUsername']
    selfUsername = requestData['selfUsername']
    # error checking
    if not query_user(targetUsername) or not query_user(selfUsername):
        return JsonResponse({"error": "Users does not exist."}, status=400)
    # get target profile data and self profile data
    targetProfileData = query_profile_data(targetUsername)
    if selfUsername in targetProfileData.pendingRequests:
        return JsonResponse({"error": "Friend request already sent."}, status=400)
    # add self username to target's pending requests
    targetProfileData.pendingRequests.append(selfUsername)
    targetProfileData.save()
    targetProfileData.refresh_from_db()
    print(targetProfileData.pendingRequests, flush=True)
    return JsonResponse({"message": "Friend request sent."}, status=200)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def acceptFriendRequest(request):
    # load request data
    requestData = json.loads(request.body)
    selfUsername = requestData['selfUsername']
    requestUsername = requestData['targetUsername']
    # error checking
    if not query_user(requestUsername) or not query_user(selfUsername):
        selfProfileData = query_profile_data(selfUsername)
        if requestUsername in selfProfileData.pendingRequests:
            selfProfileData.pendingRequests.remove(requestUsername)
            return JsonResponse({"message": "Friend account deleted"}, status=200)
        return JsonResponse({"error": "Friend or User does not exist."}, status=400)
    # get friend profile data and self profile data
    requestProfileData = query_profile_data(requestUsername)
    selfProfileData = query_profile_data(selfUsername)
    if requestUsername not in selfProfileData.pendingRequests:
        return JsonResponse({"error": "Friend request not found."}, status=400)
    # remove friend username from self pending requests, add friend username to self friend list, and add self username to friend friend list
    selfProfileData.pendingRequests.remove(requestUsername)
    selfProfileData.friendList.append(requestUsername)
    requestProfileData.friendList.append(selfUsername)
    selfProfileData.save()
    requestProfileData.save()
    requestProfileData.refresh_from_db()
    return JsonResponse({"message": "Friend request accepted."}, status=200)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def declineFriendRequest(request):
    # load request data
    requestData = json.loads(request.body)
    requestUsername = requestData['targetUsername']
    selfUsername = requestData['selfUsername']
    # error checking
    if not query_user(requestUsername) or not query_user(selfUsername):
        selfProfileData = query_profile_data(selfUsername)
        if requestUsername in selfProfileData.pendingRequests:
            selfProfileData.pendingRequests.remove(requestUsername)
            return JsonResponse({"message": "Friend request declined."}, status=200)
        return JsonResponse({"error": "Friend or User does not exist."}, status=400)
    selfProfileData = query_profile_data(requestData['selfUsername'])
    if requestUsername not in selfProfileData.pendingRequests:
        return JsonResponse({"error": "Friend request not found."}, status=400)
    selfProfileData.pendingRequests.remove(requestUsername)
    selfProfileData.save()
    selfProfileData.refresh_from_db()
    return JsonResponse({"message": "Friend request declined."}, status=200)
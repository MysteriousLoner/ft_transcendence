from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
import json
from BPDAL.views import query_profile_picture
from BPDAL.views import update_profile_picture
from BPDAL.views import query_user
from BPDAL.views import query_profile_data
from BPDAL.views import get_match_history_as_list
from BPDAL.views import get_matches_won
from BPDAL.views import get_matches_lost
from BPDAL.views import get_tourney_history_as_list
from BPDAL.views import get_tourney_wins
from BPDAL.views import get_tourney_losses

'''
Conrtroller for user account related services
'''

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def getProfilePicture(request):
    requestData = json.loads(request.body)
    username = requestData['username']
    if not query_user(username):
        return JsonResponse({"error": "User does not exist."}, status=400)
    profilePicture = query_profile_picture(username)
    return JsonResponse({"image": profilePicture.image, "code": "success"}, status=200)

# used to query user history, returns a list in decending order. Takes in username as parameter
# if match history is null, either there is no history or the user does not exist.
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def getMatchHistory(request):
    requestData = json.loads(request.body)
    username = requestData['username']
    match_history = get_match_history_as_list(username)

    if not match_history:
        match_history = []

    return JsonResponse(
        {
            "history": match_history
        }, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def getProfileData(request):
    requestData = json.loads(request.body)
    username = requestData['username']
    if not query_user(username):
        return JsonResponse({"error": "User does not exist."}, status=400)
    # get basic profile data information
    profileData = query_profile_data(requestData['username'])

    # get match statistics
    matchesWon = get_matches_won(username)
    matchesLost = get_matches_lost(username)
    totalMatches = matchesWon + matchesLost
    winRate = 100
    if totalMatches == 0:
        winRate = 100
    else:
        winRate = matchesWon / totalMatches * 100
    matchHistoryList = get_match_history_as_list(username)

    # get tourney statistics
    tourneyHistory = get_tourney_history_as_list(username)
    tourneyWins = get_tourney_wins(username)
    tourneyLosses = get_tourney_losses(username)
    tourneyTotalMatches = tourneyWins + tourneyLosses
    tourneyWinRate = 100
    if tourneyTotalMatches == 0:
        tourneyWinRate = 100
    else:
        tourneyWinRate = tourneyWins / tourneyTotalMatches * 100

    return JsonResponse({
		"username": profileData.username,
		"displayName": profileData.displayName,
		"winRate": winRate,
		"friendList": profileData.friendList,
		"pendingRequests": profileData.pendingRequests,
        "totalMatches": totalMatches,
        "matchesWon": matchesWon,
        "matchesLost": matchesLost,
        "tourneyMatches": tourneyTotalMatches,
        "tourneyMatchesWon": tourneyWins,
        "tourneyMatchesLost": tourneyLosses,
        "tourneyWinRate": tourneyWinRate,
        "history": matchHistoryList,
		}, status=200)

# request body should contain username and displayName
# {
#     "username": "username",
#     "displayName": "displayName"
# }
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
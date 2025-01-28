from django.contrib.auth.models import User
from .models import ProfileData
from .models import VerificationCode
from .models import FriendRequestList
from .models import ProfilePicture
from .models import MatchHistory
from .models import TourneyHistory
from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist


'''
Functions that interact with the database
Functions are pretty much self explainatory based on their function names.
No additional logic should be present in this module, keep them at the controller layer
Strictly insert, query, update and delete only.
'''

# registration funcitons
# creates a user object
def create_user(username, email, password):
    user = User.objects.create_user(
        username=username, 
        email=email, 
    )
    user.password = password
    user.save()

    profileData = ProfileData.objects.create(
        username=username,
    )
    profileData.save()

    friendRequestList = FriendRequestList.objects.create(
        username=username,
    )
    friendRequestList.save()

    profilePicture = ProfilePicture.objects.create(
        username=username,
    )
    profilePicture.save()

    return user

# user object functions
def query_user(username):
    try:
        user = User.objects.get(username=username)
        return user
    except ObjectDoesNotExist:
        return None

# verification code
def create_verification_code(username, email, code, password, expDate):
    codeObj = VerificationCode.objects.create(
        username = username,
        code = code,
        expriarationDate = expDate,
        password = password,
        email = email,
    )
    return codeObj

# used to search created verification code
def query_verification_code(username):
    try:
        codeObj = VerificationCode.objects.filter(username=username).first()
        return codeObj
    except ObjectDoesNotExist:
        return None

# used to delete verification code after verification
def remove_verification_code(username):
    while True: 
        try:
            code = VerificationCode.objects.get(username=username)
            print(f"Deleting verification code for {username}", flush=True)
            code.delete()
        except VerificationCode.DoesNotExist:
            print(f"No more codes for {username}", flush=True)
            break

# profile data functions
def create_profile(username, profilePicture):
    profile = ProfileData.objects.create(
        username=username,
        profilePicture=profilePicture,
    )
    return profile

def query_profile_data(username):
    try:
        profileData = ProfileData.objects.get(username=username)
        return profileData
    except ObjectDoesNotExist:
        return None
    
def async_query_profile_data(username):
    try:
        profileData = ProfileData.objects.get(username=username)
        return profileData
    except ObjectDoesNotExist:
        return None

def add_match_history(winnerUsername, loserUsername, winnerScore, loserScore):
    try:
        matchHistory = MatchHistory.objects.create(
            winnerUsername=winnerUsername,
            loserUsername=loserUsername,
            winnerScore=winnerScore,
            loserScore=loserScore,
        )
        matchHistory.save()
        return matchHistory
    except ObjectDoesNotExist:
        return None

# Used to initiate tournament history, returns the match ID 
def init_tourney_history():
    try:
        tourneyHistory = TourneyHistory.objects.create(
            game1WinnerUsername="",
            game1LoserUsername="",
            game2WinnerUsername="",
            game2LoserUsername="",
            winnerUsername="",
        )
        tourneyHistory.save()
        return tourneyHistory
    except ObjectDoesNotExist:
        return None
    
# Update game 1 players based on match id
def update_game1_players(matchId, winnerUsername, loserUsername):
    try:
        tourneyHistory = TourneyHistory.objects.get(matchId=matchId)
        tourneyHistory.game1WinnerUsername = winnerUsername
        tourneyHistory.game1LoserUsername = loserUsername
        tourneyHistory.save()
        return tourneyHistory
    except ObjectDoesNotExist:
        return None
    
# Update game 2 players based on match id
def update_game2_players(matchId, winnerUsername, loserUsername):
    try:
        tourneyHistory = TourneyHistory.objects.get(matchId=matchId)
        tourneyHistory.game2WinnerUsername = winnerUsername
        tourneyHistory.game2LoserUsername = loserUsername
        tourneyHistory.save()
        return tourneyHistory
    except ObjectDoesNotExist:
        return None

# Update tournament winner based on match id
def update_tourney_winner(matchId, winnerUsername, loserUsername):
    try:
        tourneyHistory = TourneyHistory.objects.get(matchId=matchId)
        tourneyHistory.winnerUsername = winnerUsername
        tourneyHistory.game3LoserUsername = loserUsername
        tourneyHistory.save()
        return tourneyHistory
    except ObjectDoesNotExist:
        return None

def get_tourney_history_as_list(username):
    tourney_history = TourneyHistory.objects.filter(
        Q(game1WinnerUsername=username) | Q(game1LoserUsername=username) | Q(game2WinnerUsername=username) | Q(game2LoserUsername=username)
    ).order_by('-matchId')
    
    tourney_history_list = list(tourney_history.values())
    
    return tourney_history_list

def get_tourney_wins(username):
    tourney_wins = TourneyHistory.objects.filter(winnerUsername=username).count()
    return tourney_wins

def get_tourney_losses(username):
    tourney_losses = TourneyHistory.objects.filter(
        Q(game1LoserUsername=username) | Q(game2LoserUsername=username) | Q(game3LoserUsername=username)
    ).count()
    return tourney_losses

# Function to query match history for a specific username
def get_match_history_as_list(username):
    match_history = MatchHistory.objects.filter(
        Q(winnerUsername=username) | Q(loserUsername=username)
    ).order_by('-matchId')
    
    match_history_list = [str(record) for record in match_history]

    return match_history_list

# Function to query the number of matches won by a specific user
def get_matches_won(username):
    matches_won = MatchHistory.objects.filter(winnerUsername=username).count()
    return matches_won

# Function to query the number of matches lost by a specific user
def get_matches_lost(username):
    matches_lost = MatchHistory.objects.filter(loserUsername=username).count()
    return matches_lost

def update_match_data(winnerUsername, loserUsername, winnerScore, loserScore):
    print(f"Updating match data for {winnerUsername} and {loserUsername}", flush=True)
    try:
        winnerProfileData = async_query_profile_data(winnerUsername)
        loserProfileData = async_query_profile_data(loserUsername)

        # update data for winner first
        winnerProfileData.matchesPlayed += 1
        winnerProfileData.matchesWon += 1
        winnerProfileData.winRate = winnerProfileData.matchesWon / winnerProfileData.matchesPlayed * 100
        # update history for winner
        winnerProfileData.history.append(f"{winnerUsername} aka {winnerProfileData.displayName} beat {loserUsername} aka {loserProfileData.displayName} with a score of {winnerScore} - {loserScore}")
        winnerProfileData.save()

        # update data for loser
        loserProfileData.matchesPlayed += 1
        loserProfileData.matchesLost += 1
        loserProfileData.winRate = loserProfileData.matchesWon / loserProfileData.matchesPlayed * 100
        # update history for loser
        loserProfileData.history.append(f"{loserUsername} aka {loserProfileData.displayName} lost to {winnerUsername} aka {winnerProfileData.displayName} with a score of {loserScore} - {winnerScore}")
        loserProfileData.save()


        print(f"Updated match data for {winnerUsername} and {loserUsername}", flush=True)
        print(f"Winner: matches played: {winnerProfileData.matchesPlayed} matches won: {winnerProfileData.matchesWon} matches lost: {winnerProfileData.matchesLost} win rate: {winnerProfileData.winRate}", flush=True)
        print(f"Loser: matches played: {loserProfileData.matchesPlayed} matches won: {winnerProfileData.matchesWon} matches lost: {loserProfileData.matchesLost} win rate: {loserProfileData.winRate}", flush=True)
        return
    except ObjectDoesNotExist:
        print(f"Error updating match data for {winnerUsername} and {loserUsername}", flush=True)
        return None
    
# profile picture functions
def query_profile_picture(username):
    try:
        profilePicture = ProfilePicture.objects.get(username=username)
        return profilePicture
    except ProfilePicture.DoesNotExist:
        return None

def create_profile_picture(username, image):
    profilePicture = ProfilePicture.objects.create(
        username=username,
        image=image,
    )
    return profilePicture

def update_profile_picture(username, newProfilePicture):
    try:
        profilePic = ProfilePicture.objects.get(username=username)
        profilePic.image = newProfilePicture
        profilePic.save()
    except ObjectDoesNotExist:
        return None

# friend functions
def add_friend(username, friend_username):
    try:
        profile = ProfileData.objects.get(username=username)
        if friend_username not in profile.friendList:
            profile.friendList.append(friend_username)
            profile.save()
        return profile
    except ProfileData.DoesNotExist:
        return None

def remove_friend(username, friend_username):
    try:
        profile = ProfileData.objects.get(username=username)
        if friend_username in profile.friendList:
            profile.friendList.remove(friend_username)
            profile.save()
        return profile
    except ProfileData.DoesNotExist:
        return None

def send_friend_request(username, friend_username):
    try:
        profile = ProfileData.objects.get(username=username)
        if friend_username not in profile.pendingRequests:
            profile.pendingRequests.append(friend_username)
            profile.save()
        return profile
    except ProfileData.DoesNotExist:
        return None
    
def accept_friend_request(username, friend_username):
    try:
        profile = ProfileData.objects.get(username=username)
        if friend_username in profile.pendingRequests:
            profile.pendingRequests.remove(friend_username)
            profile.friendList.append(friend_username)
            profile.save()
        return profile
    except ProfileData.DoesNotExist:
        return None
    
def decline_friend_request(username, friend_username):
    try:
        profile = ProfileData.objects.get(username=username)
        if friend_username in profile.pendingRequests:
            profile.pendingRequests.remove(friend_username)
            profile.save()
        return profile
    except ProfileData.DoesNotExist:
        return None
    
def tourney_win(username):
    try:
        profile = ProfileData.objects.get(username=username)
        profile.TourneyMatchesPlayed += 1
        profile.TourneyMatchesWon += 1
        profile.TourneyWinRate = profile.TourneyMatchesWon / profile.TourneyMatchesPlayed * 100
        profile.save()
        return profile
    except ProfileData.DoesNotExist:
        return None
    
def tourney_lose(username):
    try:
        profile = ProfileData.objects.get(username=username)
        profile.TourneyMatchesPlayed += 1
        profile.TourneyMatchesLost += 1
        profile.TourneyWinRate = profile.TourneyMatchesWon / profile.TourneyMatchesPlayed * 100
        profile.save()
        return profile
    except ProfileData.DoesNotExist:
        return None
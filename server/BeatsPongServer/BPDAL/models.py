from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.contrib.auth.hashers import make_password
import os

'''
All tables and data models used in the app
'''

file = open(os.path.join(os.path.dirname(__file__), '../../assets/profilePics/defaultPfp'), 'r')
defaultPfp = file.read()

# Data of the user's profile
# Primary Key: username
class ProfileData(models.Model):
    username = models.CharField(max_length=100, unique=True)
    displayName = models.CharField(max_length=100, blank=True)
    friendList = ArrayField(models.CharField(max_length=100), blank=True, default=list)
    pendingRequests = ArrayField(models.CharField(max_length=100), blank=True, default=list)
    
    def save(self, *args, **kwargs): 
        self.displayName = self.displayName or self.username 
        super(ProfileData, self).save(*args, **kwargs)

    def __str__(self): 
        return self.username

# used to store user match history
class MatchHistory(models.Model):
    matchId = models.AutoField(primary_key=True)
    winnerUsername = models.CharField(max_length=100)
    loserUsername = models.CharField(max_length=100)
    winnerScore = models.IntegerField()
    loserScore = models.IntegerField()
    username = models.CharField(max_length=100)
    dateTime = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.winnerUsername} won against {self.loserUsername} with a score of {self.winnerScore} - {self.loserScore}"
    
# used to store user tourney history
class TourneyHistory(models.Model):
    matchId = models.AutoField(primary_key=True)
    game1WinnerUsername = models.CharField(max_length=100)
    game1LoserUsername = models.CharField(max_length=100)
    game2WinnerUsername = models.CharField(max_length=100)
    game2LoserUsername = models.CharField(max_length=100)
    game3LoserUsername = models.CharField(max_length=100)
    winnerUsername = models.CharField(max_length=100)

    def __str__(self):
        return

# used to temporarily store verification code sent trough smtp.
# Primary Key: username
class VerificationCode(models.Model):
    username = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=6)
    password = models.CharField(null=True, blank=True)
    expriarationDate = models.DateTimeField(null=True, blank=True)
    email = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.username
    
    # overrides save to hash password
    def save(self, *args, **kwargs): 
        if self.password: 
            self.password = make_password(self.password) 
            super(VerificationCode, self).save(*args, **kwargs)

# list of pending friend requests
# Primary Key: username
class FriendRequestList(models.Model):
    username = models.CharField(max_length=100, unique=True)
    pendingRequests = ArrayField(models.CharField(max_length=100), blank=True, default=list)

    def __str__(self):
        return self.username
    
class ProfilePicture(models.Model):
    username = models.CharField(max_length=100, unique=True)
    image = models.TextField(default=defaultPfp)

    def __str__(self):
        return self.username
from django.db import models

class User(models.Model):
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)

    def __str__(self):
        return self.username

class ProfileData(models.Model):
    username = models.CharField(max_length=100, unique=True)
    profilePicture = models.ImageField(upload_to='profile_pics/')

    def __str__(self): 
        return self.username
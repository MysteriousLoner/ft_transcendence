from django.views.decorators.csrf import csrf_exempt
from .models import User
from django.shortcuts import get_object_or_404
from common.dataObjects import UserCredential
from django.db import IntegrityError, DatabaseError

@csrf_exempt
def insert_user(userCredential: UserCredential):
    try:
        User.objects.create(
            username = userCredential.username,
            email = userCredential.email,
            password = userCredential.password
        )
        return {"message": "user create success"} 
    except IntegrityError as e: 
        return {"error": str(e)} 
    except DatabaseError as e: 
        return {"error": "A database error occurred: " + str(e)} 
    except Exception as e: 
        return {"error": "An error occurred: " + str(e)}

@csrf_exempt
def get_user_by_username(username):
    user = get_object_or_404(User, username=username)
    userCredential = UserCredential( 
        username=user.username, 
        email=user.email, 
        password=user.password 
    )
    return userCredential

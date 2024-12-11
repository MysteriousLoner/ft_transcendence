from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from common.dataObjects import UserCredential
from BPDAL.views import insert_user, get_user_by_username
import json
import re

# Handles request to register a user
@csrf_exempt
def create_user(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Invalid request type."}, status=400)
    
    data = json.loads(request.body)
    username = data['username']
    email = data['email']
    password = data['password']
    
    if not is_valid_username(username): 
        return JsonResponse({"error": "Invalid username."}, status=400) 
    if not is_valid_email(email): 
        return JsonResponse({"error": "Invalid email."}, status=400) 
    if not is_strong_password(password): 
        return JsonResponse({"error": "Password is not strong enough."}, status=400)
    
    userCredential = UserCredential(username, email, password)

    result = insert_user(userCredential) 
    if "error" in result: 
        error_message = result["error"] 
        if 'duplicate key value violates unique constraint' in error_message: 
            if 'email' in error_message: 
                return JsonResponse({"error": "Email taken."}, status=400) 
            if 'username' in error_message: 
                return JsonResponse({"error": "Username taken."}, status=400) 
            return JsonResponse({"error": error_message}, status=400)
    return JsonResponse({"message": result["message"]}, status=201)

@csrf_exempt
def login(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Invalid request type."}, status=400)

    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return JsonResponse({"error": "Username and password are required."}, status=400)

        credentials = get_user_by_username(username)

        if not (credentials.password == password):
            return JsonResponse({"error": "Invalid username or password."}, status=401)

        return JsonResponse({"message": "Login successful"}, status=200)

    except Exception as e:
        if 'username' in e: 
            return JsonResponse({"error": "Username not found"}, status=400) 
        return JsonResponse({"error": str(e)}, status=500)


# Utility Functions
def is_valid_username(s):
    # Check if the string contains only letters and numbers
    if not re.match("^[A-Za-z0-9]*$", s):
        return False
    # Check if the length of the string is not more than 20 characters
    if len(s) > 20:
        return False
    return True

def is_valid_email(email):
    # Define the regex pattern for a valid email
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    # Check if the email matches the pattern
    if re.match(pattern, email):
        return True
    else:
        return False

def is_strong_password(password):
    # Check if the length is at least 8 characters
    if len(password) < 8:
        return False

    # Check if there is at least one uppercase letter
    if not re.search(r'[A-Z]', password):
        return False

    # Check if there is at least one lowercase letter
    if not re.search(r'[a-z]', password):
        return False

    # Check if there is at least one digit
    if not re.search(r'[0-9]', password):
        return False

    # Check if there is at least one special character
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False

    return True
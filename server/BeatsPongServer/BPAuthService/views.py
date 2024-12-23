from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from BPDAL.views import create_verification_code, query_verification_code, query_user, create_user
from .utils import generate_random_code, is_strong_password, is_valid_email, is_valid_username
import json
from django.utils import timezone
from datetime import datetime, timedelta

# Handles request to register a user
@csrf_exempt
def register_user(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Invalid request type."}, status=400)
    
    data = json.loads(request.body)
    username = data['username']
    email = data['email']
    password = data['password']
    
    # basic check for credentials
    if not is_valid_username(username): 
        return JsonResponse({"error": "Invalid username."}, status=400)
    if query_user(username):
        print("username taken")
        return JsonResponse({"error": "username taken"}, status=400)
    if not is_valid_email(email): 
        return JsonResponse({"error": "Invalid email."}, status=400)
    if not is_strong_password(password): 
        return JsonResponse({"error": "Password is not strong enough."}, status=400)

    # generates an object to store verification code in the database
    verificationCode = generate_random_code()
    expDate = datetime.now() + timedelta(minutes=10)
    code = query_verification_code(username)
    if code:
        code.delete()
    create_verification_code(
        username, 
        email,
        verificationCode, 
        password,
        expDate,
    )

    # sends email to the user with code
    send_mail( 
        'Your Verification Code', 
        f'Your verification code is: {verificationCode}', 
        'code expires in 10 minuites!',
        [email],
        fail_silently=False, 
    )

    return JsonResponse({ "message": "Verification code sent to email.", 
                         "username": username }, status=201)

@csrf_exempt
def verify_code(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Invalid request type."}, status=400)

    data = json.loads(request.body)
    code = data['verificationCode']
    username = data['username']

    if code is None or username is None:
        return JsonResponse({"error": "code or username is none!"}, status=401)
    
    codeObj = query_verification_code(username)
    if codeObj is None:
        return JsonResponse({"error": "username does not exist!"}, status=401)
    
    if timezone.now() > codeObj.expriarationDate:
        codeObj.delete()
        return JsonResponse({"error": "code expired!"}, status=401)
    
    if code != codeObj.code:
        codeObj.delete()
        return JsonResponse({"error": "incorrect verification code!"}, status=401)
    
    codeObj.delete()

    create_user(username, codeObj.email, codeObj.password)

    return JsonResponse({ "message": "account created"}, status=201)
    
@csrf_exempt
def login(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Invalid request type."}, status=400)

    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')

    user = authenticate(request, username=username, password=password)

    if user is not None:
        return JsonResponse({"message": "Login successful"}, status=200)
    else:
        return JsonResponse({"error": "Invalid username or password"}, status=401)

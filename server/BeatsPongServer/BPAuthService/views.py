from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.mail import send_mail
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from .utils import generate_random_code, is_strong_password, is_valid_email, is_valid_username
import json

# Handles request to register a user
@csrf_exempt
def create_user(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Invalid request type."}, status=400)
    
    data = json.loads(request.body)
    username = data['username']
    email = data['email']
    password = data['password']
    
    # basic check for credentials
    if not is_valid_username(username): 
        return JsonResponse({"error": "Invalid username."}, status=400) 
    if not is_valid_email(email): 
        return JsonResponse({"error": "Invalid email."}, status=400) 
    if not is_strong_password(password): 
        return JsonResponse({"error": "Password is not strong enough."}, status=400)

    # Generate JWT tokens 
    user = User(username=username, email=email, password=password) # Temporary user object 
    refresh = RefreshToken.for_user(user) 
    access_token = str(refresh.access_token)

    verification_code = generate_random_code()
    request.session['verification_code'] = verification_code
    request.session['username'] = username 
    request.session['email'] = email 
    request.session['password'] = password
    request.session.save()
    print(f"Session ID in create_user: {request.session.session_key}", flush=True)

    stored_code = request.session.get('verification_code') 

    if stored_code is not None:
        print(f"Create user: Stored verification code: {stored_code}", flush=True)
    else:
        print("Create user: No verification code found in session.", flush=True)

    send_mail( 
        'Your Verification Code', 
        f'Your verification code is: {verification_code}', 
        'your-email@example.com',  # From email 
        [email],  # To email 
        fail_silently=False, 
    )

    return JsonResponse({ "message": "Verification code sent to email.", "access_token": access_token }, status=201)

@csrf_exempt
def verify_code(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Invalid request type."}, status=400)

    data = json.loads(request.body)
    input_code = data['verification_code']
    token = data['access_token']

    # Verify JWT token
    jwt_auth = JWTAuthentication()
    try:
        validated_token = jwt_auth.get_validated_token(token)
        user = jwt_auth.get_user(validated_token)
    except InvalidToken:
        return JsonResponse({"error": "Invalid token."}, status=400)

    # Check the verification code
    stored_code = request.session.get('verification_code')
    if stored_code is None:
        return JsonResponse({"error": "No verification code found in session."}, status=400)
    if input_code != stored_code:
        return JsonResponse({"error": "Invalid verification code."}, status=400)

    # Retrieve user data from session
    username = request.session.get('username')
    email = request.session.get('email')
    password = request.session.get('password')

    if username and email and password:
        user = User.objects.create_user(username, email, password)
        user.save()

        # Clear session data after successful registration
        del request.session['verification_code']
        del request.session['username']
        del request.session['email']
        del request.session['password']

        return JsonResponse({"message": "User registered successfully!"}, status=201)
    else:
        return JsonResponse({"error": "Session data missing. Please try registering again."}, status=400)


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

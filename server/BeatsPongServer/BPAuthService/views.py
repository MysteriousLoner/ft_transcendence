# django framework dependencies
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from django.core.mail import send_mail

# data access layer functions
from BPDAL.views import create_verification_code
from BPDAL.views import query_verification_code
from BPDAL.views import query_user
from BPDAL.views import create_user
from BPDAL.views import remove_verification_code

# local app utility functions
from .utils import generate_random_code
from .utils import is_strong_password
from .utils import is_valid_email
from .utils import is_valid_username

# formatting, data objects
from django.utils import timezone
from datetime import datetime
from datetime import timedelta
from django.http import JsonResponse
import json 


# django rest framework dependencies, JWT
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from BeatsPongServer.customJwtSerializer import CustomTokenObtainPairSerializer

# Handles request to register a user
@api_view(['POST'])
def register_user(request):
    print("current time: " + str(timezone.now()), flush=True)
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
    remove_verification_code(username)
    verificationCode = generate_random_code()
    expDate = datetime.now() + timedelta(minutes=10)
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

@api_view(['POST'])
def verify_code(request):
    print("current time: " + str(timezone.now()), flush=True)
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
        remove_verification_code(username)
        return JsonResponse({"error": "code expired!"}, status=401)
    
    if code != codeObj.code:
        remove_verification_code(username)
        print("wrong code", flush=True)
        return JsonResponse({"error": "incorrect verification code!"}, status=401)
    

    create_user(username, codeObj.email, codeObj.password)
    remove_verification_code(username)

    return JsonResponse({ "message": "account created"}, status=201)
    
@api_view(['POST'])
def login(request):
    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')

    user = authenticate(request, username=username, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        # no need to use jwt to store session data, https ensures integtity
        # customSerializer = CustomTokenObtainPairSerializer.get_token(user)
        accessToken = refresh.access_token 
        # print("refresh: " + str(refresh), flush=True)
        # print("access: " + str(accessToken), flush=True)
        return JsonResponse(
            {
                "refresh": str(refresh),
                "access": str(accessToken),
                "message": "Login successful"
            },
            status=200)
    else:
        return JsonResponse({"error": "Invalid username or password"}, status=401)

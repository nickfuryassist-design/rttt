from django.shortcuts import render
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from rttt.authentication import CookiesJWTAuthentication
from .serializers import UserSerializer
from rest_framework_simplejwt.views import TokenRefreshView,TokenObtainPairView

@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username,password=password)
    print(user)
    if user is None:
        return Response({"error":"Invalid credentials"},status=status.HTTP_401_UNAUTHORIZED)
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    res = Response({
        'message': 'Login successful',
        'user': UserSerializer(user).data,
    },status=status.HTTP_200_OK)

    res.set_cookie(
        key='access',
        value=access_token,
        httponly=True,
        secure=False, #set True in production
        samesite='Lax'
    )
    res.set_cookie(
        key='refresh',
        value=str(refresh),
        httponly=True,
        secure=False,
        samesite='Lax'
    )

    return res

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    res = Response({'message': 'logged out successfully'},status=status.HTTP_200_OK)
    res.delete_cookie('access')
    res.delete_cookie('refresh')
    return res 

@api_view(['GET'])
@permission_classes([AllowAny])
def user(request):
    print(request.META.get('HTTP_AUTHORIZATION'))
    access_token = request.COOKIES.get('access')
    if not access_token:
        print('not found')
        return Response({'error': 'Not authenticated'},status=status.HTTP_401_UNAUTHORIZED)
    print(access_token)
    jwt_auth = CookiesJWTAuthentication()    
    try:
        auth_result = jwt_auth.authenticate(request)
        # validated_user,_ = jwt_auth.authenticate(request)
        print("Auth Result:", auth_result)
        validated_user,_ = auth_result 
    except Exception as e:
        print('invalid',e)
        return Response({'error':'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)        
    
    serializer = UserSerializer(validated_user)
    return Response(serializer.data)
    
class CustomRefreshTokenView(TokenRefreshView):
    def post(self,request,*args,**kwargs):
        try:
            refresh_token = request.COOKIES.get('refresh')
            request.data['refresh'] = refresh_token
            response = super().post(request,*args,**kwargs)
            tokens = response.data
            access_token = tokens['access']
            res = Response()
            res.data = {'refreshed':True}
            res.set_cookie(
                key='access',
                value=access_token,
                httponly=True,
                secure=False,
                samesite='None',
                path='/'
            )
            return res
        except:
            return Response({'refreshed':False})

class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Build response
        res = Response(
            {
                'message': 'Login successful',
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_200_OK
        )

        # Set cookies
        res.set_cookie(
            key='access',
            value=access_token,
            httponly=True,
            secure=False,  # set True in production
            samesite='Lax'
        )
        res.set_cookie(
            key='refresh',
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite='Lax'
        )

        return res

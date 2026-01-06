from django.urls import path
from . import views
urlpatterns = [
    path('login/', views.LoginView.as_view()),
    path('logout/', views.logout),
    path('user/', views.user),
    path('refresh/',views.CustomRefreshTokenView.as_view())
]

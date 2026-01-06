from django.urls import path
from . import views
urlpatterns = [
    path('bus/',views.AllBuses),
    path('filterBus/', views.filterBus),
    path('create/',views.create_random_loc),
    path('name/',views.suggestions),
    path('driver/setlocation/',views.update_bus_location),
]

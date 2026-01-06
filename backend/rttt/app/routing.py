from django.urls import re_path
from .consumers import BusTrackingConsumer

websocket_urlpatterns = [
    re_path(r"ws/bus-tracking/$", BusTrackingConsumer.as_asgi()),
]
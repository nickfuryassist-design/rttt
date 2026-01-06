from rest_framework import serializers
from .models import Bus,BusLocation,Stop

class BusLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusLocation
        fields = '__all__'
class StopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stop
        fields = ['stop_name']
        
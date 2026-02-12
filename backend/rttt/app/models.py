from django.db import models

# Create your models here.
class Route(models.Model):
    route_id = models.AutoField(primary_key=True)
    route_name = models.CharField(max_length=100)

    def __str__(self):
        return self.route_name 

class Stop(models.Model):
    stop_id = models.AutoField(primary_key=True)
    stop_name = models.CharField(max_length=100)
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lng = models.DecimalField(max_digits=9, decimal_places=6)
    def __str__(self):
        return self.stop_name
    
class RouteStop(models.Model):
    route = models.ForeignKey(Route,on_delete=models.CASCADE)
    stop = models.ForeignKey(Stop, on_delete=models.CASCADE)
    stop_order = models.PositiveIntegerField()
    class Meta:
        unique_together = ('route','stop_order')
        ordering = ['stop_order']
    def __str__(self):
        return f"{self.route.route_name} - Stop {self.stop_order}: {self.stop.stop_name}"
    
class Bus(models.Model):
    bus_id = models.AutoField(primary_key=True)
    bus_number = models.CharField(max_length=50)
    route = models.ForeignKey(Route,on_delete=models.CASCADE)
    
    def __str__(self):
        return f"Bus {self.bus_number}"
class BusLocation(models.Model):
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE,related_name='location')
    lat= models.DecimalField(max_digits=9,decimal_places=6)
    lng = models.DecimalField(max_digits=9,decimal_places=6)
    timestamp = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"Location of {self.bus.bus_number} at {self.timestamp}"
    
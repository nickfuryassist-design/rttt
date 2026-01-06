from django.contrib import admin
from .models import Route, Stop, RouteStop, Bus, BusLocation

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('route_id', 'route_name')
    search_fields = ('route_name',)

@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ('stop_id', 'stop_name', 'lat', 'lng')
    search_fields = ('stop_name',)

@admin.register(RouteStop)
class RouteStopAdmin(admin.ModelAdmin):
    list_display = ('route', 'stop', 'stop_order')
    list_filter = ('route',)
    ordering = ('route', 'stop_order')

@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ('bus_id', 'bus_number', 'route')
    list_filter = ('route',)
    search_fields = ('bus_number',)

@admin.register(BusLocation)
class BusLocationAdmin(admin.ModelAdmin):
    list_display = ('bus', 'lat', 'lng', 'timestamp')
    list_filter = ('bus',)
    readonly_fields = ('timestamp',)


from django.shortcuts import render
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import BusLocation,Route,RouteStop,Stop,Bus
from .serializer import BusLocationSerializer,StopSerializer
import openrouteservice
from shapely.geometry import LineString, Point
from pyproj import Transformer
from shapely.ops import transform
import random

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils import timezone

# from rest_framework.permissions import AllowAny

client = openrouteservice.Client(key='eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjE1NWViNzRjYmYyNzQxMDJiN2Y1MTIxNGRlOTM4MjNhIiwiaCI6Im11cm11cjY0In0=')

def getRoute(route_id):
    route = RouteStop.objects.filter(route=route_id).order_by("stop_order")
    print(route)
    return [(float(r.stop.lng), float(r.stop.lat)) for r in route]
def get_route_geometry(coords):
    """
    coords: list of (lng, lat) tuples ordered by stop order
    Returns: geometry (list of lat/lng), total distance, and full response
    """
    route = client.directions(
        coordinates=coords,
        profile='driving-car',
        format='geojson',
        instructions=False
    )
    # print(route)
    geometry = route['features'][0]['geometry']['coordinates']
    distance = route['features'][0]['properties']['summary']['distance']
    
    return geometry, distance, route
def get_position_along_route(route_geometry, point):
    """
    route_geometry: list of [lng, lat]
    point: [lng, lat]
    Returns: distance along the route (meters)
    """
    line = LineString(route_geometry)
    p = Point(point)
    transformer = Transformer.from_crs("epsg:4326", "epsg:32643", always_xy=True)
    projected_line = transform(transformer.transform, line)
    projected_point = transform(transformer.transform, p)
    
    projected_distance = projected_line.project(projected_point)  # in degrees along the LineString
    return projected_distance

def create_random_loc(request,num=5):
    for route in Route.objects.all():
        print(route)
        coords = getRoute(route)
        print(coords)
        geometry,distance,_ = get_route_geometry(coords)
        for x in range(num):
            lng,lat = random.choice(geometry)
            b = Bus(bus_number=f"{route}-{x}",route=route)
            b.save()
            bl = BusLocation(bus=b,lat=lat,lng=lng)
            bl.save()


@api_view(['GET'])
@permission_classes([AllowAny])
def AllBuses(request):
    busLocation = BusLocation.objects.all()
    serializer = BusLocationSerializer(busLocation,many=True)
    return Response(serializer.data)
@api_view(['GET'])
@permission_classes([AllowAny])
def suggestions(request):
    # print(request.query_params)
    value = request.query_params.get('value')
    stops = Stop.objects.filter(stop_name__startswith=value)
    serializer = StopSerializer(stops,many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def filterBus(request):
    start_name = request.data.get('start')
    dest_name = request.data.get('destination')
    routes = Route.objects.filter(
        routestop__stop__stop_name=start_name
    ).filter(
        routestop__stop__stop_name=dest_name
    ).distinct()

    result = []
    
    for r in routes:
        try:
            start_stop = RouteStop.objects.get(route=r, stop__stop_name=start_name)
            dest_stop = RouteStop.objects.get(route=r, stop__stop_name=dest_name)
            if start_stop.stop_order < dest_stop.stop_order:
                coords = getRoute(r)
                geometry, distance, route = get_route_geometry(coords)
                start_coords = [float(start_stop.stop.lng), float(start_stop.stop.lat)]
                dest_coords = [float(dest_stop.stop.lng), float(dest_stop.stop.lat)]

                # Calculate distances strictly based on the route path
                start_distance = get_position_along_route(geometry, start_coords)
                total_dest_distance = get_position_along_route(geometry, dest_coords)
                for bus_loc in BusLocation.objects.filter(bus__route=r):
                    bus_coords = [float(bus_loc.lng), float(bus_loc.lat)]
                    bus_dist = get_position_along_route(geometry, bus_coords)
                    if start_distance >= bus_dist:
                        result.append({"id":bus_loc.bus.bus_number, "geometry":geometry,"lat":bus_loc.lat,"lng":bus_loc.lng,"distance":total_dest_distance - bus_dist})  #,b.speed

        except Exception as e:
            print(f"Error processing route {r.route_name}: {e}")
            continue
    return Response(result)

# def filterBus(request):
#     result = []
#     start = Stop.objects.get(stop_name=request.data.get('start'))
#     dest = Stop.objects.get(stop_name=request.data.get('destination'))

#     for r in Route.objects.all():
#         # coords = getRoute(r)
#         # geometry,distance,route = get_route_geometry(coords)
#         rs = RouteStop.objects.filter(route=r)
#         try:
#             ss = rs.get(stop=start)
#             ds = rs.get(stop=dest)
#             if ss.stop_order < ds.stop_order:
#                 coords = getRoute(r)
#                 geometry,distance,route = get_route_geometry(coords)

#                 for bus in Bus.objects.filter(route=r):
#                     b = BusLocation.objects.get(bus=bus)
#                     start_distance = get_position_along_route(geometry,[start.lng,start.lat])
#                     bus_distance = get_position_along_route(geometry,[b.lng,b.lat])
#                     total_distance = get_position_along_route(geometry,[dest.lng,dest.lat])
                    
#                     if start_distance>=bus_distance:
#                         result.append({"id":b.bus.bus_number, "geometry":geometry,"lat":b.lat,"lng":b.lng,"distance":total_distance-bus_distance})  #,b.speed
#         except Exception as e:
#             print(e)
    
#     return Response(result)




@api_view(['POST'])
def update_bus_location(request):
    """
    Receives location from bus or driver app.
    Updates DB and broadcasts via WebSocket.
    """
    bus_id = request.data.get('bus_id')
    lat = request.data.get('latitude')
    lng = request.data.get('longitude')

    if not (bus_id and lat and lng):
        return Response({'error': 'Invalid data'}, status=400)

    # 1️⃣ Update database
    bus, created = BusLocation.objects.get_or_create(bus=Bus.objects.get(bus_number=bus_id).bus_id)
    bus.lat = lat
    bus.lng = lng
    bus.save()

    # 2️⃣ Broadcast to WebSocket clients
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
         f"bus_{bus_id}",
        {
            "type": "bus_location_update",
            "bus_id": bus_id,
            "latitude": lat,
            "longitude": lng,
        }
    )
    print(bus_id,lat,lng)
    return Response({'status': 'Location updated'})


    
    
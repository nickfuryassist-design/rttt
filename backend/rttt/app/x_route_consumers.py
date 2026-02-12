from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from models import Route,RouteStop
import json

def get_routes_for_start_end(start,end):
    route_ids = []
    for r in Route.objects.all():
        rs = RouteStop.objects.filter(route=r)
        try:
            ss = rs.get(stop=start)
            es = rs.get(stop=end)
            if ss.stop_order < es.stop_order:
                route_ids.append(r)
        except:
            pass
    return route_ids

class BusTrackingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_params = parse_qs(self.scope["query_string"].decode())
        start = query_params.get('start',[None])[0]
        end = query_params.get('end',[None])[0]
        if start and end:
            route_ids = await database_sync_to_async(get_routes_for_start_end)(start,end)
            self.route_groups = [f"route_{r}" for r in route_ids]
            for group in self.route_groups:
                await self.channel_layer.group_add(group,self.channel_name)
    
    async def disconnect(self,close_code):
        for group in self.route_groups:
            await self.channel_layer.group_discard(group,self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        bus_id = data.get('bus_id')
        route_id = data.get('route_id')
        lat = data.get('latitude')
        lon = data.get('longitude')
        await self.channel_layer.group_send(
            f"route_{route_id}",
            {
                'type': 'bus_location_update',
                'bus_id': bus_id,
                'latitude': lat,
                'longitude':lon,
            }
        )

    async def bus_location_update(self,event):
        await self.send(text_data=json.dumps({
            'bus_id': event['bus_id'],
            'latitude':event['latitude'],
            'longitude': event['longitude'],
        }))
    


##########################################
    start_name = request.data.get('start')
    dest_name = request.data.get('destination')
    
    if not start_name or not dest_name:
        return Response({"error": "Start and Destination are required"}, status=400)

    # 1. Efficiently find routes that have BOTH stops
    # We filter for routes containing the start stop, AND routes containing the dest stop
    routes = Route.objects.filter(
        routestop__stop__stop_name=start_name
    ).filter(
        routestop__stop__stop_name=dest_name
    ).distinct()

    result = []
    for r in routes:
        try:
            # We already know the route has both, now check the order
            # fetching specific RouteStop instances
            start_stop = RouteStop.objects.get(route=r, stop__stop_name=start_name)
            dest_stop = RouteStop.objects.get(route=r, stop__stop_name=dest_name)
            
            if start_stop.stop_order < dest_stop.stop_order:
                # 2. Use Cached Geometry if available, else Fetch & Save
                if r.geometry and r.total_distance:
                    geometry = r.geometry
                    distance = r.total_distance
                else:
                    # Fallback: Fetch from API and Cache it
                    print(f"Fetching geometry for route {r.route_name}")
                    coords = getRoute(r)
                    if not coords: continue
                    geometry, distance, _ = get_route_geometry(coords)
                    r.geometry = geometry
                    r.total_distance = distance
                    r.save()

                start_coords = [float(start_stop.stop.lng), float(start_stop.stop.lat)]
                dest_coords = [float(dest_stop.stop.lng), float(dest_stop.stop.lat)]

                # Calculate distances strictly based on the route path
                start_distance = get_position_along_route(geometry, start_coords)
                total_dest_distance = get_position_along_route(geometry, dest_coords)

                for bus_loc in BusLocation.objects.filter(bus__route=r):
                    bus_coords = [float(bus_loc.lng), float(bus_loc.lat)]
                    bus_dist = get_position_along_route(geometry, bus_coords)
                    
                    # Bus must be past the start (or at it) but before the destination? 
                    # Logic in original code: if start_distance >= bus_distance (Wait, what?)
                    # Original logic was: start_distance >= bus_distance. 
                    # If stops are ordered 0..N. 
                    # If I am at Stop 2 (Start), and Bus is at Stop 1. Bus distance (from 0) is less than Start distance.
                    # Usually "Bus arriving" means Bus is *behind* the start. 
                    # So Bus Dist < Start Dist is correct for "Bus is coming towards Start".
                    
                    if start_distance >= bus_dist:
                        arrival_dist = start_distance - bus_dist # Distance for bus to reach start
                        remaining_trip_dist = total_dest_distance - bus_dist # Distance to destination
                        
                        # Use cached geometry for the response to avoid re-sending massive data if not needed, 
                        # or send it if frontend draws the line. 
                        # Original code sent "geometry".
                        
                        result.append({
                            "id": bus_loc.bus.bus_number, 
                            "route": r.route_name,
                            "geometry": geometry, 
                            "lat": bus_loc.lat, 
                            "lng": bus_loc.lng, 
                            "distance_to_start": arrival_dist,
                            "trip_distance": remaining_trip_dist
                        })
        except Exception as e:
            print(f"Error processing route {r.route_name}: {e}")
            continue
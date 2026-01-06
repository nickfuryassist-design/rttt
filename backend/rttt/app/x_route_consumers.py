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
    
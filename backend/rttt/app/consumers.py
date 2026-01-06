from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json

class BusTrackingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        quary_params = parse_qs(self.scope["query_string"].decode())
        busId = quary_params.get('bus_id',[None])[0]
        if busId:
            self.group = f"bus_{busId}"
            await self.channel_layer.group_add(self.group,self.channel_name)
            await self.accept()
        else:
            await self.close()
    
    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group,self.channel_name)

    # async def receive(self, text_data):
    #     data = json.loads(text_data)
    #     busId = data.get('bus_id')
    #     lat = data.get('lat')
    #     lng = data.get('lng')
    #     await self.channel_layer.group_send(
    #         f"bus_{busId}",
    #         {
    #             'type': 'bus_location_update',
    #             'bus_id': busId,
    #             'lat': lat,
    #             'lng': lng,
    #         }
    #     )
    
    async def bus_location_update(self,event):
        await self.send(json.dumps({
            'bus_id': event['bus_id'],
            'lat': event['lat'],
            'lng': event['lng'],
        }))
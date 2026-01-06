import { Marker,Popup,Polyline } from "react-leaflet";
import L from "leaflet";
import { useState } from "react";



const pulseIcon = new L.divIcon({
    className: "flex justify-center",
    html: 
  `<span class="relative flex h-4 w-4">
    <span
      class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"
    ></span>
    <span
      class="relative inline-flex h-4 w-4 rounded-full bg-blue-500"
    ></span>
  </span>`,
iconSize: [40,40],
iconAnchor: [10, 10]})

const PulseMarker = ({position,name,geometry,onMarkerClick})=> {
    const [geo,setGeo] = useState('');
    return (
        <>
        <Marker position={position} icon={pulseIcon}  eventHandlers={{
          click: (e) => {
                  setGeo(geometry.map(([lng,lat]) => [lat,lng]))
                  console.log(geo)
                  if (onMarkerClick) onMarkerClick(e);
                },}
          }>
        <Popup>{name}</Popup>
        </Marker>
        {geo.length > 0 && <Polyline positions={geo} color="blue" />}
        </>
    )
}
export default PulseMarker
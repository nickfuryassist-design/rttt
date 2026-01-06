import React, { useEffect } from 'react'
import { useMap } from 'react-leaflet';
import L from "leaflet"

function SetViewToCurrentLocation({ position,view }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 13); // set zoom level as needed
      L.marker(position).addTo(map).bindPopup("current Location")
    }
  }, [view]);

  return null;
}
export default SetViewToCurrentLocation
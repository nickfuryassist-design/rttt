import React from 'react'
import { useMapEvents,useMap } from 'react-leaflet'

export function RouteDraw(geometry) {
    const map = useMap()
    map.fitBounds(geometry);
    // setRouteData(summary);
    return null
}
    
function Map() {
    // const map = useMap()
    const map = useMapEvents({
    click: (e) => {
      console.log("you clicked"+ e.latlng)
    }
  })
  return null
}

export default Map
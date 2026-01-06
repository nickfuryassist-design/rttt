import React, { useState,useEffect } from 'react'
import { MapContainer, TileLayer,useMap } from 'react-leaflet'
import Map from '@/components/Map'
import PulseMarker from '@/components/PulseMarker'
import { useSelector } from 'react-redux'
import axios from 'axios'

function Driver() {
  const [position,setPosition] = useState([0,0])
  const bus = useSelector(state=>state.user)
  function ChangeView({center}){
    const map = useMap();
    map.setView(position);
    return null
  }
  const getCookie = (name) => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
            cookieValue = decodeURIComponent(cookie.slice(name.length + 1));
            break;
            }
        }
        }
        return cookieValue;
    };
    
  const csrfToken = getCookie('csrftoken');

  useEffect(()=>{
    const fetchLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          
          axios.post('http://localhost:8000/driver/setlocation/',{bus_id:bus.username,latitude:latitude,longitude:longitude},{
                      headers: {
                          'X-CSRFToken': csrfToken
                      },
                      withCredentials: true
                  })
          console.log("Accuracy: " + pos.coords.accuracy + " meters");
        },
        (err) => {
          console.error("Geolocation error:", err);
          alert("Could not get your location.");
        },
        {enableHighAccuracy: true,
          maximumAge: 0
        }
      )
    }
    fetchLocation();
    const intervalId = setInterval(fetchLocation,5000)
    return () => clearInterval(intervalId);
  },[]
  )

  return (
    <MapContainer center={position} zoom={13} scrollWheelZoom={true} className='absolute top-16 lg:top-20 right-0 bottom-0 left-0 z-0' >
            {/* <SetViewToCurrentLocation position={position} /> */}
            <Map></Map>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <PulseMarker position={position} name={`Bus Number- ${bus.username}`} />    
            <ChangeView position={position}/>
    </MapContainer>
  )
}

export default Driver
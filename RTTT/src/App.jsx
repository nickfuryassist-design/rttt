import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, } from 'react-leaflet'
import './App.css'
import Map from './components/Map'
import axios from 'axios'
import SetViewToCurrentLocation from './components/SetViewToCurrentLocation'
import Input from './components/Input'
import PulseMarker from './components/PulseMarker.jsx'
import { ShinyButton } from "@/components/ui/shiny-button"

import { useSelector, useDispatch } from 'react-redux'


function App() {

  const [position, setPosition] = useState([0, 0]);
  const [view, setView] = useState(true)
  const [buses, setBuses] = useState([]);
  const [busid, setBusid] = useState(null)
  const [location, setLocation] = useState([0, 0])
  const [refresh, setRefresh] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // const dispatch = useDispatch()
  const bus = useSelector(state => state.buses)

  const onRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    if (bus.length != 0) {
      setRefresh(prev => prev + 1)
    }
    else {
      axios.get("http://localhost:8000/bus/").then(response => { setBuses(response.data) })
    }
    setTimeout(() => {
      setIsRefreshing(false)
    }, 5000)
  }

  useEffect(() => {
    setBuses(bus)
  }, [bus])

  // single run {Buses Data, csrf}
  useEffect(() => {
    axios.get("http://localhost:8000/bus/").then(response => {
      setBuses(response.data)
      // console.log("useEffect",response)
    })
    axios.get('http://localhost:8000/csrf/', {
      withCredentials: true,
    }).then(response => console.log(response));

  }, []);

  // Websocket
  useEffect(() => {
    if (busid) {
      console.log(busid)
      const url = `ws://localhost:8000/ws/bus-tracking/?bus_id=${busid}`
      const socket = new WebSocket(url);
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.bus_id) {
          setLocation([data.lat, data.lng])
        }
      }
      return () => socket.close();
    }
  }, [busid])

  if (view) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setView(false)
        console.log("Accuracy: " + pos.coords.accuracy + " meters");
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Could not get your location.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0
      }
    )
  }


  return (
    <>
      <Input refresh={refresh}></Input>
      <MapContainer center={position} zoom={13} scrollWheelZoom={true} className='absolute top-16 lg:top-20 right-0 bottom-0 left-0 z-0' >
        <SetViewToCurrentLocation position={position} view={view} />
        <Map></Map>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {buses.map((bus, idx) => (
          (bus.id !== busid) &&
          <div key={bus.id} onClick={() => console.log('clicked')}>
            <PulseMarker position={[bus.lat, bus.lng]} name={`Bus Number- ${bus.id} \n Distance- ${bus.distance}`} geometry={bus.geometry} onMarkerClick={() => setBusid(bus.id)} />
          </div>
        )
        )}
        {busid && <PulseMarker position={location} geometry={buses.find(b => b.id === busid)?.geometry} />}
      </MapContainer>
      {!isRefreshing && <ShinyButton className='absolute rounded-full p-3 w-fit right-10 bottom-10' onClick={onRefresh}>
        {/* <RefreshLogo className='h-5 w-5'/> */}
        <img className='h-8 w-8' src="https://img.icons8.com/?size=100&id=59872&format=png&color=000000" alt="" />
      </ShinyButton>}
    </>
  )
}

export default App

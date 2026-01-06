import React, { useEffect, useState } from 'react'
import { ShinyButton } from "@/components/ui/shiny-button"
import { ShineBorder } from "@/components/ui/shine-border"
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { changeBus } from '@/redux/rtttSlice'

function Input({refresh}) {
    const[startValue,setStartValue] = useState('')
    const[destinationValue,setDestinationValue] = useState('')
    const[startSuggestions,setStartSuggestions] = useState([])
    const[destinationSuggestions,setDestinationSuggestions] =useState([])
    const[debounce,setDebounce] = useState(null)
    const [startSelectedIndex, setStartSelectedIndex] = useState(-1);
    const [destinationSelectedIndex, setDestinationSelectedIndex] = useState(-1);

    const dispatch = useDispatch();
        
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
    const onSubmit = () => {
        const csrfToken = getCookie('csrftoken');
        axios.post(import.meta.env.VITE_API_BASE_URL + '/filterBus/',{start:startValue,destination:destinationValue},{
                    headers: {
                        'X-CSRFToken': csrfToken
                    },
                    withCredentials: true
                }).then(response=>{
                    console.log(response)
                    dispatch(changeBus(response.data))})
    }
    const startHandleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      // Move to the next suggestion
      setStartSelectedIndex((prevIndex) => (prevIndex + 1) % startSuggestions.length);
    } else if (e.key === "ArrowUp") {
      // Move to the previous suggestion
      setStartSelectedIndex((prevIndex) =>
        prevIndex === 0 ? startSuggestions.length - 1 : prevIndex - 1
      );
    } else if (e.key === "Enter" && startSelectedIndex >= 0) {
      // Select the suggestion on Enter key press
      const startSelectedSuggestion = startSuggestions[startSelectedIndex];
      setStartValue(startSelectedSuggestion.stop_name); // Update the input field
      setStartSuggestions([]); // Clear suggestions
    }
  };
    const startHandleChange = (e) =>{
        const value = e.target.value
        setStartValue(value)

        if (debounce) clearTimeout(debounce)
        const newTimer = setTimeout(()=>{
            // if (value.length>2) 
            fetchSuggestions(value,'start');
            // else setSuggestions([])
        },400)
        setDebounce(newTimer)
    }
    const fetchSuggestions = (value,type)=>{
        axios.get(import.meta.env.VITE_API_BASE_URL + '/name/',{params:{value:value}}).then(response=>{
            console.log(response)
            if (type==="start") setStartSuggestions(response.data);
            else setDestinationSuggestions(response.data)
    }
    )}
    const startHandleSelect = (value) =>{
        setStartValue(value);
        setStartSuggestions([]);
    }
    const destinationHandleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      // Move to the next suggestion
      setStartSelectedIndex((prevIndex) => (prevIndex + 1) % startSuggestions.length);
    } else if (e.key === "ArrowUp") {
      // Move to the previous suggestion
      setDestinationSelectedIndex((prevIndex) =>
        prevIndex === 0 ? destinationSuggestions.length - 1 : prevIndex - 1
      );
    } else if (e.key === "Enter" && destinationSelectedIndex >= 0) {
      // Select the suggestion on Enter key press
      const selectedSuggestion = destinationSuggestions[destinationSelectedIndex];
      setDestinationValue(selectedSuggestion.stop_name); // Update the input field
      setDestinationSuggestions([]); // Clear suggestions
    }
    }
    const destinationHandleChange = (e) =>{
        const value = e.target.value
        setDestinationValue(value)

        if (debounce) clearTimeout(debounce)
        const newTimer = setTimeout(()=>{
            // if (value.length>2) 
            fetchSuggestions(value,'destination');
            // else setSuggestions([])
        },400)
        setDebounce(newTimer)
    }
    const destinationHandleSelect = (value) =>{
        setDestinationValue(value);
        setDestinationSuggestions([]);
    }

    useEffect(()=>{
        if (refresh>0&&startValue!=''&&destinationValue!='') {
            onSubmit();
        }
    },[refresh])
  return (
    <div class="absolute top-18 lg:top-22 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-xl px-4 ">

        <div class="w-full relative">
            <ShineBorder className='rounded-md' shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} borderWidth='2'/>
            <input
                type="text"
                placeholder="Start location"
                class="w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-500 bg-white bg-opacity-90 border border-gray-300 rounded-t-md shadow-md focus:outline-none "
                value={startValue}
                onChange={startHandleChange}
                onKeyDown={startHandleKeyDown}
            />
            {startSuggestions.length>0 && (
                <ul class="absolute w-99/100 ml-0.5 mr-0.5 origin-top-right rounded-b-md bg-white shadow-lg outline-1 outline-black/5 transition transition-discrete [--anchor-gap:--spacing(2)] data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
                    {startSuggestions.map((item,idx)=>(
                        <li key={idx} onMouseDown={()=>startHandleSelect(item.stop_name)} className={`block px-4 py-2 text-sm text-gray-700 ${
                  startSelectedIndex === idx
                    ? "bg-gray-100 text-gray-900"
                    : "focus:bg-gray-100 focus:text-gray-900"
                }`}>
                            {item.stop_name}
                        </li>
                    ))}
                </ul>
            )}
            
            <input
                type="text"
                placeholder="Destination"
                class="w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-500 bg-white bg-opacity-90 border-l border-r border-b border-gray-300 rounded-b-md shadow-md focus:outline-none "
                value={destinationValue}
                onChange={destinationHandleChange}
                onKeyDown={destinationHandleKeyDown}
                
            />
            {destinationSuggestions.length>0 && (
                <ul class="absolute w-99/100 ml-0.5 mr-0.5 origin-top-right rounded-b-md bg-white shadow-lg outline-1 outline-black/5 transition transition-discrete [--anchor-gap:--spacing(2)] data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
                    {destinationSuggestions.map((item,idx)=>(
                        <li key={idx} onMouseDown={()=>destinationHandleSelect(item.stop_name)} className={`block px-4 py-2 text-sm text-gray-700 ${
                  destinationSelectedIndex === idx
                    ? "bg-gray-100 text-gray-900"
                    : "focus:bg-gray-100 focus:text-gray-900"
                }`}>
                            {item.stop_name}
                        </li>
                    ))}
                </ul>
            )}
            <ShinyButton className='absolute right-2 rounded-full top-1/2 -translate-y-1/2 bg-gray-200 ' onClick={onSubmit}>Submit</ShinyButton>
        </div>
    </div>

  )
}

export default Input
{/* <div class="absolute top-18 lg:top-20 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-xl px-4">
        <div class="space-y-4">
            
            <input
                type="text"
                placeholder="Start location"
                class="w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-500 bg-white bg-opacity-90 border border-gray-300 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            
            <input
                type="text"
                placeholder="Destination"
                class="w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-500 bg-white bg-opacity-90 border border-gray-300 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
    </div>
</div> */}
    

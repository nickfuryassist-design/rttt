const fetchRoute = async (route) => {
    const coordinates = route.map(stop => [stop.lng, stop.lat]);
      
      const res = await axios.post(
          "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
          {
            coordinates: coordinates
          },
          {
            headers: {
              Authorization: ORS_API_KEY,
              "Content-Type": "application/json",
              
            },
          }
        );
      console.log(res.data)
      setGeo(res.data.features[0].geometry.coordinates.map(([lng,lat]) => [lat,lng]))
      setSummary(res.data.features[0].properties.summary)
  }
  
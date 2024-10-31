import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icon (default Leaflet marker for React)
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

function App() {
  const [locationData, setLocationData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);

  useEffect(() => {
    // Connect to the WebSocket server
    const socket = new WebSocket('wss://smart-blind-stick-4.onrender.com');

    socket.onopen = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received location data:', data);

      // Update state with the latest location data
      const newLocation = data.data;
      setLocationData((prevData) => [...prevData, newLocation]);
      
      // Update last known location
      setLastLocation(newLocation);
    };

    socket.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    };

    return () => socket.close(); // Clean up the socket connection
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h1>Live Location Tracker</h1>
      {isConnected ? <p>Status: Connected ✅</p> : <p>Status: Disconnected ❌</p>}

      <MapContainer 
        center={[19.0655, 72.8795]} 
        zoom={13} 
        style={{ height: '500px', width: '80%', margin: 'auto' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Display markers for received location data */}
        {locationData.map((location, index) => (
          <Marker
            key={index}
            position={[location.lat, location.long]}
            icon={customIcon}
          >
            <Popup>
              <p><strong>ID:</strong> {location.id}</p>
              <p><strong>Latitude:</strong> {location.lat}</p>
              <p><strong>Longitude:</strong> {location.long}</p>
            </Popup>
          </Marker>
        ))}

        {/* Display the last known location if data is not updated */}
        {lastLocation && (
          <Marker
            position={[lastLocation.lat, lastLocation.long]}
            icon={customIcon}
          >
            <Popup>
              <p><strong>ID:</strong> {lastLocation.id}</p>
              <p><strong>Latitude:</strong> {lastLocation.lat}</p>
              <p><strong>Longitude:</strong> {lastLocation.long}</p>
              <p><em>(Last known location)</em></p>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default App;

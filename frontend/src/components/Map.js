// --- src/components/Map.js ---
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/Map.css";
import L from "leaflet";

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

function Map({ center, places, itineraryPlaces, userLocation }) {
  const mainIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const userIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <MapContainer 
      center={center} 
      zoom={13} 
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={center} icon={mainIcon}>
        <Popup>
          <b>{places[0]?.city || "Destination"}</b>
        </Popup>
      </Marker>
      {places.map((place, i) => (
        <Marker key={i} position={place.coords || [place.lat, place.lng]}>
          <Popup>
            <b>{place.name}</b>
            {place.type && <p>{place.type}</p>}
          </Popup>
        </Marker>
      ))}
      {userLocation && (
        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <b>Your Location</b>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default Map;
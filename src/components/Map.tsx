'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Complaint } from '@/context/MockDb';

// Fix Leaflet's default icon path issues
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Since our mock DB only has text locations, we'll hash the location text into a small 
// deterministic jitter around a central point (e.g., MG Road, Bangalore coordinates).
const getMockCoordinates = (locationText: string) => {
  let hash = 0;
  for (let i = 0; i < locationText.length; i++) {
    hash = locationText.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Base coordinates (Bangalore approximate center)
  const baseLat = 12.9716;
  const baseLng = 77.5946;
  
  // Add deterministic jitter between -0.05 and 0.05 based on the text hash
  const latOffset = (Math.abs(hash) % 100) / 2000;
  const lngOffset = (Math.abs(hash >> 8) % 100) / 2000;

  return [baseLat + latOffset, baseLng + lngOffset] as [number, number];
};

export default function MapWidget({ complaints }: { complaints: Complaint[] }) {
  // If there are no complaints, fallback to center of Bangalore
  const center = complaints.length > 0 ? getMockCoordinates(complaints[0].location) : [12.9716, 77.5946];

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer center={center as [number, number]} zoom={13} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {complaints.map((c) => {
          const coords = getMockCoordinates(c.location);
          return (
            <Marker key={c.id} position={coords}>
              <Popup>
                <div className="font-sans">
                  <strong>{c.id}</strong><br/>
                  <span className="text-xs font-bold text-violet-600">{c.category}</span><br/>
                  {c.title}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

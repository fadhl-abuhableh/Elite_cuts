import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { fetchLocations } from '@/lib/supabase';

// Debug environment variables
console.log('All env variables:', {
  VITE_MAPBOX_TOKEN: import.meta.env.VITE_MAPBOX_TOKEN,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
});

// Get the token from environment variable
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Validate token
if (!MAPBOX_TOKEN) {
  console.error('Mapbox token is missing. Please add VITE_MAPBOX_TOKEN to your .env file');
}

// Set the access token
mapboxgl.accessToken = MAPBOX_TOKEN || '';

console.log('Mapbox Token:', import.meta.env.VITE_MAPBOX_TOKEN);

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [location, setLocation] = useState({
    name: 'Elite Cuts Main Branch',
    address: 'Altayçeşme, Bağdat Cad. NO:105 D:b',
    city: 'Maltepe',
    state: 'Istanbul',
    country: 'Turkey',
    postal_code: '34840',
    // Exact coordinates for Altayçeşme, Bağdat Cad. NO:105 D:b, Maltepe
    longitude: 29.1334,
    latitude: 40.9356
  });
  const [mapError, setMapError] = useState<string | null>(null);
  
  // Fetch location from database
  useEffect(() => {
    const getLocationData = async () => {
      try {
        const locations = await fetchLocations();
        if (locations && locations.length > 0) {
          const mainLocation = locations[0];
          
          // Only update if we have actual coordinates from DB
          // Here we're assuming the DB has these fields, otherwise we keep defaults
          setLocation(prev => ({
            name: mainLocation.name || prev.name,
            address: mainLocation.address || prev.address,
            city: mainLocation.city || prev.city,
            state: mainLocation.state || prev.state,
            country: mainLocation.country || prev.country,
            postal_code: mainLocation.postal_code || prev.postal_code,
            // Keep default coordinates if not provided in the DB
            longitude: prev.longitude,
            latitude: prev.latitude
          }));
        }
      } catch (error) {
        console.error('Failed to fetch location data:', error);
      }
    };
    
    getLocationData();
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (!MAPBOX_TOKEN) {
      setMapError('Mapbox token is missing. Please check your environment configuration.');
      return;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [location.longitude, location.latitude],
        zoom: 16
      });

      // Add error handling for map loading
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Failed to load map. Please try again later.');
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add marker for the barbershop location
      const marker = new mapboxgl.Marker()
        .setLngLat([location.longitude, location.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(
              `<h3 class="font-bold">${location.name}</h3>
              <p>${location.address}<br>${location.postal_code} ${location.city}, ${location.state}</p>`
            )
        )
        .addTo(map.current);
      
      // Open popup by default
      marker.togglePopup();

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map. Please try again later.');
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [location]);

  // Create a Google Maps URL for the location
  const googleMapsUrl = encodeURI(`https://www.google.com/maps/search/?api=1&query=${location.address} ${location.city} ${location.state}`);

  return (
    <div className="h-full w-full relative">
      {mapError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <p className="text-red-500 mb-2">{mapError}</p>
            <p>You can still find us at:</p>
            <p className="font-bold">{location.name}</p>
            <p>{location.address}</p>
            <p>{location.postal_code} {location.city}, {location.state}</p>
            <a 
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-blue-600 hover:underline block"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      ) : (
        <>
          <div ref={mapContainer} className="absolute inset-0" />
          <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md z-10">
            <h3 className="font-bold text-barber-navy">{location.name}</h3>
            <p className="text-sm">{location.address}</p>
            <p className="text-sm">{location.postal_code} {location.city}, {location.state}</p>
            <a 
              href={googleMapsUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Open in Google Maps
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default Map;


import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  // Bağdat Caddesi coordinates (approximate)
  const longitude = 29.0587;
  const latitude = 40.9625;

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map with Mapbox public token
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZS1haS1kZXYiLCJhIjoiY2xweWIxdzc3MGkxcjJqbzVrdzZrdngyNCJ9.fsywR9wMZ_K-OmvqYpKJSg';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [longitude, latitude], // Istanbul - Bağdat Caddesi
      zoom: 14
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add marker for the barbershop location
    const marker = new mapboxgl.Marker()
      .setLngLat([longitude, latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(
            `<h3 class="font-bold">EliteCuts</h3>
            <p>Bağdat Cad. No:105/B<br>Kadıköy, Istanbul</p>`
          )
      )
      .addTo(map.current);
    
    // Open popup by default
    marker.togglePopup();

    // Clean up on unmount
    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="h-full w-full relative">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md z-10">
        <h3 className="font-bold text-barber-navy">Our Location</h3>
        <p className="text-sm">Bağdat Cad. No:105/B, Kadıköy, Istanbul</p>
        <a 
          href="https://www.google.com/maps/search/?api=1&query=Ba%C4%9Fdat+Cad.+No:105%2FB+Kad%C4%B1k%C3%B6y+Istanbul" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          Open in Google Maps
        </a>
      </div>
    </div>
  );
};

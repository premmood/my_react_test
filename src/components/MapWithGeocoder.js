import React, { useState, useRef, useEffect } from 'react';
import MapGL, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

const MapWithGeocoder = ({ onLocationSubmit }) => {
  const [viewport, setViewport] = useState({
    latitude: -25.7,
    longitude: 134.5,
    zoom: 4
  });
  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);
  const geocoderRef = useRef(null); // Create a ref for the geocoder

  // Initialize the geocoder and attach it to the map
  const initializeGeocoder = (mapboxMap) => {
    if (!geocoderRef.current) {
      const geocoder = new MapboxGeocoder({
        accessToken: process.env.REACT_APP_MAPBOX_TOKEN,
        mapboxgl: mapboxMap,
        marker: false,
        zoom: 14
      });

      geocoder.on('result', (event) => {
        const result = event.result;
        setLocation(result);
        setViewport({
          ...viewport,
          latitude: result.center[1],
          longitude: result.center[0],
          zoom: 14
        });
        onLocationSubmit(result);
      });

      mapboxMap.addControl(geocoder, 'top-left');
      geocoderRef.current = geocoder;
    }
  };

  useEffect(() => {
    // Capture the current value of mapRef in a variable
    const map = mapRef.current;

    // This effect is now only responsible for cleaning up
    return () => {
      if (map) {
        const mapboxMap = map.getMap();
        if (geocoderRef.current) {
          mapboxMap.removeControl(geocoderRef.current);
        }
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount and once on unmount

  const handleMapLoad = () => {
    if (mapRef.current) {
      const mapboxMap = mapRef.current.getMap();
      initializeGeocoder(mapboxMap);
    }
  };

  return (
    <div style={{ height: '250px', width: '100%' }}>
      <MapGL
        ref={mapRef}
        {...viewport}
        width="100%"
        height="100%"
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        onViewportChange={setViewport}
        mapStyle="mapbox://styles/mapbox/navigation-day-v1"
        onLoad={handleMapLoad} // Add the onLoad event handler
      >
        {location && (
          <Marker
            latitude={location.center[1]}
            longitude={location.center[0]}
          >
          </Marker>
        )}
      </MapGL>
    </div>
  );
};

export default MapWithGeocoder;

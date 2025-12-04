import React, { useState, useEffect, useRef } from 'react';
import { Segment, Image } from 'semantic-ui-react';

const SmallMap = ({ latitude, longitude }) => {
  const mapContainerRef = useRef(null); // Reference to the map container
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 }); // State for map size

  useEffect(() => {
    if (mapContainerRef.current) {
      // Get the width and height of the container
      const { width, height } = mapContainerRef.current.getBoundingClientRect();
      setMapSize({ 
        width: Math.round(width), // Round off to nearest whole number
        height: Math.round(height) // Round off to nearest whole number
      });
    }
  }, []); // Empty dependency array ensures this runs once after the first render
  

  // URL of the didgUgo logo
  const logoURL = encodeURIComponent('https://didgugo-logo.s3.ap-southeast-2.amazonaws.com/didgugo-marker.png');

  // Construct the URL for the static map with custom marker
  const staticMapURL = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/url-${logoURL}(${longitude},${latitude})/${longitude},${latitude},15,0/${mapSize.width}x${mapSize.height}?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`;

  return (
    <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }}>
      <Segment basic textAlign="center">
        {/* Render the image only if the width and height are calculated */}
        {mapSize.width && mapSize.height && (
          <Image src={staticMapURL} alt="Map" style={{ width: '100%', height: '100%' }} />
        )}
      </Segment>
    </div>
  );
};

export default SmallMap;

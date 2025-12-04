import React from 'react';
import { Segment } from 'semantic-ui-react';

const SmallMapA4 = ({ latitude, longitude }) => {
  if (isNaN(latitude) || isNaN(longitude)) {
    return <div>Invalid location data</div>;
  }

  // URL of the didgUgo logo (replace this with the actual URL of your logo)
  const logoURL = encodeURIComponent('https://didgugo-logo.s3.ap-southeast-2.amazonaws.com/didgugo-marker.png');

  // Construct the URL for the static map with custom marker
  const staticMapURL = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/url-${logoURL}(${longitude},${latitude})/${longitude},${latitude},15,0/300x150?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`;

  return (
    <Segment basic textAlign="center">
      <img src={staticMapURL} alt="Map" style={{width: 300, height: 150}} />
    </Segment>
  );
};

export default SmallMapA4;

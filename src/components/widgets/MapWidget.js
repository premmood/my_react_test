import React from 'react';
import SmallMapA4 from '../SmallMapA4';
import { Segment } from 'semantic-ui-react';
// // console.log(`Map Widget Mounted`);


const MapWidget = ({ icon, latitude, longitude }) => {
  // // console.log(`In Map Widget Function`);
  return (
    <Segment basic>
      {/* <Icon size='large' name={icon} /> */}
      <SmallMapA4 latitude={latitude} longitude={longitude} />
    </Segment>
  );
};

export default MapWidget;

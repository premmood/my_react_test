import React from 'react';
import { Segment } from 'semantic-ui-react';
import { QRCodeSVG } from 'qrcode.react';
import logo from '../../qr_code_logo.png';
// // console.log(`QR Code Widget Mounted`);

const QRCodeWidget = ({ qrCodeUrl }) => {
  // // console.log(`In QR Code Widget Function`);
  // // // console.log('QR Code URL in Widget:', qrCodeUrl); // Debugging log

  if (!qrCodeUrl) {
    // If qrCodeUrl is not yet available, display a loading or placeholder message
    return <Segment basic textAlign="center">Loading QR Code...</Segment>;
  }

  return (
    <Segment basic textAlign="center">
      <QRCodeSVG 
        value={qrCodeUrl}
        size={325}
        includeMargin={true}
        level={"H"}
        fgColor={'#000000'}
        imageSettings={{
          src: logo,
          x: undefined,
          y: undefined,
          height: 130,
          width: 130,
          excavate: true,
        }}
      />
    </Segment>
  );
};

export default QRCodeWidget;

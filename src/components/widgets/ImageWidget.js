import React from 'react';

const ImageWidget = ({ logoUrl }) => (
  <div style={{ textAlign: 'center' }}>
    {logoUrl ? (
      <img src={logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '180px' }} />
    ) : (
      <p>No Logo Available</p>
    )}
  </div>
);

export default ImageWidget;

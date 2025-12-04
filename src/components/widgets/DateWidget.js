import React from 'react';
// // console.log(`Date Widget Mounted`);

const DateWidget = () => {
  // // console.log(`In Date Widget Function`);
  // Get the current date
  const currentDate = new Date();
  // // console.log(`Current Date: `, currentDate);

  // Format the date as "DD MMM, YYYY"
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div style={{ textAlign: 'center', padding: '10px' }}>
      <p>Date Printed: {formattedDate}</p>
    </div>
  );
};

export default DateWidget;

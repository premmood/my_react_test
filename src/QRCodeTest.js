import React, { useEffect, useState } from 'react';
import apiWrapper from './apiWrapper';

const QRCodeTest = () => {
  // State to store fetched data from the backend
  const [data, setData] = useState(null);

  // Effect to fetch data from the backend on component mount
  useEffect(() => {
    // // // console.log("Fetching data from the backend...");

    // Function to fetch data asynchronously
    const fetchData = async () => {
      try {
        // Fetch data from the backend using the API wrapper
        const response = await apiWrapper.getAllQRCodes();
        // // // console.log("Data received:", response);

        // Update the component state with the fetched data
        setData(response);
      } catch (error) {
        // // // console.log("Fetch error:", error);
      }
    };

    // Call the fetchData function to initiate the data fetch
    fetchData();
  }, []); // The empty dependency array ensures this effect runs only on component mount

  return (
    <div>
      <h1>QR Code Test</h1>
      {data ? ( // Conditional rendering based on whether data is available
        <pre>{JSON.stringify(data, null, 2)}</pre> // Display the data as a formatted JSON string
      ) : (
        "Loading..." // Display a loading message while data is being fetched
      )}
    </div>
  );
};

export default QRCodeTest;

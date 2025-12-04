import React, { useState } from 'react';
import { usePapaParse } from 'react-papaparse';
import apiWrapper from '../apiWrapper'; // Ensure this is the correct path to your API wrapper
import { Table, Button, Loader } from 'semantic-ui-react';

function CSVUploadComponent({ onProcessingComplete }) {
  const { readString } = usePapaParse();
  const [addresses, setAddresses] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        readString(text, {
          complete: (results) => {
            setAddresses(results.data.map((item) => ({
              ...item,
              geocodeStatus: 'Pending',
              coordinates: null,
            })));
          },
          header: true,
        });
      };
      reader.readAsText(file);
    }
  };

  const handleApiResponse = (response, addressIndex) => {
    setAddresses(prevAddresses =>
      prevAddresses.map((address, index) =>
        index === addressIndex ? { ...address, geocodeStatus: getStatusFromResponse(response) } : address
      )
    );
  };

  const getStatusFromResponse = (response) => {
    switch (response.status) {
      case 409:
        return 'Already Exists';
      case 201:
        return 'Success';
      case 422:
        return 'Address Not Found'
      default:
        return 'Failed';
    }
  };

  const handleGeocode = async (addressObject, index) => {
    try {
      const response = await apiWrapper.geocodeAddress(addressObject.address);
      handleApiResponse({ status: 201, data: response }, index);
    } catch (error) {
      handleApiResponse({ status: error.response ? error.response.status : 500 }, index);
    }
  };

  const handleGeocodeAll = async () => {
    setIsGeocoding(true);
    const geocodePromises = addresses.map((addressObject, index) =>
      handleGeocode(addressObject, index)
    );

    await Promise.allSettled(geocodePromises);
    setIsGeocoding(false);
    if (onProcessingComplete) {
      onProcessingComplete();
    }
  };

  const renderStatus = (status) => {
    let statusClass = '';
    switch (status) {
      case 'Pending':
        return isGeocoding ? <Loader active inline size="small" /> : status;
      case 'Success':
        statusClass = 'success-status';
        break;
      case 'Failed':
        statusClass = 'failed-status';
        break;
      case 'Already Exists':
        statusClass = 'already-exists-status';
        break;
      case 'Address Not Found':
          statusClass = 'address-not-found-status';
          break;
      default:
        statusClass = '';
    }
    return <span className={statusClass}>{status}</span>;
  };

  return (
    <div>
      <style>
        {`
          .success-status {
            color: green;
          }
          .failed-status {
            color: red;
          }
          .already-exists-status {
            color: blue;
          }
          .address-not-found-status {
            color: red;
          }
        `}
      </style>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <Button onClick={handleGeocodeAll} disabled={isGeocoding || addresses.length === 0} primary>
        Validate and Import
      </Button>
      {addresses.length > 0 && (
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Address</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {addresses.map((address, index) => (
              <Table.Row key={index}>
                <Table.Cell>{address.address}</Table.Cell>
                <Table.Cell>{renderStatus(address.geocodeStatus)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </div>
  );
}

export default CSVUploadComponent;

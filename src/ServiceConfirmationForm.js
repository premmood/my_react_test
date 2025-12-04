import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import apiWrapper from './apiWrapper';
import { Form, Button, Select, Message } from 'semantic-ui-react';
import ServiceConfirmationCheckOutForm from './ServiceConfirmationCheckOutFrom';
import ServiceConfirmationJobCommencedNotice from './ServiceConfirmationJobCommencedNotice';

const ServiceConfirmationForm = ({ qrCodeIdProp, locationProp, statusProp }) => {
  const { userId } = useUser();
  const locationObj = useLocation();
  const navigate = useNavigate();

  const [qrCodeId, setQrCodeId] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [serviceType, setServiceType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [serviceConfirmationExists, setServiceConfirmationExists] = useState(false);
  const [serviceConfirmationData, setServiceConfirmationData] = useState(null);

  const ServiceStates = {
    CHECK_IN: 'check-in',
    CHECK_OUT: 'check-out'
  };

  const serviceOptions = [
    { key: 'g', value: 'Gardening', text: 'Gardening' },
    { key: 'n', value: 'Nursing', text: 'Nursing' },
    // Add more options as needed
  ];

  useEffect(() => {
    // console.log('ServiceConfirmationForm useEffect called');
    // console.log(`Current URL: ${locationObj.pathname}${locationObj.search}`);

    const fetchData = async () => {
      try {
        const qrCodeIdTemp = qrCodeIdProp || new URLSearchParams(locationObj.search).get('qrCodeId');

        const response = await apiWrapper.readLatestServiceConfirmationForUser(qrCodeIdTemp);
        if (response.data) {
          if (response.data.state === ServiceStates.CHECK_IN) {
            setServiceConfirmationExists(true);
            setServiceConfirmationData(response.data)
          } else {
            setServiceConfirmationExists(false);
            setServiceConfirmationData(null);
          }
        } else {
          setServiceConfirmationExists(false);
        }
      } catch (error) {
        // console.error('Error fetching service confirmation:', error);
        setError('An error occurred while initiating service confirmation data.');
      }
    };

    const qrCodeIdTemp = qrCodeIdProp || new URLSearchParams(locationObj.search).get('qrCodeId');
    const locationTemp = locationProp || new URLSearchParams(locationObj.search).get('location');
    const statusTemp = statusProp || new URLSearchParams(locationObj.search).get('status');

    // console.log(`Extracted URL params: qrCodeId=${qrCodeIdTemp}, location=${locationTemp}, status=${statusTemp}`);

    if (!qrCodeIdTemp || !locationTemp || !statusTemp) {
      // console.log('Missing URL parameters, redirecting to home');
      setError('Required parameters are missing from the URL.');
      navigate('/');
      return;
    }

    setQrCodeId(qrCodeIdTemp);
    setLocation(locationTemp);
    setStatus(statusTemp);

    fetchData(); 
  }, [locationObj, navigate, qrCodeIdProp, locationProp, statusProp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log('Form submission initiated');

    if (error) {
      // console.log('Form submission prevented due to existing error');
      return;
    }
    setIsSubmitting(true);

    try {
      // console.log('Sending service confirmation data to API');
      const response = await apiWrapper.createServiceConfirmation({
        userId,
        qrCodeId,
        location,
        serviceType,
        status,
      });

      // console.log('API response received:', response);
      if (response.status === 201) {
        navigate('/confirmation');
      }
    } catch (error) {
      console.error('An error occurred during form submission:', error);
      setError('An error occurred during form submission.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ui center aligned basic segment">
      <h1>Electronic Visit Verification</h1>
      {error && (
        <Message negative>
          <Message.Header>Error</Message.Header>
          <p>{error}</p>
        </Message>
      )}
      {
        serviceConfirmationExists ? (
          <div>
            <ServiceConfirmationJobCommencedNotice
              serviceType={serviceConfirmationData.serviceType}
              startTime={serviceConfirmationData.startTime}
              qrCodeId={serviceConfirmationData.qrCodeId}
            />
            <ServiceConfirmationCheckOutForm
              location={location}
              serviceConfirmationData={serviceConfirmationData}
            />
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Field>
              <label>QR Code ID</label>
              <input type="text" placeholder='QR Code ID' value={qrCodeId} readOnly />
            </Form.Field>
            <Form.Field>
              <label>Location</label>
              <input type="text" placeholder='Location' value={location} readOnly />
            </Form.Field>
            <Form.Field>
              <label>Status</label>
              <input type="text" placeholder='Status' value={status} readOnly />
            </Form.Field>
            <Form.Field
              control={Select}
              label='Service Type'
              options={serviceOptions}
              placeholder='Service Type'
              value={serviceType}
              onChange={(e, { value }) => setServiceType(value)}
            />
            <Button type='submit' primary disabled={isSubmitting}>Confirm Service</Button>
          </Form>
        )
      }
    </div>
  );
};

export default ServiceConfirmationForm;

import React, { useEffect, useState } from 'react';
import { Container, Header, Segment, Loader, Dimmer } from 'semantic-ui-react';
import apiWrapper from './apiWrapper';

const ServiceConfirmationJobCommencedNotice = ({ serviceType, startTime, qrCodeId }) => {
    const [clientName, setClientName] = useState('');
    const [formattedStartDateTime, setFormatedStartDateTime] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiWrapper.readPateintByQrCode(qrCodeId);
                if (response.data) {
                    setClientName(`${response.data.firstName} ${response.data.lastName}`);
                }
            } catch (error) {
                console.error('Error fetching patient detail:', error);
                // setError('An error occurred while fetching patient data.');
            }
        };

        const startDateTime = new Date(startTime);
        const fStartDateTime = startDateTime.toLocaleString();
        setFormatedStartDateTime(fStartDateTime);

        fetchData();
    }, []);

    return (
        <Container text style={{ marginTop: '2em' }}>
            <Segment padded="very" textAlign="center">
                <Header as="h1">Your "{serviceType}" Job Has Commenced.</Header>
                <p><b>Client : </b> {clientName}</p>
                <p><b>Checked-in at : </b> {formattedStartDateTime} </p>
            </Segment>
        </Container>

    );
};

export default ServiceConfirmationJobCommencedNotice;

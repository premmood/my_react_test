import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import apiWrapper from './apiWrapper';
import { Form, Button } from 'semantic-ui-react';
import Modal from 'react-modal';

const ServiceConfirmationCheckOutForm = ({ location, serviceConfirmationData }) => {
    const { userId } = useUser();
    const navigate = useNavigate();

    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progressNote, setProgressNote] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState('');

    const [difference, setDifference] = useState('');

    const calculateDifference = () => {
        const startDateTime = new Date(serviceConfirmationData.startTime);
        const endDateTime = Date.now();

        const difference = Math.abs(endDateTime - startDateTime);
        const hours = Math.floor(difference / (1000 * 3600)); // Calculate hours
        const minutes = Math.floor((difference % (1000 * 3600)) / (1000 * 60)); // Calculate remaining minutes

        if (hours !== 0) {
            setDifference(`${hours} hours ${minutes} minutes`);
        } else {
            setDifference(`${minutes} minutes`);
        }
    };

    useEffect(() => {
        calculateDifference();
    }, [isSubmitting])

    const handleProgressNoteChange = (event) => {
        setProgressNote(event.target.value);
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsSubmitting(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (error) {
            return;
        }

        setIsSubmitting(true);
        setConfirmationMessage('Are you sure you want to checkout?');
        openModal();
    };

    const handleConfirmation = async () => {
        closeModal();
        setIsSubmitting(true);

        try {
            // Perform form submission
            const response = await apiWrapper.updateServiceConfirmation(serviceConfirmationData.id, {
                userId,
                qrCodeId: serviceConfirmationData.qrCodeId,
                progressNote
            });

            if (response.status === 200) {
                navigate('/confirmation');
            }
        } catch (error) {
            // console.error('An error occurred during form submission:', error);
            setError('An error occurred during form submission.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="ui center aligned basic segment">
            <Form onSubmit={handleSubmit}>
                <Form.Field>
                    <label>QR Code ID</label>
                    <input className='ui disabled input' type="text" placeholder='QR Code ID' value={serviceConfirmationData.qrCodeId} readOnly />
                </Form.Field>
                <Form.Field>
                    <label>Location</label>
                    <input className='ui disabled input' type="text" placeholder='Location' value={location} readOnly />
                </Form.Field>
                <Form.Field>
                    <label>Status</label>
                    <input className='ui disabled input' type="text" placeholder='Status' value={serviceConfirmationData.status} readOnly />
                </Form.Field>
                <Form.Field>
                    <label>Service Type</label>
                    <input className='ui disabled input' type="text" placeholder='Status' value={serviceConfirmationData.serviceType} readOnly />
                </Form.Field>
                <Form.Field>
                    <label>Progress Note</label>
                    <textarea name='progressNote' placeholder='Progress Note' rows={4} value={progressNote} onChange={handleProgressNoteChange} />
                </Form.Field>

                <Button type='submit' primary disabled={isSubmitting}>Checkout</Button>
            </Form>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Confirmation Modal"
                className="ui modal"
                ariaHideApp={false}
                style={{
                    content: {
                        width: '300px',
                        height: 'auto',
                        margin: 'auto',
                        borderRadius: '8px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        position: 'relative',
                        top: '35%',
                    }
                }}
            >
                <div className="ui container center aligned">
                    <h1><i className="question circle outline teal huge icon"></i></h1>
                    <h2>{confirmationMessage}</h2>
                    <div class="content ui message">
                        {progressNote !== '' ? (<p><b>Progress Note</b> : {progressNote}</p>) : null}
                        <p><b>Duration</b> : {difference}</p>
                    </div>
                    <div className="extra content">
                        <div className="ui two buttons">
                            <div onClick={handleConfirmation} className="ui basic green button">Confirm</div>
                            <div onClick={closeModal} className="ui basic red button">Decline</div>
                        </div>
                    </div>

                </div>
            </Modal>
        </div>
    );
};

export default ServiceConfirmationCheckOutForm;

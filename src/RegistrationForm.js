import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiWrapper from './apiWrapper';
import { Button, Form, Message, Segment, Divider, Input, Dimmer, Loader } from 'semantic-ui-react';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    email: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    setErrorMessage('');

    setTimeout(async () => {
      try {
        const response = await apiWrapper.registerUser(formData);

        if (response.status === 201) {
          setIsRegistering(false);
          setShowSuccess(true);
          setTimeout(() => {
            navigate('/signin');
          }, 3000); // Delay for showing success message
        } else {
          setIsRegistering(false);
        }
      } catch (error) {
        setIsRegistering(false);
        if (error.response && error.response.data.message) {
          setErrorMessage(error.response.data.message);
        } else {
          console.error('An exception occurred:', error);
          setErrorMessage('An unexpected error occurred. Please try again.');
        }
      }
    }, 1250); // Delay before processing registration
  };

  const customFocusStyle = {
    backgroundColor: '#e8f0fe',
    borderColor: '#2185d0',
    outline: 'none',
    boxShadow: '0 0 0 0.2rem rgba(33, 133, 208, 0.25)'
  };

  return (
    <Segment textAlign='center' className="basic">
      <div className="text container">
        <h1>Create Your Account</h1>
        <p>We only need these simple details from you, to setup your new account.</p>
      </div>
      <Divider />
      {!showSuccess ? (
        <Form size='big' onSubmit={handleSubmit} error={!!errorMessage}>
          <Dimmer active={isRegistering} inverted>
            <Loader>Loading</Loader>
          </Dimmer>
          {errorMessage && <Message error content={errorMessage} />}
          <Form.Field disabled={isRegistering}>
            <Input
              type="tel"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              style={customFocusStyle}
            />
          </Form.Field>
          <Form.Field disabled={isRegistering}>
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={customFocusStyle}
            />
          </Form.Field>
          <Button primary type="submit" size='big' disabled={isRegistering}>
            Create My didgUgo Account
          </Button>
        </Form>
      ) : (
        <Message success header='Success!' content="Please Sign In with your mobile number." />
      )}
    </Segment>
  );
};

export default RegistrationForm;

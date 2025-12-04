import React, { useState } from 'react';
import { Form, Button, Message } from 'semantic-ui-react';
import apiWrapper from '../apiWrapper';

const InviteAdmins = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
  
    const handleInvite = async (e) => {
      e.preventDefault();
      try {
        await apiWrapper.inviteAdmin(email);
        setMessage(`Invitation sent to ${email}`);
        setIsError(false);
        setEmail('');
      } catch (error) {
        setMessage('Failed to send invitation. Please try again.');
        setIsError(true);
      }
    };
  
    return (
      <Form onSubmit={handleInvite}>
        <Form.Input
          fluid
          label="Admin's Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter admin's email"
          required
        />
        <Button type="submit" color="blue">Invite Admin</Button>
        {message && (
          <Message
            success={!isError}
            error={isError}
            content={message}
          />
        )}
      </Form>
    );
  };
  
  export default InviteAdmins;
  
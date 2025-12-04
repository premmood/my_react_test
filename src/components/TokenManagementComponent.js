import React, { useState } from 'react';
import { Button, Segment, Header, Icon, Modal, Form, Message, Confirm } from 'semantic-ui-react';
import apiWrapper from '../apiWrapper'; // Adjust the path to your API wrapper

const TokenManagementComponent = () => {
  const [token, setToken] = useState('');
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateToken = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiWrapper.generateApiToken();
      setToken(response.data.token);
      setIsTokenModalOpen(true);
      setLoading(false);
    } catch (error) {
      console.error('Error generating token:', error);
      setError('Failed to generate API token');
      setLoading(false);
    }
  };

  const handleConfirmOpen = () => setIsConfirmOpen(true);
  const handleConfirmCancel = () => setIsConfirmOpen(false);
  const handleConfirmGenerateToken = () => {
    handleGenerateToken();
    setIsConfirmOpen(false);
  };

  return (
    <Segment basic loading={loading}>
      <Header as='h2'>
        <Icon name='key' />
        API Token Management
      </Header>

      <p>Manage your API token here. Use the "Generate" button to create a new token or replace an existing one.</p>
      <p>This token has special permissions and should be kept extra-secure like an administrator's password</p>
      {error && <Message error content={error} />}

      <Button color='black' size='big' onClick={handleConfirmOpen}>
        Generate/Re-Generate API Token
      </Button>

      <Confirm
        open={isConfirmOpen}
        onCancel={handleConfirmCancel}
        onConfirm={handleConfirmGenerateToken}
        content="Are you sure you want to generate a new API token? If you already have an existing token, it will be replaced."
      />

      <Modal
        open={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        size='small'
      >
        <Modal.Header>Generated API Token</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.TextArea
              label='Token'
              value={token}
              readOnly
            />
            <Message info>
              <Message.Header>Important</Message.Header>
              <p>Copy this token and store it securely. It will not be shown again.</p>
              <p>Please direct your integration team to this API documentation: </p>
              <a href="https://app.didgugo.com/api/docs" target="_blank">https://app.didgugo.com/api/docs</a>
            </Message>
            <Button onClick={() => setIsTokenModalOpen(false)} primary>
              Close
            </Button>
          </Form>
        </Modal.Content>
      </Modal>
    </Segment>
  );
};

export default TokenManagementComponent;

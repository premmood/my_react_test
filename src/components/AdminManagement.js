import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Icon, Segment, Header, Message, Card, Divider } from 'semantic-ui-react';
import apiWrapper from '../apiWrapper';
import { useUser } from '../UserContext'; // Adjust this path to where your UserContext is located

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Accessing the userId from UserContext
  const { userId } = useUser();
  // Fetch admin list
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await apiWrapper.listAdmins();
      setAdmins(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      setError('Failed to fetch admin data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Function to handle inviting a new admin (adjusted to include phone number)
  const handleInvite = async () => {
    if (!validateAustralianMobile(newAdminPhone)) {
      setError('Invalid phone number format. Expected format: 04XXXXXXXX');
      return;
    }
    setIsInviting(true); // Disable the button


    try {
      setLoading(true);
      await apiWrapper.inviteAdmin({ email: newAdminEmail, phoneNumber: newAdminPhone });
      fetchAdmins();
      setIsInviteModalOpen(false);
      setNewAdminEmail('');
      setNewAdminPhone('');
    } catch (error) {
      console.error('Failed to invite admin:', error);
      setError('Failed to send invite');
    } finally {
      setLoading(false);
      setIsInviting(false); // Re-enable the button
    }
  };

  // Function to validate Australian mobile number
  const validateAustralianMobile = (phone) => /^04\d{8}$/.test(phone);

  // Function to toggle admin's active status
  const toggleAdminStatus = async (adminId) => {
    try {
      setLoading(true);
      await apiWrapper.toggleAdminStatus(adminId);
      fetchAdmins(); // Refresh the list after toggling status
    } catch (error) {
      console.error('Failed to toggle admin status:', error);
      setError('Failed to toggle admin status');
    } finally {
      setLoading(false);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Segment basic loading={loading}>
      <Header as='h2'>
        <Icon name='settings' />
        Admin Management
      </Header>

      {error && <Message error content={error} />}

      <Button size='big' color='black' onClick={() => setIsInviteModalOpen(true)}>Invite New Admin</Button>
      <Divider />
      <Card.Group>
        {admins.map(admin => (
          <Card key={admin.id}>
            <Card.Content>
              <Card.Header>{admin.email}</Card.Header>
              <Card.Meta>
                Registered Phone: {admin.phoneNumber}
              </Card.Meta>
              <Card.Description>
                <Header as='h5'>Verification Status</Header>
                <p>{admin.isEmailVerified ? 'Verified' : 'Invited, Not Verified Yet'}</p>
                <Header as='h5'>Date Created</Header>
                <p>{formatDate(admin.createdAt)}</p>
              </Card.Description>
            </Card.Content>
            <Card.Content extra>
              <Button.Group>
                <Button
                  disabled={String(admin.id) === String(userId)}
                  color={admin.isActive ? 'green' : null}
                  active={admin.isActive}
                  onClick={() => !admin.isActive && toggleAdminStatus(admin.id)}
                >
                  Active
                </Button>
                <Button.Or />
                <Button
                  disabled={String(admin.id) === String(userId)}
                  color={!admin.isActive ? 'red' : null}
                  active={!admin.isActive}
                  onClick={() => admin.isActive && toggleAdminStatus(admin.id)}
                >
                  Inactive
                </Button>
              </Button.Group>
            </Card.Content>
          </Card>
        ))}
      </Card.Group>


      <Modal
        open={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setIsInviting(false); // Reset when modal is closed
        }}
        size='small'
      >
        <Modal.Header>Invite New Admin</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Input
              label='Email Address'
              type='email'
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
            />
            <Form.Input
              label='Phone Number'
              type='text'
              value={newAdminPhone}
              onChange={(e) => setNewAdminPhone(e.target.value)}
            />
            {error && <Message error content={error} />}
            <Button onClick={handleInvite} primary disabled={isInviting}>
              {isInviting ? 'Inviting...' : 'Invite'}
            </Button>
          </Form>
        </Modal.Content>
      </Modal>
    </Segment>
  );
};

export default AdminManagement;
import React, { useEffect } from 'react';
import { useUser } from './UserContext';
import logo from './didgUgo_512_logo.png';
import { useNavigate } from 'react-router-dom';
import { Card, Header, Image, Button, Segment, Icon, Divider } from 'semantic-ui-react';

const LandingPage = () => {
  const { handleMagicLinkToken, isAdmin } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const token = urlSearchParams.get('token');
    if (token) {
      handleMagicLinkToken(token);
    }
  }, [handleMagicLinkToken]);

  return (
    <>
      <style>
        {`
          .custom-button {
            min-height: 50px; /* Adjust this value based on your needs */
            white-space: normal; /* Ensure text wraps as needed */
            word-wrap: break-word; /* Break the word to next line if it's too long */
            padding: 5px; /* Add padding for better readability */
          }
          .custom-card {
            height: 320px; /* Adjust this value to set the desired card height */
          }
          @media only screen and (max-width: 720px) {
            .hide-on-small-screen {
              display: none;
            }
          }
        `}
      </style>
      <Segment basic textAlign='center' className="white">
        <Header as='h1' textAlign='center'>Welcome to didgUgo</Header>
        <Image src={logo} alt="didgUgo Logo" centered size='medium' style={{ margin: 'auto' }} />
        <Header as='h2' textAlign='center'>It's like Goods Receipting, for People.</Header>
        <div className="hide-on-small-screen">
        <Card.Group itemsPerRow={5} centered>
        {isAdmin && (
            <Card className='custom-card'>
              <Card.Content>
                <Card.Header>QR Code Management</Card.Header>
                <Divider />
                <Icon size={'huge'} name='qrcode' />
                <Divider />
                <Card.Description> Import addresses from a CSV, print or save PDFs of your QR codes.</Card.Description>
              </Card.Content>
              <Card.Content extra>
                <Button className='custom-button' color='orange' size='huge' onClick={() => navigate('/generate-qrcode')}>
                  Create and Print QR Codes
                </Button>
              </Card.Content>
            </Card>
          )}
        {isAdmin && (
            <Card className='custom-card'>
              <Card.Content>
                <Card.Header>Service Confirmations</Card.Header>
                <Divider />
                <Icon size={'huge'} name='check square outline' />
                <Divider />
                <Card.Description>Real-time access to view and download Service Confirmations.</Card.Description>
              </Card.Content>
              <Card.Content extra>
                <Button className='custom-button' color='blue' size='huge' onClick={() => navigate('/manage-service-confirmations')}>
                  Manage Service Confirmations
                </Button>
              </Card.Content>
            </Card>
          )}
        {isAdmin && (
            <Card className='custom-card'>
              <Card.Content>
                <Card.Header>Dashboards</Card.Header>
                <Divider />
                <Icon size={'huge'} name='dashboard' />
                <Divider />
                <Card.Description>Live statistics from your Service Confirmation activity.</Card.Description>
              </Card.Content>
              <Card.Content extra>
                <Button className='custom-button' color='green' size='huge' onClick={() => navigate('/dashboard')}>
                  Access Real-Time Insights
                </Button>
              </Card.Content>
            </Card>
          )}
        {isAdmin && (
            <Card className='custom-card'>
              <Card.Content>
                <Card.Header>PDF Templates</Card.Header>
                <Divider />
                <Icon size={'huge'} name='file pdf outline' />
                <Divider />
                <Card.Description>Save your own printable A4 templates, with your branding, text and layout.</Card.Description>
              </Card.Content>
              <Card.Content extra>
                <Button className='custom-button' color='red' size='huge' onClick={() => navigate('/template-management')}>
                  Customise PDF Templates
                </Button>
              </Card.Content>
            </Card>
          )}
        {isAdmin && (
            <Card className='custom-card'>
              <Card.Content>
                <Card.Header>Settings</Card.Header>
                <Divider />
                <Icon size={'huge'} name='cogs' />
                <Divider />
                <Card.Description>View and export audit logs and configure your environment.</Card.Description>
              </Card.Content>
              <Card.Content extra>
                <Button className='custom-button' size='huge' onClick={() => navigate('/manage-organisation')}>
                  Setup Your Environment
                </Button>
              </Card.Content>
            </Card>
          )}
        </Card.Group>
        </div>
      </Segment>
    </>
  );
};

export default LandingPage;

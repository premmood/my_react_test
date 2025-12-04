import React, { useEffect, useState } from 'react';
import { useUser } from './UserContext';
import { Container, Header, Segment, Loader, Dimmer } from 'semantic-ui-react';

const Confirmation = () => {
  const { logout } = useUser();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    // Set a timeout for showing the loader
    const loaderTimeoutId = setTimeout(() => {
      setShowLoader(true);
    }, 2000); // Show loader after 2 seconds

    // Set a timeout for auto logout
    const logoutTimeoutId = setTimeout(() => {
      logout();
    }, 4000); // Logout after an additional 2 seconds

    // Cleanup function to clear the timeouts if the component unmounts
    return () => {
      clearTimeout(loaderTimeoutId);
      clearTimeout(logoutTimeoutId);
    };
  }, [logout]);

  return (
    <Container text style={{ marginTop: '2em' }}>
      <Segment padded="very" textAlign="center">
        <Header as="h1">Service Confirmation Successful</Header>
        <p>Your service has been successfully confirmed. You will be logged out shortly.</p>
        
        {showLoader && (
          <Dimmer active inverted>
            <Loader size='large'>Logging out...</Loader>
          </Dimmer>
        )}
      </Segment>
    </Container>
  );
};

export default Confirmation;

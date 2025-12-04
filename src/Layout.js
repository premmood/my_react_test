import React, { useState } from 'react';
import { createMedia } from '@artsy/fresnel';
import { Menu, Segment, Container, Button, Icon, Sidebar } from 'semantic-ui-react';
import AdminNavLinks from './AdminNavLinks';
import { useUser } from './UserContext';
import logoIcon from './didgUgo_128_logo.png';
import { useLocation, useNavigate } from 'react-router-dom';

const { Media, MediaContextProvider } = createMedia({
  breakpoints: {
    mobile: 0,
    tablet: 768,
    computer: 1024,
  },
});

const DesktopContainer = ({ children, onNewUserClick }) => {
  const { isAdmin, logout, userId } = useUser();
  const location = useLocation();
  const hideNewUserButton = userId || location.pathname === '/register' || location.pathname === '/business-case-builder';

  return (
    <Media greaterThan="mobile">
      <Segment style={{ backgroundColor: '#fafbfd' }} textAlign="center" vertical>
        <Menu borderless fixed="top">
          <Container>
            <Menu.Item as="a" href="/" header>
              <img src={logoIcon} alt="logo" />
              didgUgo
            </Menu.Item>
            {isAdmin && <AdminNavLinks />}
            <Menu.Menu position="right">
              {!hideNewUserButton && (
                <Menu.Item>
                  <Button color="green" size="large" style={{ marginLeft: '0.5em' }} onClick={onNewUserClick}>
                    New User
                  </Button>
                </Menu.Item>
              )}
              {userId && (
                <Menu.Item onClick={logout}>
                  <Icon name="lock" />
                  Sign Out
                </Menu.Item>
              )}
            </Menu.Menu>
          </Container>
        </Menu>
        {children}
      </Segment>
    </Media>
  );
};

const MobileContainer = ({ children, onNewUserClick }) => {
  const { isAdmin, logout, userId } = useUser();
  const [sidebarOpened, setSidebarOpened] = useState(false);
  const location = useLocation();
  const hideNewUserButton = userId || location.pathname === '/register';

  return (
    <Media as={Sidebar.Pushable} at="mobile">
      <Sidebar.Pushable>
        <Sidebar 
          as={Menu} 
          borderless 
          animation="overlay" 
          onHide={() => setSidebarOpened(false)} 
          vertical 
          visible={sidebarOpened}
        >
          <Menu.Item as="a" href="/" header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={logoIcon} alt="logo" style={{ width: '40%', margin: '10px auto' }} />
            <div className="ui divider hidden" style={{ textAlign: 'center', marginTop: '10px' }}>didgUgo</div>
          </Menu.Item>
          {!hideNewUserButton && (
            <Menu.Item>
              <Button color="green" style={{ marginLeft: '0.5em' }} onClick={onNewUserClick}>
                New User
              </Button>
            </Menu.Item>
          )}
          {isAdmin && <AdminNavLinks />}
          {userId && (
            <Menu.Item onClick={logout}>
              <Icon name="lock" />
              Sign Out
            </Menu.Item>
          )}
        </Sidebar>
        <Sidebar.Pusher dimmed={sidebarOpened}>
          <Segment textAlign="center" vertical>
            <Container>
              <Menu pointing secondary size="large">
                <Menu.Item onClick={() => setSidebarOpened(true)}>
                  <Icon name="sidebar" />
                </Menu.Item>
                {!hideNewUserButton && (
                  <Menu.Item position="right">
                    <Button color="green" onClick={onNewUserClick}>
                      New User
                    </Button>
                  </Menu.Item>
                )}
              </Menu>
            </Container>
            {children}
          </Segment>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </Media>
  );
};


const ResponsiveContainer = ({ children, onNewUserClick }) => (
  <MediaContextProvider>
    <DesktopContainer onNewUserClick={onNewUserClick}>{children}</DesktopContainer>
    <MobileContainer onNewUserClick={onNewUserClick}>{children}</MobileContainer>
  </MediaContextProvider>
);

const Layout = ({ children }) => {
  const { setIsRegistering } = useUser();
  const navigate = useNavigate();

  const handleNewUserClick = () => {
    setIsRegistering(true);
    navigate('/register');
  };

  return (
    <ResponsiveContainer onNewUserClick={handleNewUserClick}>
      <div style={{ paddingTop: '60px' }}>
        {children}
      </div>
    </ResponsiveContainer>
  );
};

export default Layout;

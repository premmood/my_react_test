import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Icon, Menu } from 'semantic-ui-react';

const AdminNavLinks = () => {
  const location = useLocation();

  const adminNavItems = [
    { to: '/generate-qrcode', icon: 'qrcode', text: 'QR Codes', color: 'orange', tourClass: 'tour-nav-qrcode' },
    { to: '/manage-service-confirmations', icon: 'check square outline', text: 'Confirmations', color: 'blue', tourClass: 'tour-nav-sc' },
    { to: '/dashboard', icon: 'dashboard', text: 'Dashboards', color: 'green', tourClass: 'tour-nav-dashboard' },
    { to: '/template-management', icon: 'file pdf outline', text: 'PDF Templates', color: 'red', tourClass: 'tour-nav-pdf' },
    { to: '/manage-organisation', icon: 'cogs', text: 'Settings', color: 'grey', tourClass: 'tour-nav-settings' }
  ];
  return (
    <>
      {adminNavItems.map((item, index) => {
        // Check if the current path is the same as this item's path
        const isActive = location.pathname === item.to;
        const activeStyle = isActive ? { borderBottom: '4px solid black', background: '#fff' } : {};
        return (
          <Menu.Item key={index} active={isActive} style={activeStyle}>
            <Button
              size="large"
              as={Link}
              to={item.to}
              className={`${item.tourClass} ${isActive ? 'active-item' : ''}`}
              color={item.color}
            >
              <Icon name={item.icon} />
              {item.text}
            </Button>
          </Menu.Item>
        );
      })}
    </>
  );
};

export default AdminNavLinks;
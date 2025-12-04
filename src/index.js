import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { UserProvider } from './UserContext';
import { AppProvider } from './AppContext'; // Import AppProvider
import 'semantic-ui-css/semantic.min.css';

const AppWrapper = () => {
  useEffect(() => {
    // Log a message when the component is mounted or updated
    // // console.log("Index component mounted or updated");
  }, []);

  return (
    <UserProvider>
      <AppProvider> {/* Wrap App with AppProvider */}
        <App />
      </AppProvider>
    </UserProvider>
  );
};

const root = document.getElementById('root');
const appRoot = createRoot(root);
appRoot.render(<AppWrapper />);

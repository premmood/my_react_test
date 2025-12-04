import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import apiWrapper from './apiWrapper';
import logo from './didgUgo_512_logo.png';

const SignInForm = () => {
  // const navigate = useNavigate();
  const { handleMagicLinkToken, handleSignInToken, entryPoint } = useUser();
  const [formData, setFormData] = useState({ phoneNumber: '' });
  const [adminCredentials, setAdminCredentials] = useState({ email: '', password: '' });
  const [signInError, setSignInError] = useState(null);
  const [magicLinkState, setMagicLinkState] = useState({
    link: null,
    sent: false,
    expired: false,
    progress: 0,
    adminSignInRequired: false,
  });

  /* const updateFormData = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 */
  /*   const updateAdminCredentials = (e) => {
      setAdminCredentials({ ...adminCredentials, [e.target.name]: e.target.value });
    };
   */
  const handleResponse = (response) => {
    if (response.data.adminSignInRequired) {
      setMagicLinkState({ ...magicLinkState, adminSignInRequired: true });
    } else {
      setMagicLinkState({
        ...magicLinkState,
        link: response.data.magicLink,
        sent: true,
        expired: false,
      });
    }
  };

  const requestMagicLink = async () => {
    try {
      const response = await apiWrapper.generateMagicLink({
        phoneNumber: formData.phoneNumber,
        magicLinkEntryPoint: entryPoint,
      });

      if (response.status === 200) {
        handleResponse(response);
      }
    } catch (error) {
      console.error('Error generating magic link:', error);
      // Implement user-facing error handling here
    }
  };

  const extractToken = (link) => new URLSearchParams(new URL(link).search).get('token');

  const handleMagicLinkClick = async (e) => {
    e.preventDefault();
    if (!magicLinkState.expired && magicLinkState.link) {
      const token = extractToken(magicLinkState.link);
      if (token) {
        handleMagicLinkToken(token);
        try {
          const response = await apiWrapper.getSignInToken(token);
          if (response.status === 200) {
            handleSignInToken(response.data.signInToken);
            // Removed navigate(entryPoint);
          }
        } catch (error) {
          console.error('Error fetching sign-in token:', error);
        }
      }
    }
  };

  const handleAdminSignIn = async (e) => {
    e.preventDefault();
    setSignInError(null);
    try {
      const response = await apiWrapper.signIn({
        phoneNumber: formData.phoneNumber,
        email: adminCredentials.email,
        password: adminCredentials.password,
      });
      if (response.status === 200) {
        handleSignInToken(response.data.token);
        // Removed navigate('/');
      } else if (response.status === 304) {
        setSignInError('Admin account not yet verified...');
      }
    } catch (error) {
      console.error('Error during admin sign-in:', error);
      setSignInError('Incorrect email or password. Please try again.');
    }
  };

  useEffect(() => {
    let newTimer = null;
    if (magicLinkState.sent) {
      setMagicLinkState(prevState => ({ ...prevState, progress: 0 }));
      newTimer = setInterval(() => {
        setMagicLinkState(prevState => {
          if (prevState.progress >= 100) {
            clearInterval(newTimer);
            return { ...prevState, sent: false, expired: true, progress: 0 };
          }
          return { ...prevState, progress: prevState.progress + (100 / 5) };
        });
      }, 1000);
    }
    return () => clearInterval(newTimer);
  }, [magicLinkState.sent]);

  // Custom focus style
  const customFocusStyle = {
    backgroundColor: '#e8f0fe', // Light blue background
    borderColor: '#2185d0', // Semantic UI primary color
    outline: 'none',
    boxShadow: '0 0 0 0.2rem rgba(33, 133, 208, 0.25)',
  };


  return (
    <div className="ui center aligned basic segment">
      <img
        className="ui medium centered image"
        src={logo}
        alt="didgUgo Logo"
        style={{
          display: 'block',
          margin: 'auto',
          width: '100px',  // Set the width to a smaller value
          height: 'auto'   // Set height to auto to maintain aspect ratio
        }}
      />
      <div className="ui divider"></div>
      <div className="ui text container">
        <h1>Enter your mobile number below to sign in</h1>
        <h3>(or click the "New User" button if you don't have an account yet)</h3>
      </div>
      <div className="ui center aligned basic segment">
        <div className="ui text container">
          <div className="ui grid">
            <div className="sixteen wide column">
              <div className="ui input fluid">
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="04XX XXX XXX"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  style={{ ...customFocusStyle }}
                />
              </div>
            </div>
            <div className="sixteen wide column">
              <button type="button" className="ui primary big fluid button" onClick={requestMagicLink}>
                Submit
              </button>
            </div>

            {magicLinkState.adminSignInRequired && (
              <form onSubmit={handleAdminSignIn} className="sixteen wide column">
                <div className="ui input fluid">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter admin email"
                    value={adminCredentials.email}
                    onChange={(e) => setAdminCredentials({ ...adminCredentials, email: e.target.value })}
                    autoComplete="current-username"
                    style={{ ...customFocusStyle }}
                  />
                </div>
                <div className='ui divider hidden'></div>
                <div className="ui input fluid">
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter admin password"
                    value={adminCredentials.password}
                    onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                    autoComplete="current-password"
                    style={{ ...customFocusStyle }}
                  />
                </div>
                <div className='ui divider hidden'></div>
                {signInError && (
                  <div className="ui error message">
                    <p>{signInError}</p>
                  </div>
                )}
                <button type="submit" className="ui orange big fluid button">Sign In</button>
              </form>
            )}


            {magicLinkState.sent && (
              <div className="sixteen wide column">
                {magicLinkState.link && (
                  <p>
                    <a className="ui orange big button" href={magicLinkState.link} onClick={handleMagicLinkClick}>Click Here to Sign In (5 second timer)</a>
                  </p>
                )}
                <div className="ui attach progress orange active" data-percent={magicLinkState.progress}>
                  <div className="bar" style={{ transitionDuration: '50ms', width: `${magicLinkState.progress}%` }}>
                    <div className="progress"></div>
                  </div>
                </div>
              </div>
            )}

            {magicLinkState.expired && (
              <div className="ui basic">
                <p>Magic Link has expired. Please request a new one.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

};

export default SignInForm;

import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const apiInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// Add a request interceptor
apiInstance.interceptors.request.use((config) => {
  // Log the headers of the request

  // Important: return the config or the request will be blocked
  return config;
}, (error) => {
  // Handle the error
  return Promise.reject(error);
});

apiInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 400) {
      // Check if the error is due to an expired token
      if (error.response.data.message.includes('Token expired')) {
        // Trigger global modal or redirect logic
        handleTokenExpiry();
      }
    }
    return Promise.reject(error);
  }
);

const handleTokenExpiry = () => {
  // Dispatch a custom event
  window.dispatchEvent(new CustomEvent('token-expired'));
};

/* const getAuthToken = () => localStorage.getItem('signInToken'); */
const getAuthToken = () => {
  // Read the cookie named 'signInToken'
  const cookieArray = document.cookie.split(';');
  for (let i = 0; i < cookieArray.length; i++) {
    const cookie = cookieArray[i].trim();
    if (cookie.startsWith('signInToken=')) {
      return cookie.substring(12);
    }
  }
  return null;
};

const setAuthHeader = async (force = false) => {
  let token = getAuthToken();
  if (isTokenExpired(token)) { // You'll need to implement isTokenExpired
    token = await refreshToken();
  }
  if (token || force) {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // For debugging: Force a dummy Authorization header
      headers['Authorization'] = 'Bearer dummy_token_for_debugging';
    }
    apiInstance.defaults.headers.common = { ...apiInstance.defaults.headers.common, ...headers };
  }
};

const refreshToken = async () => {
  try {
    const response = await apiInstance.post('/api/refresh-token', {
      // Your refresh token payload here
    });
    const newToken = response.data.token;
    document.cookie = `signInToken=${newToken}; path=/; secure;`;
    return newToken;
  } catch (error) {
    console.error('API Error: Refresh Token - Error:', error);
    throw error;
  }
};

const isTokenExpired = (token) => {
  // Your logic to check if the token is expired
  // This usually involves decoding the token and checking the expiry field
};

const apiWrapper = {

  registerOrganization: async (organisationData, adminUserData) => {
    await setAuthHeader();
    try {
      const payload = {
        orgDetails: organisationData,
        adminUserDetails: adminUserData
      };
      const response = await apiInstance.post('/api/organisations/register', payload);
      return response;
    } catch (error) {
      throw error;
    }
  },


  // Add this new function to fetch the signInToken
  getSignInToken: async (magicLinkToken) => {
    await setAuthHeader();
    try {
      const response = await apiInstance.post('/api/users/get-signin-token', {
        magicLinkToken, // Pass the magicLinkToken to the backend
      });
      return response;
    } catch (error) {
      console.error('API Error: Get SignIn Token - Error:', error);
      throw error;
    }
  },

  registerUser: async (data) => {
    try {
      // // // console.log('API Request: Register User - Request Data:', data);
      const response = await apiInstance.post('/api/users/register', data);
      // // // console.log('API Response: Register User - Response Data:', response.data);
      return response;
    } catch (error) {
      console.error('API Error: Register User - Error:', error);
      throw error;
    }
  },
  generateMagicLink: async (data) => {
    try {
      delete apiInstance.defaults.headers.common['Authorization'];
      // // // console.log('API Request: Generate Magic Link - Request Data:', data);
      const response = await apiInstance.post('/api/users/generate-magic-link', data);
      // // // console.log('API Response: Generate Magic Link - Response Data:', response.data);
      return response;
    } catch (error) {
      console.error('API Error: Generate Magic Link - Error:', error);
      throw error;
    }
  },

  // Function to generate a JWT token for API use
  generateApiToken: async () => {
    await setAuthHeader();
    try {
      const response = await apiInstance.get('/api/organisations/generate-api-token');
      return response;
    } catch (error) {
      console.error('API Error: Generate API Token - Error:', error);
      throw error;
    }
  },

  //Signin an Admin
  signIn: async (data) => {
    try {
      // // // console.log('API Request: Sign In - Request Data:', data);
      const response = await apiInstance.post('/api/users/signin', data);
      // // // console.log('API Response: Sign In - Response Data:', response.data);
      return response;
    } catch (error) {
      console.error('API Error: Sign In - Error:', error);
      throw error;
    }
  },

  // Logout a User
  logoutUser: async () => {
    await setAuthHeader();
    try {
      await axios.post('/api/users/logout');
      // Client-side cleanup, e.g., removing tokens from local storage
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Send an invite to a new admin
  inviteAdmin: async (adminDetails) => { // adminDetails should be an object with email and phoneNumber
    await setAuthHeader();
    try {
      const response = await apiInstance.post('/api/admin-management/invite', adminDetails);
      return response;
    } catch (error) {
      console.error('API Error: Invite Admin - Error:', error);
      throw error;
    }
  },

  toggleAdminStatus: async (userId) => {
    await setAuthHeader();
    try {
      const response = await apiInstance.patch(`/api/admin-management/toggle-status/${userId}`);
      return response;
    } catch (error) {
      console.error('API Error: Toggle Admin Status - Error:', error);
      throw error;
    }
  },

  // Check the token validity of a new admin verification email
  verifyAdminEmail: async (token) => {
    await setAuthHeader();
    try {
      const response = await apiInstance.get(`/api/admin-management/verify-email?token=${token}`);
      return response;
    } catch (error) {
      console.error('API Error: Verify Admin Email - Error:', error);
      throw error;
    }
  },

  // Function to set the admin password
  setAdminPassword: async ({ token, password }) => {
    try {
      const response = await apiInstance.post('/api/admin-management/set-password', {
        token,
        password
      });
      return response;
    } catch (error) {
      console.error('API Error: Set Admin Password - Error:', error);
      throw error;
    }
  },

  // Get the list of current admins for an organisation
  listAdmins: async () => {
    await setAuthHeader();
    try {
      const response = await apiInstance.get('/api/admin-management/list');
      return response;
    } catch (error) {
      console.error('API Error: List Admins - Error:', error);
      throw error;
    }
  },

  getOrganisation: async () => {
    await setAuthHeader();
    try {
      // // // console.log('API Request: Get Organisation');
      const response = await apiInstance.get('/api/organisations');
      // // // console.log('API Response: Get Organisation - Response Data:', response.data);
      return response;
    } catch (error) {
      console.error('API Error: Get Organisation - Error:', error);
      throw error;
    }
  },
  deleteAdmin: async (userId) => {
    await setAuthHeader();
    try {
      const response = await apiInstance.delete(`/api/adminManagement/delete`, { data: { userId } });
      return response;
    } catch (error) {
      console.error('API Error: Delete Admin - Error:', error);
      throw error;
    }
  },

  // Get the list of users linked to the organisation
  getUsersByOrganisation: async (orgId) => {
    await setAuthHeader();
    try {
      // // // console.log('API Request: Get Users By Organisation');
      const response = await apiInstance.get(`/api/organisations/${orgId}/users`);
      // // // console.log('API Response: Get Users By Organisation - Response Data:', response.data);
      return response;
    } catch (error) {
      console.error('API Error: Get Users By Organisation - Error:', error);
      throw error;
    }
  },
  // Update the organisation name
  updateOrganisationName: async (newName) => {
    await setAuthHeader();
    try {
      // // // console.log('API Request: Update Organisation Name - New Name:', newName);
      const response = await apiInstance.put('/api/organisations', { name: newName });
      // // // console.log('API Response: Update Organisation Name - Response Data:', response.data);
      return response;
    } catch (error) {
      console.error('API Error: Update Organisation Name - Error:', error);
      throw error;
    }
  },
  getAllQRCodes: async ({ orgId }) => {
    // Ensure the Authorization header is set
    const token = getAuthToken();
    // // // console.log("Retrieved Token:", token); // Log the token for debugging

    // // console.debug('Debug: Fetching QR codes for orgId:', orgId);  // Debugging: Log orgId

    try {
      const response = await apiInstance.get(`/api/qrcodes/all?orgId=${orgId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // // // console.log('API Response: Get All QR Codes - Response Data:', response.data);
      return response;
    } catch (error) {
      console.error('API Error: Get All QR Codes - Error:', error);
      throw error;
    }
  },

  createQRCode: async ({ orgId, location, latitude, longitude }) => {
    await setAuthHeader();
    // // console.debug('Debug: Creating new QR code for orgId:', orgId);  // Debugging: Log orgId
    try {
      // Construct the payload with orgId, location, latitude, and longitude
      const qrCodeData = {
        orgId,
        location, // Assuming 'location' is a string representing the address
        latitude,
        longitude
      };
      const response = await apiInstance.post('/api/qrcodes', qrCodeData);
      // // // console.log('API Response: Create QR Code - Response Data:', response.data);
      return response;
    } catch (error) {
      console.error('API Error: Create QR Code - Error:', error);
      throw error;
    }
  },

  updateQRCode: async (id, data) => {
    await setAuthHeader();
    try {
      // // // console.log('API Request: Update QR Code - Request Data:', data);
      const response = await apiInstance.put(`/api/qrcodes/${id}`, data);
      // // // console.log('API Response: Update QR Code - Response Data:', response.data);
      return response;
    } catch (error) {
      console.error('API Error: Update QR Code - Error:', error);
      throw error;
    }
  },
  deleteQRCode: async (id) => {
    await setAuthHeader();
    try {
      // // // console.log('API Request: Delete QR Code - ID:', id);
      const response = await apiInstance.delete(`/api/qrcodes/${id}`);
      // // // console.log('API Response: Delete QR Code - Response Data:', response.data);
      return response;
    } catch (error) {
      console.error('API Error: Delete QR Code - Error:', error);
      throw error;
    }
  },
  generateQRCodeImage: async (id) => {
    await setAuthHeader();
    try {
      // // // console.log('API Request: Generate QR Code Image - ID:', id);
      const response = await apiInstance.get(`/api/qrcodes/generate-image/${id}`);
      // // // console.log('API Response: Generate QR Code Image - Response Data:', response.data);
      return response;
    } catch (error) {
      console.error('API Error: Generate QR Code Image - Error:', error);
      throw error;
    }
  },
  // Function to geocode an address using your backend route
  geocodeAddress: async (address) => { // Pass the address directly
    await setAuthHeader(); // Ensure the Authorization header is set
    try {
      // Make the POST request to the backend geocoding endpoint
      const response = await apiInstance.post('/api/qrcodes/geocode-address', { address });
      // // // console.log('API Response: Geocode Address - Response Data:', response.data);
      return response.data; // Return the data part of the response
    } catch (error) {
      console.error('API Error: Geocode Address - Error:', error);
      throw error; // Ensure to handle this thrown error in the calling function
    }
  },


  createServiceConfirmation: async (data) => {
    await setAuthHeader();
    try {
      // // // console.log('API Request: Create Service Confirmation - Request Data:', data);
      const response = await apiInstance.post('/api/confirm-services', data);
      // // // console.log('API Response: Create Service Confirmation - Response Data:', response.data);
      return response;
    } catch (error) {
      console.error('API Error: Create Service Confirmation - Error:', error);
      throw error;
    }
  },
  readServiceConfirmation: async (id) => {
    await setAuthHeader();
    try {
      // // // console.log('API Request: Read Service Confirmation - ID:', id);
      const response = await apiInstance.get(`/api/confirm-services/${id}`);
      // // // console.log('API Response: Read Service Confirmation - Response Data:', response.data);
      return response;
    } catch (error) {
      console.error('API Error: Read Service Confirmation - Error:', error);
      throw error;
    }
  },

  // Update this function to fetch all service confirmations for the logged-in user's organization
  getServiceConfirmationsForOrg: async (startDate, endDate) => {
    await setAuthHeader();
    try {
      // Construct the query parameters
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      // Append the query parameters to the URL
      const response = await apiInstance.get(`/api/service-confirmations/all?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('API Error: Get Service Confirmations For Org - Error:', error);
      throw error;
    }
  },

  readLatestServiceConfirmationForUser: async (qrCodeId) => {
    await setAuthHeader();
    try {
      // console.log('API Request: Read Lastest Service Confirmation - For User:', id);
      const queryParams = new URLSearchParams();
      if (qrCodeId) queryParams.append('qrCodeId', qrCodeId);

      const response = await apiInstance.get(`/api/confirm-services/latest/by-qrcode?${queryParams.toString()}`);
      // console.log('API Response: Read Latest Service Confirmation - Response Data:', response.data);
      return response;
    } catch (error) {
      console.error('API Error: Read Latest Service Confirmation For User - Error:', error);
      throw error;
    }
  },

  updateServiceConfirmation: async (id, data) => {
    await setAuthHeader();
    try {
      // console.log('API Request: Read Service Confirmation - ID:', id);
      const response = await apiInstance.put(`/api/confirm-services/${id}`, data);
      // console.log('API Response: Read Service Confirmation - Response Data:', response.data);
      return response;
    } catch (error) {
      console.error('API Error: Update Service Confirmation - Error:', error);
      throw error;
    }
  },

  readPateintByQrCode: async (qrCodeId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_IRIS_DOMAIN}/patients/qrcode/${qrCodeId}`);
      console.log('API Response: Read Patient Data - Response Data:', response.data);
      return response;
    } catch (error) {
      console.error('API Error: Read Patient Data from IRIS - Error:', error);
      throw error;
    }
  },

  exportServiceConfirmationsToCSV: async (startDate, endDate) => {
    await setAuthHeader();
    try {
      // Construct the query parameters
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      // Make the GET request to the export endpoint
      const response = await apiInstance.get(`/api/service-confirmations/export?${queryParams.toString()}`, {
        responseType: 'blob', // Important for handling binary data
      });

      // Create a URL for the blob
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `service-confirmations-${startDate}-to-${endDate}.csv`); // This will prompt a file download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('API Error: Export Service Confirmations To CSV - Error:', error);
      throw error;
    }
  },

  getDashboardData: async (startDate, endDate) => {
    await setAuthHeader();
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await apiInstance.get(`/api/service-confirmations/data?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error: Get Dashboard Data - Error:', error.response?.data || error.message);
      throw error;
    }
  },


  // Update this function to fetch all audit logs for the logged-in user's organization
  getAuditLogsForOrg: async (startDate, endDate) => {
    await setAuthHeader();
    try {
      // Construct the query parameters
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      // Append the query parameters to the URL
      const response = await apiInstance.get(`/api/audit-logs/all?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('API Error: Get Audit Logs For Org - Error:', error);
      throw error;
    }
  },

  // Function to fetch all feature flags
  getFeatureFlags: async () => {
    await setAuthHeader();
    try {
      const response = await apiInstance.get('/api/feature-flags');
      return response;
    } catch (error) {
      console.error('API Error: Get Feature Flags - Error:', error);
      throw error;
    }
  },

  // Function to update a feature flag's status
  updateFeatureFlagStatus: async (flagId, updatedData) => {
    await setAuthHeader();
    try {
      const response = await apiInstance.put(`/api/feature-flags/${flagId}`, updatedData);
      return response;
    } catch (error) {
      console.error(`API Error: Update Feature Flag Status (${flagId}) - Error:`, error);
      throw error;
    }
  },

  toggleKillSwitch: async (flagName) => {
    await setAuthHeader();
    try {
      const response = await apiInstance.put(`/api/feature-flags/toggle-kill-switch/${flagName}`);
      return response;
    } catch (error) {
      console.error(`API Error: Toggle Kill Switch (${flagName}) - Error:`, error);
      throw error;
    }
  },

  getAllTags: async () => {
    await setAuthHeader();
    try {
      const response = await apiInstance.get('/api/tags/all');  // Updated endpoint
      return response;
    } catch (error) {
      console.error('API Error: Get All Tags - Error:', error);
      throw error;
    }
  },

  getTagById: async (id) => {
    await setAuthHeader();
    try {
      const response = await apiInstance.get(`/api/tags/${id}`);
      return response;
    } catch (error) {
      console.error(`API Error: Get Tag by ID (${id}) - Error:`, error);
      throw error;
    }
  },

  createTag: async (data) => {
    await setAuthHeader();
    try {
      const response = await apiInstance.post('/api/tags', data);
      return response;
    } catch (error) {
      console.error('API Error: Create Tag - Error:', error);
      throw error;
    }
  },

  updateTag: async (id, data) => {
    await setAuthHeader();
    try {
      const response = await apiInstance.put(`/api/tags/${id}`, data);
      return response;
    } catch (error) {
      console.error(`API Error: Update Tag (${id}) - Error:`, error);
      throw error;
    }
  },

  deleteTag: async (id) => {
    await setAuthHeader();
    try {
      const response = await apiInstance.delete(`/api/tags/${id}`);
      return response;
    } catch (error) {
      console.error(`API Error: Delete Tag (${id}) - Error:`, error);
      throw error;
    }
  },

  getTagsForQRCode: async (qrCodeId) => {
    await setAuthHeader();
    try {
      const response = await apiInstance.get(`/api/qrcodes/${qrCodeId}/tags`);
      return response;
    } catch (error) {
      console.error(`API Error: Get Tags for QR Code (${qrCodeId}) - Error:`, error);
      throw error;
    }
  },

  assignTagsToQRCode: async (qrCodeId, tagIds) => {
    await setAuthHeader();
    try {
      const response = await apiInstance.post(`/api/qrcodes/${qrCodeId}/tags`, { tagIds });
      return response;
    } catch (error) {
      console.error(`API Error: Assign Tags to QR Code (${qrCodeId}) - Error:`, error);
      throw error;
    }
  },

  removeTagsFromQRCode: async (qrCodeId, tagIds) => {
    await setAuthHeader();
    try {
      const response = await apiInstance.delete(`/api/qrcodes/${qrCodeId}/tags`, { data: { tagIds } });
      return response;
    } catch (error) {
      console.error(`API Error: Remove Tags from QR Code (${qrCodeId}) - Error:`, error);
      throw error;
    }
  },

  getWidgets: async () => {
    await setAuthHeader(); // Make sure the auth header is set
    try {
      // Make a GET request to the '/api/widgets/all' endpoint
      const response = await apiInstance.get('/api/widgets/all');
      // The response data should contain the list of widgets
      // // // console.log('API Response (API Wrapper):', response); // Debugging line
      return response.data; // You may adjust this depending on the actual structure of the response
    } catch (error) {
      // console.error('API Error: Get Widgets - Error:', error);
      throw error;
    }
  },

  updateWidgetConfiguration: async (widgetConfigId, configurationData) => {
    await setAuthHeader(); // if authentication is needed
    try {
      const response = await axios.put(`/api/widget-configurations/${widgetConfigId}`, configurationData);
      return response.data;
    } catch (error) {
      console.error('API Error: Update Widget Configuration - Error:', error);
      throw error;
    }
  },

  getWidgetById: async (widgetId) => {
    await setAuthHeader(); // Make sure the auth header is set
    try {
      // Make a GET request to the '/api/widgets/{id}' endpoint
      // Assuming your backend route for fetching a single widget by ID includes the widget configuration
      const response = await apiInstance.get(`/api/widgets/${widgetId}`);
      // The response data should contain the data for the requested widget along with its configuration
      // // // console.log('API Response (API Wrapper - Get Widget by ID):', response); // Debugging line
      return response.data; // Adjust this as needed based on your response structure
    } catch (error) {
      // console.error(`API Error: Get Widget by ID (${widgetId}) - Error:`, error);
      throw error;
    }
  },

  // Function to get all templates
  getAllTemplates: async () => {
    await setAuthHeader(); // Make sure the auth header is set
    try {
      // Make a GET request to the '/api/templates/all' endpoint
      const response = await apiInstance.get('/api/templates/all');
      // The response data should contain the list of templates
      // // // console.log('API Response (API Wrapper - Get All Templates):', response); // Debugging line
      return response.data; // You may adjust this depending on the actual structure of the response
    } catch (error) {
      // console.error('API Error: Get All Templates - Error:', error);
      throw error;
    }
  },

  // Function to create a new template
  createNewTemplate: async (name, layoutConfig) => {
    await setAuthHeader(); // Make sure the auth header is set
    try {
      // Make a POST request to the '/api/templates/' endpoint
      // // console.log(`NAME: `,name)
      // // console.log(`LAYOUT: `,layoutConfig)
      const response = await apiInstance.post('/api/templates/', {
        name,
        layoutConfig // Serialized grid layout
      });
      return response.data; // Return the response data
    } catch (error) {
      console.error('API Error: Create New Template - Error:', error);
      throw error;
    }
  },




  // Function to upload a logo image file
  uploadLogo: async (formData) => {
    await setAuthHeader();
    try {
      const response = await apiInstance.post('/api/logo-management/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('API Error: Upload Logo - Error:', error);
      throw error;
    }
  },

  //Function to get the Organisation logo file
  getLogo: async () => {
    await setAuthHeader();
    try {
      const response = await apiInstance.get('/api/logo-management/get-logo');
      return response.data;
    } catch (error) {
      console.error('API Error: Get Logo - Error:', error);
      throw error;
    }
  },

  // Create a new tour progress
  createTourProgress: async (data) => {
    await setAuthHeader();
    try {
      const response = await apiInstance.post('/api/tour-progress', data);
      return response;
    } catch (error) {
      console.error('API Error: Create Tour Progress - Error:', error);
      throw error;
    }
  },

  // Get all tour progresses for the logged-in org admin
  getAllTourProgresses: async () => {
    await setAuthHeader();
    try {
      const response = await apiInstance.get('/api/tour-progress/all');
      return response;
    } catch (error) {
      console.error('API Error: Get All Tour Progresses - Error:', error);
      throw error;
    }
  },

  // Get tour progress by ID
  getTourProgressById: async (id) => {
    await setAuthHeader();
    try {
      const response = await apiInstance.get(`/api/tour-progress/${id}`);
      return response;
    } catch (error) {
      console.error('API Error: Get Tour Progress By ID - Error:', error);
      throw error;
    }
  },

  // Update tour progress by ID
  updateTourProgressById: async (id, currentStep, totalSteps) => {
    // // console.log(`Updating tour progress:`, id, currentStep, totalSteps);
    await setAuthHeader();
    try {
      const response = await apiInstance.put(`/api/tour-progress/${id}`, {
        currentStep,
        totalSteps
      });
      return response;
    } catch (error) {
      console.error('API Error: Update Tour Progress By ID - Error:', error);
      throw error;
    }
  },

  // Get the configuration data from the backend for the business case builder
  getConfigData: async () => {
    try {
      const response = await fetch('/api/business-case-builder/config-data'); // Update the URL as per your API structure
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching config data:', error);
      throw error;
    }
  },

  // Calculate the customer value of didgUgo from the inputs in the business case builder tool
  calculateCustomerValue: async (data) => {
    await setAuthHeader();
    try {
      const response = await apiInstance.post('/api/business-case-builder/calculate', data);
      return response;
    } catch (error) {
      console.error('API Error: Business Case Builder Calculation - Error:', error);
      throw error;
    }
  },



};


export default apiWrapper;

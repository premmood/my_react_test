function setHardcodedLocalStorageValues() {
  cy.log('Setting hardcoded local storage values...');
  cy.window().then((win) => {
      win.localStorage.setItem('entryPoint', '/');
      win.localStorage.setItem('role', 'trustedAdmin,didgugoAdmin,orgAdmin,user');
      win.localStorage.setItem('preferredPhoneNumber', '0499 999 998');
      win.localStorage.setItem('userId', '3');
      win.localStorage.setItem('orgId', '2');
  });
}

function signInUser(email, password, phoneNumber, bypassOtp, entryPoint) {
  cy.log('Sending sign-in request...');
  return cy.request({
      method: 'POST',
      url: 'http://localhost:8080/api/users/signin',
      body: {
          email,
          password,
          phoneNumber,
          bypassOtp,
          entryPoint
      }
  });
}

function validateSignInResponse(response) {
  cy.log('Validating API response...');
  expect(response.status).to.eq(200);
  expect(response.body.message).to.eq('Admin authenticated successfully');
  expect(response.body.role).to.include('orgAdmin');
}

function logLocalStorageContents() {
  cy.log('--- Local Storage Contents ---');
  Object.keys(localStorage).forEach(key => {
      cy.log(`${key}: ${localStorage.getItem(key)}`);
  });
  cy.log('--- End of Local Storage Contents ---');
}

function navigateAndValidateHomepage() {
  cy.log('Navigating to the homepage...');
  cy.visit('/');

  cy.log('Checking UI elements...');
  cy.get('button').contains('Sign Out').should('exist');
}

function logNetworkRequestDetails(request, response) {
  cy.log('--- Network Request Details ---');
  cy.log(`Method: ${request.method}`);
  cy.log(`URL: ${request.url}`);
  cy.log(`Request Headers: ${JSON.stringify(request.headers)}`);
  cy.log(`Request Body: ${JSON.stringify(request.body)}`);
  cy.log(`Response Status: ${response.statusCode}`);
  cy.log(`Response Headers: ${JSON.stringify(response.headers)}`);
  cy.log(`Response Body: ${JSON.stringify(response.body)}`);
  cy.log('--- End of Network Request Details ---');
}

describe('Sign In', () => {
  beforeEach(() => {
    cy.log('Clearing cookies');
    cy.clearCookies();
    cy.intercept('**/*').as('apiRequest');
  });

  it('should sign in Admin user successfully without SMS OTP', () => {
    cy.log('Starting test for Admin user sign-in without SMS OTP');
    setHardcodedLocalStorageValues();

    signInUser('jack@alphacare.com.notreal', 'T0talDr8m8Act10n!', '0499999997', true, '/')
    .then((response) => {
      validateSignInResponse(response);
      logLocalStorageContents();

      // Simulate successful authentication by setting a mock signInToken
      cy.setCookie('signInToken', 'mockedSignInToken');
      
      navigateAndValidateHomepage();
      logLocalStorageContents();
    });

    cy.wait('@apiRequest').then(({ request, response }) => {
      logNetworkRequestDetails(request, response);
    });
  });  
});

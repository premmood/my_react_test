describe('End-to-End Service Confirmation', () => {
  // Clear cookies and local storage before each test
  beforeEach(() => {
      cy.log('Clearing cookies and local storage');
      cy.clearCookies();
      window.localStorage.clear();

      // Intercept network requests
      cy.intercept('**/*').as('apiRequest');
  });

  it('should complete the entire service confirmation flow', () => {
      // Step 1: Sign In
      cy.log('Step 1: Sign In');
        // Set hardcoded local storage values
        setHardcodedLocalStorageValues();

        signInUser('0483961234', true, '/confirm-service?status=Confirmed&qrCodeId=1&location=Location1').then((response) => {
          
        validateSignInResponse(response);
          
          // Check that the signInToken cookie is set
          validateSignInTokenCookie();

          // Step 2: Navigate to Service Confirmation Form
          navigateAndValidateServiceConfirmationPage();

          // Step 3: Fill in Service Type
          fillServiceType('Gardening');

          // Step 4: Submit the form
          submitServiceConfirmationForm();

          // Step 5: Confirm the user is taken to the Confirmation screen
          validateConfirmationScreen();
      });
  });

  function signInUser(phoneNumber, bypassOtp, entryPoint) {
      cy.log('Sending sign-in request...');
      return cy.request({
          method: 'POST',
          url: `${Cypress.config('baseUrl')}/api/users/signin`,
          body: {
              phoneNumber,
              bypassOtp,
              entryPoint
          }
      });
  }

  function validateSignInResponse(response) {
      cy.log('Validating API response...');
      cy.log(`Status Code: ${response.status}`);
      cy.log(`Response Message: ${response.body.message}`);
      cy.log(`User Role: ${response.body.user.roles}`);
      
      expect(response.status).to.eq(200);
      expect(response.body.message).to.eq('OTP sent');
      expect(response.body.user.roles).to.eq('user'); 
  }

  function validateSignInTokenCookie() {
      cy.log('Validating signInToken cookie...');
      cy.getCookie('signInToken')
        .should('exist')
        .then((cookie) => {
            cy.log(`signInToken Value: ${cookie.value}`);
        });
  }

  function setHardcodedLocalStorageValues() {
    cy.log('Setting hardcoded local storage values...');
    cy.window().then((win) => {
        win.localStorage.setItem('entryPoint', '/confirm-service?status=Confirmed&qrCodeId=1&location=Location1');
        win.localStorage.setItem('magicLinkEntryPoint', '/confirm-service?status=Confirmed&qrCodeId=1&location=Location1');
        win.localStorage.setItem('role', 'user');
        win.localStorage.setItem('preferredPhoneNumber', '0402774876');
        win.localStorage.setItem('userId', '2');
        win.localStorage.setItem('orgId', null);
    });
}

  function navigateAndValidateServiceConfirmationPage() {
      cy.log('Navigating to Service Confirmation Form...');
      cy.visit('/confirm-service?status=Confirmed&qrCodeId=1&location=Location1');
  }

  function fillServiceType(serviceType) {
    cy.log(`Filling in Service Type: ${serviceType}`);
    // Open the dropdown
    cy.get('.ui.selection.dropdown').click();
    // Select the option. This assumes that the text of the option matches the serviceType value.
    cy.contains('.item', serviceType).click();
}


  function submitServiceConfirmationForm() {
      cy.log('Submitting the form...');
      cy.get('button[type=submit]').click();
  }

  function validateConfirmationScreen() {
      cy.log('Confirming the user is taken to the Confirmation screen...');
      cy.url().should('include', '/confirmation');
  }
});

describe('Service Confirmation Flow', () => {
  before(() => {
    const yourPassword = Cypress.env('mary_password') || '11aaBB!!re';
    
    // Start by visiting the service confirmation URL
    cy.visit('http://localhost:3000/confirm-service?qrCodeId=1&location=Location1&status=Confirmed');
    
    // The app should redirect to the sign-in page
    cy.url().should('include', '/signin');
    
    // Fill in the phoneNumber and password
    cy.get('input[name=phoneNumber]').type('0402774876');
    cy.get('input[name=password]').type(yourPassword);
    
    // Click the submit button to sign in
    cy.get('button[type=submit]').click();
    
    // Wait for redirection back to the service confirmation page
    cy.url().should('include', 'http://localhost:3000/confirm-service?qrCodeId=1&location=Location1&status=Confirmed');
  });

  it('should successfully submit a service confirmation', () => {
    // Debug: Log the current URL
    cy.url().then(url => cy.log(`ServiceConfirmation Debug: Current URL is: ${url}`));

    // Check if the form fields are pre-populated
    cy.get('input#qrCodeId').should('have.value', '1').then(() => cy.log('ServiceConfirmation Debug: qrCodeId is correct'));
    cy.get('input#location').should('have.value', 'Location1').then(() => cy.log('ServiceConfirmation Debug: location is correct'));

    // Select the service type from the dropdown
    cy.get('select#serviceType').select('Gardening').then(() => cy.log('ServiceConfirmation Debug: Selected service type'));

    // Click the submit button
    cy.get('button[type=submit]').click().then(() => cy.log('ServiceConfirmation Debug: Clicked submit button'));

    // Wait for redirection to the confirmation page
    cy.url().should('include', 'http://localhost:3000/confirmation').then(() => cy.log('ServiceConfirmation Debug: Redirected to confirmation page'));

    // Optionally, you can check for a feedback message on the confirmation page
    // cy.get('.feedback').should('contain', 'Service Confirmation Successful').then(() => cy.log('ServiceConfirmation Debug: Feedback message is correct'));
  });
});

// SCENARIOS: 
// 1) Admin has bookmarked "/dashboard" url (entrypoint) and wants to be taken there after signin with email/password 
// 2) QR Code scanned by normal existing user (as per e2e scenario) with /confirm-service url and wants to be taken to pre-populated service confirmation form after signing in via Magic Link. 
// 3) Same as 2, but instead of signing in, the user is not an existing user and goes via the registration 'new user' button, then signs in, then is redirected to service confirmation form 
// 4) Default flow: Existing admin entrypoint is "/" or "/signin", goes through email/password signin and is taken to Landing Page ("/"). 

describe('Comprehensive Redirection Tests', () => {
    beforeEach(() => {
      cy.clearCookies();
    });
  
    context('Admin with Bookmarked Dashboard URL', () => {
      it('should redirect to dashboard after sign-in', () => {
        cy.visit('http://localhost:8080/dashboard');
        cy.get('input[placeholder="04XX XXX XXX"]').type('0499999997');
        cy.contains('button', 'Submit').click();
        cy.get('input[placeholder="Enter admin email"]').should('be.visible').type('jack@alphacare.com.notreal');
        cy.get('input[placeholder="Enter admin password"]').type('T0talDr8m8Act10n!');
        cy.contains('.ui.orange.big.fluid.button', 'Sign In').click();
        cy.url().should('include', '/dashboard');
      });
    });
  
    context('Existing User QR Code Scan', () => {
      it('should redirect to service confirmation form after sign-in', () => {
        cy.visit('http://localhost:8080/confirm-service?status=Confirmed&qrCodeId=7&location=4%20Ivanhoe%20Grove,%20Malvern%20East%20Victoria%203145,%20Australia');
        cy.get('input[placeholder="04XX XXX XXX"]').type('0483961234');
        cy.contains('button', 'Submit').click();
        cy.contains('a', 'Click Here to Sign In').click();
        cy.url().should('include', '/confirm-service');
      });
    });
  
    context('New User QR Code Scan with Registration', () => {
      it('should redirect to service confirmation form after registration and sign-in', () => {
        const phoneNumber = '0499' + Math.floor(100000 + Math.random() * 900000); // Random phone number
        const email = `testuser+${phoneNumber}@test.com`; // Random email
        cy.visit('http://localhost:8080/confirm-service?status=Confirmed&qrCodeId=7&location=4%20Ivanhoe%20Grove,%20Malvern%20East%20Victoria%203145,%20Australia');
        cy.contains('button', 'New User').click();
        cy.get('input[placeholder="Phone Number"]').type(phoneNumber);
        cy.get('input[placeholder="Email"]').type(email);
        cy.contains('button', 'Create My didgUgo Account').click();
        cy.wait(3000); // Wait for registration to complete
        cy.get('input[placeholder="04XX XXX XXX"]').type(phoneNumber);
        cy.contains('button', 'Submit').click();
        cy.contains('a', 'Click Here to Sign In').click();
        cy.url().should('include', '/confirm-service');
      });
    });
  
    context('Default Flow for Existing Admin', () => {
      it('should redirect to landing page after sign-in', () => {
        cy.visit('http://localhost:8080/signin');
        cy.get('input[placeholder="04XX XXX XXX"]').type('0499999997');
        cy.contains('button', 'Submit').click();
        cy.get('input[placeholder="Enter admin email"]').type('jack@alphacare.com.notreal');
        cy.get('input[placeholder="Enter admin password"]').type('T0talDr8m8Act10n!');
        cy.contains('.ui.orange.big.fluid.button', 'Sign In').click();
        cy.url().should('eq', 'http://localhost:8080/');
      });
    });
  });
  
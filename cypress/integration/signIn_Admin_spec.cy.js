describe('Admin Sign In', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.visit('http://localhost:8080/signin');
    });
  
    it('should sign in Admin user successfully', () => {
      // Enter phone number and request magic link
      cy.get('input[placeholder="04XX XXX XXX"]').type('0499999997');
      cy.contains('button', 'Submit').click();
  
      // Wait for the admin sign-in form to appear
      cy.get('input[placeholder="Enter admin email"]').should('be.visible');
  
      // Enter admin credentials and sign in
      cy.get('input[placeholder="Enter admin email"]').type('jack@alphacare.com.notreal');
      cy.get('input[placeholder="Enter admin password"]').type('T0talDr8m8Act10n!');
      cy.contains('.ui.orange.big.fluid.button', 'Sign In').click();
  
      // Validate successful sign-in by checking for the presence of 'Sign Out' button
      cy.get('.ui.menu').contains('Sign Out').should('exist');
  
      // Optional: Interact with admin navigation links if necessary
      // Example: cy.get('.tour-nav-qrcode').click();
    });
  });
  
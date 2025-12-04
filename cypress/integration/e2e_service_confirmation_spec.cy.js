describe('Service Confirmation', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.visit('http://localhost:8080/confirm-service?status=Confirmed&qrCodeId=7&location=4%20Ivanhoe%20Grove,%20Malvern%20East%20Victoria%203145,%20Australia');
      });
    
    it('should submit a service confirmation successfully', () => {
        cy.wait(2000); // Waits for 2 seconds

        // Enter phone number and request magic link
        cy.get('input[placeholder="04XX XXX XXX"]').type('0483961234');
        cy.contains('button', 'Submit').click();

        // Wait a few seconds for the link to appear, if necessary
        cy.wait(2000); // Waits for 2 seconds

        // Click on the 'Click Here to Sign In' link
        cy.contains('a', 'Click Here to Sign In').click();

        // Wait for the dropdown to be visible and then click it to open
        cy.get('.ui.selection.dropdown', { timeout: 10000 }).should('be.visible').click();

        // Wait for the dropdown options to be visible, then select 'Gardening'
        cy.contains('.item', 'Gardening', { timeout: 10000 }).should('be.visible').click();

        // Wait a few seconds before clicking 'Confirm Service', if necessary
        cy.wait(2000); // Waits for 2 seconds

        // Click 'Confirm Service' to submit the form
        cy.contains('button', 'Confirm Service').click();

        // Wait a few seconds for the logout to process
        cy.wait(7000); // Waits for 7 seconds

        // Validation: Check redirection back to the sign-in page
        cy.url().should('include', '/signin');
    });
});

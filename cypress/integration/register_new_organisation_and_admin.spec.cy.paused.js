/// <reference types="cypress" />

const faker = require('faker');

describe('Organization Registration', () => {
  it('should register a new organization', () => {
    cy.visit('/path-to-registration'); // Replace with your actual registration page URL

    // Fill in the registration form
    cy.get('input[name="orgName"]').type(faker.company.companyName());
    cy.get('input[name="email"]').type(`youralias+${faker.datatype.uuid()}@didgugo.com`); // Use your email alias
    cy.get('input[name="abn"]').type('valid-abn'); // Replace with a method to generate or use a valid ABN

    // Submit the form
    cy.get('form').submit();

    // Add assertions to verify successful registration
    // e.g., cy.url().should('include', '/success-page');
  });
});

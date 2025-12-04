describe('Generate QR Codes Page', () => {
    it('successfully loads', () => {
      // Replace with the actual URL of your Generate QR Codes page
      cy.visit('http://localhost:3000/generate-qrcode')  
  
      // Check if the page title is correct
      cy.get('h1').should('contain', 'Generate QR Code')
  
      // Optionally, check if the table exists
      cy.get('table').should('exist')
  
      // Optionally, check if the "Generate QR Code Image" button exists in the table
      // cy.get('table').find('button').should('contain', 'Generate QR Code Image')
    })
  })
  
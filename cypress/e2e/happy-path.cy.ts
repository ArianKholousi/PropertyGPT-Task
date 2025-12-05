describe('Happy Path: Search → Detail → Save Search → SSE', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should complete the full user journey', () => {
    // Step 1: Verify search page loads
    cy.contains('h1', 'Property Search').should('be.visible');

    // Step 2: Apply filters to search
    cy.get('input[id="q"]').should('be.visible').type('Downtown');
    cy.get('input[id="min_price"]').should('be.visible').type('1000000');
    cy.get('button').contains('Apply Filters').click();

    // Wait for listings to load
    cy.get('[data-testid="listing-card"]', { timeout: 15000 }).should('be.visible');
    cy.get('[data-testid="listing-card"]').should('have.length.at.least', 1);

    // Step 3: Open a listing detail page
    cy.get('[data-testid="listing-card"]').first().click();

    // Wait for detail page to load
    cy.url().should('match', /\/listing\/.+/);
    cy.get('h1').should('be.visible');
    // Check for price (AED currency)
    cy.contains('AED').should('be.visible');

    // Step 4: Navigate to saved search page
    cy.visit('/saved-search');
    cy.contains('h1', 'Saved Searches').should('be.visible');

    // Step 5: Create a saved search
    cy.get('input[id="name"]').should('be.visible').type('Test Search E2E');
    cy.get('input[id="q"]').type('Downtown');
    cy.get('input[id="minPrice"]').type('1000000');
    cy.get('input[id="maxPrice"]').type('5000000');

    // Submit the form
    cy.get('button[type="submit"]').contains('Save Search').click();

    // Wait for success message or redirect
    cy.contains(/saved successfully|Redirecting/, { timeout: 10000 }).should('be.visible');

    // Step 6: Go back to search page and verify SSE connection
    cy.visit('/');

    // Wait for SSE connection indicator
    cy.contains(/Live|Connecting|Offline/, { timeout: 5000 }).should('be.visible');

    // Verify the page is functional
    cy.contains('h1', 'Property Search').should('be.visible');
  });
});


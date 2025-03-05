// cypress/e2e/vehicleMarketplace.cy.js

describe('Flujo principal de compra/alquiler de vehículos', () => {
  it('Debería realizar una búsqueda, ver detalles y contactar al vendedor', () => {
    // 1. Ir a la página principal
    cy.visit('/');

    // 2. Loguearse
    cy.contains('Iniciar Sesión').click()
    cy.get('#user').type('usuario');
    cy.get('#password').type('123456');
    cy.get('button[type="submit"]').click();

    // 3. Buscar un vehículo para alquilar
    cy.get('a.btn.btn-secondary:not(.disabled)') 
    .contains('Alquilar')
    .should('be.visible')
    .click();
      
    //4. Seleccionar fecha Inicio
      //Abrir calendario
        cy.get('.mat-datepicker-toggle')
        .find('button')
        .eq(0)  
        .click({force: true});
        cy.wait(1000);
      //Seleccionar fecha
      cy.get('td.mat-calendar-body-cell-container')
      .find('button.mat-calendar-body-active') 
      .first()
      .click({force: true});  
      cy.wait(1000);
  
    //5. Seleccionar fecha Fin
        //Abrir calendario
        cy.get('.mat-datepicker-toggle')
        .find('button')
        .eq(1)  
        .click({force: true});

        cy.wait(1000);
        //Seleccionar fecha
        cy.get('td.mat-calendar-body-cell-container')
        .find('button.mat-calendar-body-active') 
        .first()
        .click({force: true});
        
    //6. Reservar sin pagar
    cy.get('button').contains('Reservar sin Pagar Ahora').click();

    cy.wait(5000);
;
    //Cierra popup
    cy.get('button').contains('OK').click();

    //Abre el dropdown
    cy.get('button#dropdownDefaultButton').click();

    cy.wait(1000)
    //Selecciona la opción de perfil
    cy.get('a').contains('Cerrar Sesión').click();








  });
});
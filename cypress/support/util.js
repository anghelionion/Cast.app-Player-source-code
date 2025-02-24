export const isProd = () =>
    Cypress.config().baseUrl === "https://cast.app/play/";

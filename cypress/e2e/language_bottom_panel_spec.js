import { isProd } from "../support/util";

describe("Playback Speed", () => {
    beforeEach(() => {
        const prod = isProd();
        cy.visit(
            prod
                ? "RCGDgZeJRrK2DheOSEnzfw/Visual-Explanations-test/John"
                : "VnMNCUZlRNWINe2-KBOlbQ/Visual-Explanations-test/John"
        );
    });

    it("Verify the user can change the player language from Footer to US English at cast.app/pydcast", () => {
        cy.ValidateTranslatedLanguages(
            "english",
            "Settings",
            "bottom-language"
        );
    });

    it("Verify the user can change the player language from Footer to UK English at cast.app/pydcast", () => {
        cy.ValidateTranslatedLanguages(
            "british",
            "Settings",
            "bottom-language"
        );
    });

    it("Verify the user can change the player language from Footer to Australian at cast.app/pydcast", () => {
        cy.ValidateTranslatedLanguages(
            "australian",
            "Settings",
            "bottom-language"
        );
    });

    it("Verify the user can change the player language from Footer to french at cast.app/pydcast", () => {
        cy.ValidateTranslatedLanguages(
            "french",
            "Paramètres",
            "bottom-language"
        );
    });

    it("Verify the user can change the player language from Footer to spanish at cast.app/pydcast", () => {
        cy.ValidateTranslatedLanguages("spanish", "Ajustes", "bottom-language");
    });

    it("Verify the user can change the player language from Footer to italian at cast.app/pydcast", () => {
        cy.ValidateTranslatedLanguages(
            "italian",
            "Impostazioni",
            "bottom-language"
        );
    });

    it("Verify the user can change the player language from Footer to german at cast.app/pydcast", () => {
        cy.ValidateTranslatedLanguages(
            "german",
            "Einstellungen",
            "bottom-language"
        );
    });

    it("Verify the user can change the player language from Footer to dutch at cast.app/pydcast", () => {
        cy.ValidateTranslatedLanguages(
            "dutch",
            "Instellingen",
            "bottom-language"
        );
    });

    it("Verify the user can change the player language from Footer to danish at cast.app/pydcast", () => {
        cy.ValidateTranslatedLanguages(
            "danish",
            "Indstillinger",
            "bottom-language"
        );
    });

    it("Verify the user can change the player language from Footer to japanese at cast.app/pydcast", () => {
        cy.ValidateTranslatedLanguages("japanese", "設定", "bottom-language");
    });

    it("Verify the user can change the player language from Footer to hindi at cast.app/pydcast", () => {
        cy.ValidateTranslatedLanguages("hindi", "समायोजन", "bottom-language");
    });

    it("Verify the user can change the player language from Footer to chinese at cast.app/pydcast", () => {
        cy.ValidateTranslatedLanguages("chinese", "设置", "bottom-language");
    });
});

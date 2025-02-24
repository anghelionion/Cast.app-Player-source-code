import Player from "../support/Player";
import { isProd } from "../support/util";

describe("Player Settings Check", () => {
    beforeEach(() => {
        const prod = isProd();
        cy.visit(
            prod
                ? "RCGDgZeJRrK2DheOSEnzfw/Visual-Explanations-test/John"
                : "VnMNCUZlRNWINe2-KBOlbQ/Visual-Explanations-test/John"
        );
    });

    it("Verify the user can on/off the Avatar from setting menu on cast.app/pydcast", () => {
        Player.playBtn.should("be.visible").click();
        Player.HighlightElementAndClick(Player.settingTray);
        Player.HighlightElementAndClick(Player.settingAvatarNone);
        Player.HighlightElementAndClick(Player.settingApplyChanges);
        Player.settingApplyChanges.click({ force: true });
        cy.get('[class="left__blobAvatarContainer"]').should("be.exist");

        // Checking for Off
        Player.HighlightElementAndClick(Player.settingTray);
        Player.HighlightElementAndClick(Player.settingAvatarCharacter);
        Player.HighlightElementAndClick(Player.settingApplyChanges);
        Player.AvatarHideBtn.should("be.exist");
    });

    it("Verify the user can on/off the Avatar on cast.app/pydcast", () => {
        Player.playBtn.should("be.visible").click();
        cy.window().then((win) => {
            win.eval('document.getElementById("idVisemeRealtime").click()');
        });
        cy.get('[class="left__blobAvatarContainer"]').should("be.exist");
        cy.get('[class="left__blobAvatarContainer"]').should(
            "have.css",
            "display",
            "flex"
        );
        cy.window().then((win) => {
            win.eval('document.getElementById("idVisemeRealtime").click()');
        });
        cy.get('[class="left__blobAvatarContainer"]').should(
            "have.css",
            "display",
            "none"
        );
    });

    it("Verify the user Transcripts toggle is working on cast.app/pydcast", () => {
        Player.playBtn.should("be.visible").click();
        // Player.ExpandRightPanel.click({ force: true });
        cy.contains(
            "In this Cast we will discuss your Support Ticket Status."
        ).should("be.visible");
        Player.HighlightElementAndClick(Player.transcriptTray);
        cy.get('[class="current narrationBoxDiv"]').should("not.be.visible");
        cy.contains(
            "In this Cast we will discuss your Support Ticket Status."
        ).should("be.visible");
    });

    it("[Mobile View]Verify the user can change the player language to US English at cast.app/pydcast", () => {
        cy.viewport(550, 750);
        cy.ValidateTranslatedLanguages("english", "Settings");
    });

    it("[Mobile View]Verify the user can change the player language to UK English at cast.app/pydcast", () => {
        cy.viewport(550, 750);
        cy.ValidateTranslatedLanguages("british", "Settings");
    });

    it("[Mobile View]Verify the user can change the player language to Australian at cast.app/pydcast", () => {
        cy.viewport(550, 750);
        cy.ValidateTranslatedLanguages("australian", "Settings");
    });

    it("[Mobile View]Verify the user can change the player language to french at cast.app/pydcast", () => {
        cy.viewport(550, 750);
        cy.ValidateTranslatedLanguages("french", "Paramètres");
    });

    it("[Mobile View]Verify the user can change the player language to spanish at cast.app/pydcast", () => {
        cy.viewport(550, 750);
        cy.ValidateTranslatedLanguages("spanish", "Ajustes");
    });

    it("[Mobile View]Verify the user can change the player language to italian at cast.app/pydcast", () => {
        cy.viewport(550, 750);
        cy.ValidateTranslatedLanguages("italian", "Impostazioni");
    });

    it("[Mobile View]Verify the user can change the player language to german at cast.app/pydcast", () => {
        cy.viewport(550, 750);
        cy.ValidateTranslatedLanguages("german", "Einstellungen");
    });

    it("[Mobile View]Verify the user can change the player language to dutch at cast.app/pydcast", () => {
        cy.viewport(550, 750);
        cy.ValidateTranslatedLanguages("dutch", "Instellingen");
    });

    it("[Mobile View]Verify the user can change the player language to danish at cast.app/pydcast", () => {
        cy.viewport(550, 750);
        cy.ValidateTranslatedLanguages("danish", "Indstillinger");
    });

    it("[Mobile View]Verify the user can change the player language to japanese at cast.app/pydcast", () => {
        cy.viewport(550, 750);
        cy.ValidateTranslatedLanguages("japanese", "設定");
    });

    it("[Mobile View]Verify the user can change the player language to hindi at cast.app/pydcast", () => {
        cy.viewport(550, 750);
        cy.ValidateTranslatedLanguages("hindi", "समायोजन");
    });

    it("[Mobile View]Verify the user can change the player language to chinese at cast.app/pydcast", () => {
        cy.viewport(550, 750);
        cy.ValidateTranslatedLanguages("chinese", "设置");
    });
});

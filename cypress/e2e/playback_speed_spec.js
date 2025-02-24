import Player from "../support/Player";
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

    it("Verify the user can set 0.5x Playback Speed on cast.app/pydcast", () => {
        Player.playBtn.should("be.visible").click();
        Player.HighlightElementAndClick(Player.FooterPlaybackSpeed);

        cy.get('[data-speed="slow"]').should("be.visible").click();
        cy.get('[class="right-panel-playback-speed-current"]').should(
            "have.text",
            "0.5x"
        );
    });

    it("Verify the user can set 1x Playback Speed on cast.app/pydcast", () => {
        Player.playBtn.should("be.visible").click();
        Player.HighlightElementAndClick(Player.FooterPlaybackSpeed);

        cy.get('[data-speed="medium"]').should("be.visible").click();
        cy.get('[class="right-panel-playback-speed-current"]').should(
            "have.text",
            "1x"
        );
    });

    it("Verify the user can set 1.5x Playback Speed on cast.app/pydcast", () => {
        Player.playBtn.should("be.visible").click();
        Player.HighlightElementAndClick(Player.FooterPlaybackSpeed);

        cy.get('[data-speed="fast"]').should("be.visible").click();
        cy.get('[class="right-panel-playback-speed-current"]').should(
            "have.text",
            "1.5x"
        );
    });

    it("Verify the user can set 2x Playback Speed on cast.app/pydcast", () => {
        Player.playBtn.should("be.visible").click();
        Player.HighlightElementAndClick(Player.FooterPlaybackSpeed);

        cy.get('[data-speed="x-fast"]').should("be.visible").click();
        cy.get('[class="right-panel-playback-speed-current"]').should(
            "have.text",
            "2x"
        );
    });
});

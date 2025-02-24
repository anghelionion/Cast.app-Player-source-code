import Player from "../support/Player";
import { isProd } from "../support/util";

describe("Player Feedback", () => {
    beforeEach(() => {
        const prod = isProd();
        cy.visit(prod ? "miLseiYJQYaIaVKYnHWPEg" : "miLseiYJQYaIaVKYnHWPEg");
        Player.playBtn.should("be.visible").click();
        // Player.RecommendationsIcon.should("be.visible").click();
    });
    it("Verify that Feedback Close button working Correctly", () => {
        Player.HighlightElementAndClick(Player.feedbackThumbUpButton);
        Player.HighlightElementAndClick(Player.feedbackCloseButton);
        Player.feedbackCloseButton.should("not.be.visible");
        Player.HighlightElementAndClick(Player.feedbackThumbDownButton);
        Player.HighlightElementAndClick(Player.feedbackThumbDownButton);
        Player.HighlightElementAndClick(Player.feedbackCloseButton);
        Player.feedbackCloseButton.should("not.be.visible");
    });

    it("Verify that user enter whitespace in feedback textarea then submit button", () => {
        Player.HighlightElementAndClick(Player.feedbackThumbUpButton);
        cy.get('[id="feedback-textarea"]').should("be.visible");
        Player.feedbackTextarea.should("be.visible").type("Priyank_Automation");
        Player.HighlightElementAndClick(Player.feedbackSubmitButton);
        cy.get("#feedback-success-confirmation-message")
            .should("be.visible")
            .should("have.text", "Thank you for your feedback!");
    });

    it("Verify that the Thumbs Up Icon button is working properly and the user can submit feedback", () => {
        Player.HighlightElementAndClick(Player.feedbackThumbUpButton);
        // Player.HighlightElementAndClick(Player.feedbackThumbUpButton);
        Player.HighlightElementAndClick(Player.feedbackSubmitButton);
        cy.get("#feedback-success-confirmation-message")
            .should("be.visible")
            .should("have.text", "Thank you for your feedback!");
    });

    it("Verify that the Thumbs Down Icon button is working properly and the user can submit feedback.", () => {
        Player.HighlightElementAndClick(Player.feedbackThumbDownButton);
        // Player.HighlightElementAndClick(Player.feedbackThumbDownButton);
        Player.HighlightElementAndClick(Player.feedbackSubmitButton);
        cy.get("#feedback-success-confirmation-message")
            .should("be.visible")
            .should(
                "have.text",
                "Apologies for the inconvenience, thank you for your feedback!"
            );
    });
    it("Verify that the user can't click both button same time and submit the feedback", () => {
        Player.HighlightElementAndClick(Player.feedbackThumbUpButton);
        Player.feedbackThumbDownButton.should(
            "have.class",
            "feedback-thumb-button thumb-down-button"
        );
        Player.feedbackSubmitButton.should("be.visible");
        Player.HighlightElementAndClick(Player.feedbackThumbDownButton);
        Player.feedbackThumbUpButton.should(
            "have.class",
            "feedback-thumb-button thumb-up-button"
        );
        Player.feedbackSubmitButton.should("be.visible");
    });
});

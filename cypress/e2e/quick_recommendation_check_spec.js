import Player from "../support/Player";
import { isProd } from "../support/util";

describe("Quick Recommendation Check", () => {
    it("Verify Recommendation working for Mobile on cast.app/pydcast", () => {
        cy.viewport(550, 750);
        const prod = isProd();
        cy.visit(
            prod
                ? "0BUsw2m-Seq4Z8Y2QrM6mg/Recommendations/John"
                : "metOkCHdQkmVetblhb8vKw/Recommendations/John"
        );

        Player.playBtn.should("be.visible").click();
        cy.ValidateDynamicActionText(
            "calendly",
            "Schedule a Meeting",
            "Mobile"
        );
        cy.ValidateDynamicActionText(
            "goodtime",
            "Schedule a Meeting",
            "Mobile"
        );
        cy.ValidateDynamicActionText("mail", "Email us", "Mobile");
        cy.ValidateDynamicActionText("phone", "Call us", "Mobile");
        cy.ValidateDynamicActionText("web", "Article", "Mobile");
        cy.ValidateDynamicActionText("youtube", "Video", "Mobile");
        cy.ValidateDynamicActionText("deeplink", "Twitter", "Mobile");
        cy.ValidateDynamicActionText("community", "Join Community", "Mobile");
        cy.ValidateDynamicActionText("webinar", "Webinar Invitation", "Mobile");
        cy.ValidateDynamicActionText("renewal", "Renew Now", "Mobile");

        cy.ValidateDynamicActionText("upsell", "Upsell", "Mobile");
    });
    it("Verify Recommendation working on cast.app/pydcast", () => {
        const prod = isProd();
        cy.visit(
            prod
                ? "0BUsw2m-Seq4Z8Y2QrM6mg/Recommendations/John"
                : "metOkCHdQkmVetblhb8vKw/Recommendations/John"
        );

        Player.playBtn.should("be.visible").click();
        cy.ValidateDynamicActionText("cast.app", "cast.app");
        cy.ValidateDynamicActionText(
            "replay",
            "Replay this Cast from beginning"
        );
        cy.ValidateDynamicActionText("calendly", "Schedule a Meeting");
        cy.ValidateDynamicActionText("goodtime", "Schedule a Meeting");
        cy.ValidateDynamicActionText("mail", "Email us");
        cy.ValidateDynamicActionText("phone", "Call us");
        cy.ValidateDynamicActionText("web", "Article");
        cy.ValidateDynamicActionText("youtube", "Video");
        cy.ValidateDynamicActionText("deeplink", "Twitter");
        cy.ValidateDynamicActionText("community", "Join Community");
        cy.ValidateDynamicActionText("webinar", "Webinar Invitation");
        cy.ValidateDynamicActionText("renewal", "Renew Now");

        cy.ValidateDynamicActionText("upsell", "Upsell");
    });
});

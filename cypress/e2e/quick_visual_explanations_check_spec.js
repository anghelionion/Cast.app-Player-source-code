import Player from "../support/Player";
import { isProd } from "../support/util";

describe("Quick Visual Explanations Check", () => {
    it("Verify Visual Explanations working on cast.app/pydcast for Widget Slide", () => {
        const prod = isProd();
        cy.visit(
            prod
                ? "RCGDgZeJRrK2DheOSEnzfw/Visual-Explanations-test/John"
                : "VnMNCUZlRNWINe2-KBOlbQ/Visual-Explanations-test/John"
        );

        Player.playBtn.should("be.visible").click();
        cy.ValidateIsVisualExplanationsWorking("Support Funnel", "Widget");
        cy.ValidateContentWithoutVisualExplanations("Overall Status", "Widget");
    });

    it("Verify Visual Explanations working on cast.app/pydcast for Checklist Slide", () => {
        const prod = isProd();
        cy.visit(prod ? "miLseiYJQYaIaVKYnHWPEg" : "miLseiYJQYaIaVKYnHWPEg");

        Player.playBtn.should("be.visible").click();
        cy.ValidateIsVisualExplanationsWorking(
            "Usage and Performance",
            "Checklist"
        );
        cy.ValidateContentWithoutVisualExplanations(
            "Best Practices",
            "Checklist"
        );
    });

    it("Verify Visual Explanations working on cast.app/pydcast for Gauges Slide", () => {
        const prod = isProd();
        cy.visit(prod ? "UCwnX971TWmxPeiKstw0dQ" : "UCwnX971TWmxPeiKstw0dQ");

        Player.playBtn.should("be.visible").click();
        cy.ValidateIsVisualExplanationsWorking("R360 (Relationships): 40%");
        cy.ValidateContentWithoutVisualExplanations("Dashboards: 20%");
    });

    it("Verify Visual Explanations working on cast.app/pydcast for metric Slide", () => {
        const prod = isProd();
        cy.visit(prod ? "eMi-xribTqODVMq80Uv3CQ" : "eMi-xribTqODVMq80Uv3CQ");

        Player.playBtn.should("be.visible").click();
        cy.ValidateIsVisualExplanationsWorking("Assigned Licenses");
    });

    it("Verify Visual Explanations working on cast.app/pydcast for Grouped Bars Slide", () => {
        const prod = isProd();
        cy.visit(prod ? "cBchp46_Rp2sIygNuiDlaQ" : "cBchp46_Rp2sIygNuiDlaQ");

        Player.playBtn.should("be.visible").click();
        cy.ValidateIsVisualExplanationsWorking("December 2020");
        cy.ValidateContentWithoutVisualExplanations("February 2021");
    });

    it("Verify Visual Explanations working on cast.app/pydcast for Compare Bars Slide", () => {
        const prod = isProd();
        cy.visit(prod ? "lKEWTLwKSoudT_fewi31_A" : "lKEWTLwKSoudT_fewi31_A");

        Player.playBtn.should("be.visible").click();
        cy.ValidateIsVisualExplanationsWorking("Ian Layton");
        cy.ValidateContentWithoutVisualExplanations("James Johnson");
    });

    it("Verify Visual Explanations working on cast.app/pydcast for Navigation Slide", () => {
        const prod = isProd();
        cy.visit(prod ? "O_f5eHUUSvmPjLQl7gfylQ" : "O_f5eHUUSvmPjLQl7gfylQ");

        Player.playBtn.should("be.visible").click();
        cy.ValidateIsVisualExplanationsWorking("1", "Navigation");
        cy.ValidateContentWithoutVisualExplanations("2", "Navigation");
    });

    it("Verify Visual Explanations working on cast.app/pydcast for Categorization Slide", () => {
        const prod = isProd();
        cy.visit(prod ? "SGvbaMcEQGirFnZCMLxxbg" : "SGvbaMcEQGirFnZCMLxxbg");

        Player.playBtn.should("be.visible").click();
        cy.ValidateIsVisualExplanationsWorking("Organic search");
        cy.ValidateContentWithoutVisualExplanations("Referral");
    });

    it("Verify Visual Explanations working on cast.app/pydcast for Single Bars Slide", () => {
        const prod = isProd();
        cy.visit(
            prod
                ? "dJpxtl9MTNSRay4R2rCqyA/Visual-Explanations-test/John"
                : "dJpxtl9MTNSRay4R2rCqyA/Visual-Explanations-test/John"
        );

        Player.playBtn.should("be.visible").click();
        cy.ValidateIsVisualExplanationsWorking("Very satisfied");
        cy.ValidateContentWithoutVisualExplanations("Neutral");
    });

    it("Verify Horizontal and Vertical Visual Explanations working on cast.app/pydcast for Line & Area Slide", () => {
        const prod = isProd();
        cy.visit(prod ? "z0EEo-L1SOuSIniNdUNO0g" : "z0EEo-L1SOuSIniNdUNO0g");

        Player.playBtn.should("be.visible").click();
        cy.ValidateIsVisualExplanationsWorking(
            "3",
            "Line & Area",
            "Horizontal and Vertical"
        );
    });

    it("Verify Horizontal Visual Explanations working on cast.app/pydcast for Line & Area Slide", () => {
        const prod = isProd();
        cy.visit(prod ? "1J8sd4-USzKcSfFZ2ossDw" : "1J8sd4-USzKcSfFZ2ossDw");

        Player.playBtn.should("be.visible").click();
        cy.ValidateIsVisualExplanationsWorking(
            "2",
            "Line & Area",
            "Horizontal"
        );
    });

    it("Verify Vertical Visual Explanations working on cast.app/pydcast for Line & Area Slide", () => {
        const prod = isProd();
        cy.visit(prod ? "lYckY9A3QOSUCuuyivfKZA" : "lYckY9A3QOSUCuuyivfKZA");

        Player.playBtn.should("be.visible").click();
        cy.ValidateIsVisualExplanationsWorking("1", "Line & Area", "Vertical");
    });

    it("Verify Visual Explanations working on cast.app/pydcast for Waterfall Slide", () => {
        const prod = isProd();
        cy.visit(
            prod
                ? "XxQcT38jRVeYSpTF6nLbnw/Visual-Explanations-test/John"
                : "XxQcT38jRVeYSpTF6nLbnw/Visual-Explanations-test/John"
        );

        Player.playBtn.should("be.visible").click();
        cy.ValidateIsVisualExplanationsWorking("Wages");
        cy.ValidateContentWithoutVisualExplanations("Cost of production");
    });
    it("Verify Visual Explanations working on cast.app/pydcast for Stack Slide", () => {
        const prod = isProd();
        cy.visit(
            prod
                ? "PAOIUhUsR7uB6NiEUbpJlg/Visual-Explanations-test/John"
                : "PAOIUhUsR7uB6NiEUbpJlg/Visual-Explanations-test/John"
        );

        Player.playBtn.should("be.visible").click();
        cy.ValidateIsVisualExplanationsWorking("A");
        cy.ValidateContentWithoutVisualExplanations("D");
    });
});

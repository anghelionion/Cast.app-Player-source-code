import Player from "../support/Player";
import { isProd } from "../support/util";

describe("Single Single Slide Right panel content", () => {
    it("Verify right Single Slide panel show only one scene on cast.app/pydcast for Widget Single Slide", () => {
        const prod = isProd();
        cy.visit(
            prod
                ? "RCGDgZeJRrK2DheOSEnzfw/Visual-Explanations-test/John"
                : "VnMNCUZlRNWINe2-KBOlbQ/Visual-Explanations-test/John"
        );

        Player.playBtn.should("be.visible").click();
        cy.get('[class="chartTitle"]').should("have.length", 1);
    });

    it("Verify right Single Slide panel show only one scene on cast.app/pydcast for Checklist Single Slide", () => {
        const prod = isProd();
        cy.visit(prod ? "miLseiYJQYaIaVKYnHWPEg" : "miLseiYJQYaIaVKYnHWPEg");

        Player.playBtn.should("be.visible").click();
        cy.get('[class="chartTitle"]').should("have.length", 1);
    });

    it("Verify right Single Slide panel show only one scene on cast.app/pydcast for Gauges Single Slide", () => {
        const prod = isProd();
        cy.visit(prod ? "UCwnX971TWmxPeiKstw0dQ" : "UCwnX971TWmxPeiKstw0dQ");

        Player.playBtn.should("be.visible").click();
        cy.get('[class="chartTitle"]').should("have.length", 1);
    });

    it("Verify right Single Slide panel show only one scene on cast.app/pydcast for metric Single Slide", () => {
        const prod = isProd();
        cy.visit(prod ? "eMi-xribTqODVMq80Uv3CQ" : "eMi-xribTqODVMq80Uv3CQ");

        Player.playBtn.should("be.visible").click();
        cy.get('[class="chartTitle"]').should("have.length", 1);
    });

    it("Verify right Single Slide panel show only one scene on cast.app/pydcast for Grouped Bars Single Slide", () => {
        const prod = isProd();
        cy.visit(prod ? "cBchp46_Rp2sIygNuiDlaQ" : "cBchp46_Rp2sIygNuiDlaQ");

        Player.playBtn.should("be.visible").click();
        cy.get('[class="chartTitle"]').should("have.length", 1);
    });

    it("Verify right Single Slide panel show only one scene on cast.app/pydcast for Compare Bars Single Slide", () => {
        const prod = isProd();
        cy.visit(prod ? "lKEWTLwKSoudT_fewi31_A" : "lKEWTLwKSoudT_fewi31_A");

        Player.playBtn.should("be.visible").click();
        cy.get('[class="chartTitle"]').should("have.length", 1);
    });

    it("Verify right Single Slide panel show only one scene on cast.app/pydcast for Navigation Single Slide()", () => {
        const prod = isProd();
        cy.visit(
            prod
                ? "KOre6vG7Sd2KfWXXn-skig/OLD-About-Cast/John"
                : "ND-NoNnVRpyd0cvjKn1Uxw/OLD-About-Cast/John"
        );

        Player.playBtn.should("be.visible").click();
        cy.get('[class="chartTitle"]').should("have.length", 1);
    });

    it("Verify right Single Slide panel show only one scene on cast.app/pydcast for Categorization Single Slide", () => {
        const prod = isProd();
        cy.visit(prod ? "SGvbaMcEQGirFnZCMLxxbg" : "SGvbaMcEQGirFnZCMLxxbg");

        Player.playBtn.should("be.visible").click();
        cy.get('[class="chartTitle"]').should("have.length", 1);
    });

    it("Verify right Single Slide panel show only one scene on cast.app/pydcast for Single Bars Single Slide", () => {
        const prod = isProd();
        cy.visit(
            prod
                ? "dJpxtl9MTNSRay4R2rCqyA/Visual-Explanations-test/John"
                : "dJpxtl9MTNSRay4R2rCqyA/Visual-Explanations-test/John"
        );

        Player.playBtn.should("be.visible").click();
        cy.get('[class="chartTitle"]').should("have.length", 1);
    });

    it("Verify right Single Slide panel show only one scene on cast.app/pydcast for Line & Area Single Slide", () => {
        const prod = isProd();
        cy.visit(prod ? "z0EEo-L1SOuSIniNdUNO0g" : "z0EEo-L1SOuSIniNdUNO0g");

        Player.playBtn.should("be.visible").click();
        cy.get('[class="chartTitle"]').should("have.length", 1);
    });

    it("Verify right Single Slide panel show only one scene on cast.app/pydcast for Waterfall Single Slide", () => {
        const prod = isProd();
        cy.visit(
            prod
                ? "XxQcT38jRVeYSpTF6nLbnw/Visual-Explanations-test/John"
                : "XxQcT38jRVeYSpTF6nLbnw/Visual-Explanations-test/John"
        );

        Player.playBtn.should("be.visible").click();
        cy.get('[class="chartTitle"]').should("have.length", 1);
    });
    it("Verify right Single Slide panel show only one scene on cast.app/pydcast for Stack Single Slide", () => {
        const prod = isProd();
        cy.visit(
            prod
                ? "PAOIUhUsR7uB6NiEUbpJlg/Visual-Explanations-test/John"
                : "PAOIUhUsR7uB6NiEUbpJlg/Visual-Explanations-test/John"
        );

        Player.playBtn.should("be.visible").click();
        cy.get('[class="chartTitle"]').should("have.length", 1);
    });
});

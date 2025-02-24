import Player from "../support/Player";
import { isProd } from "../support/util";

describe("Navigation Slide functionality", () => {
    beforeEach(() => {
        const prod = isProd();
        cy.visit(
            prod
                ? "xC2FaEpyS3aLw_c-F87Feg/NavigationTest/John"
                : "xC2FaEpyS3aLw_c-F87Feg/NavigationTest/John"
        );
        Player.playBtn.should("be.visible").click();
    });

    it("Verify Default Path for Navigation Slide working on cast.app/pydcast", () => {
        cy.contains("Troubleshooting is simple").should("be.visible");
        cy.contains("Parents Node").should("be.visible");
        cy.contains("Please select an option.").should("be.visible");
        cy.contains("Continuing with default option.", {
            timeout: 12000,
        }).should("be.visible");
        cy.contains("Default Slide").should("be.visible");
    });

    it("Verify Selected Path for Navigation Slide working on cast.app/pydcast", () => {
        cy.contains("Troubleshooting is simple").should("be.visible");
        cy.contains("Parents Node").should("be.visible");
        cy.contains("Please select an option.").should("be.visible");
        cy.contains("PP1").should("be.visible").click();
        cy.contains("User Select the PP1 Path").should("be.visible");
    });

    it("Verify Navigation Slide's Goto Slide functionality working on cast.app/pydcast", () => {
        cy.contains("Troubleshooting is simple").should("be.visible");
        cy.contains("Parents Node").should("be.visible");
        cy.contains("Please select an option.").should("be.visible");
        cy.contains("PP3").should("be.visible").click();
        cy.contains("CP2").should("be.visible").click();
        cy.contains("User Select the CP2 Path").should("be.visible");
        cy.contains("Parents Node").should("be.visible");
    });
});

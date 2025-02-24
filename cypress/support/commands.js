import Player from "./Player";

Cypress.Commands.add("getByTestId", (selector, ...args) =>
    cy.get(`[data-testid="${selector}"]`, ...args)
);

Cypress.Commands.add(
    "ValidateDynamicActionText",
    (actionType, text, deviceType = "Desktop") => {
        if (deviceType === "Mobile") {
            cy.xpath(
                `//div[@class="action-button"]//span[text()='${text}']`
            ).should("be.visible");
        } else if (deviceType === "Desktop") {
            cy.xpath(
                `(//div[@actiontype="${actionType}"]//span[text()='${text}'])[2]`,
                { timeout: 60000 }
            ).should("be.visible", { force: true });
        }
    }
);

Cypress.Commands.add(
    "ValidateIsVisualExplanationsWorking",
    (text, sceneType, visualExplanationType) => {
        if (sceneType === "Navigation") {
            cy.xpath(`(//div[@class='options_button'])[${text}]`)
                .should("be.visible")
                .should("have.css", "transform", "matrix(1, 0, 0, 1, 0, 0)");
        } else if (sceneType === "Checklist") {
            cy.xpath(`//span[contains(text(),'${text}')]//ancestor::div[1]`)
                .should("be.visible")
                .should("have.css", "opacity", "1")
                .should("have.css", "visibility", "visible")
                .should(
                    "have.css",
                    "box-shadow",
                    "rgba(0, 0, 0, 0.4) 0px 2px 6px 0px"
                )
                .should("have.css", "opacity", "1");
        } else if (sceneType === "Line & Area") {
            if (visualExplanationType === "Horizontal and Vertical") {
                cy.xpath(`(//div[@class='yHighlighter'])[${text}]`)
                    .should("have.css", "filter", "grayscale(0) brightness(1)")
                    .should("have.css", "opacity", "0.8");
                cy.xpath(`(//div[@class='xHighlighter'])[${text}]`)
                    .should("have.css", "filter", "grayscale(0) brightness(1)")
                    .should("have.css", "opacity", "0.8");
            } else if (visualExplanationType === "Horizontal") {
                cy.xpath(`(//div[@class='yHighlighter'])[${text}]`)
                    .should("have.css", "filter", "grayscale(0) brightness(1)")
                    .should("have.css", "opacity", "0.8");
            } else if (visualExplanationType === "Vertical") {
                cy.xpath(`(//div[@class='xHighlighter'])[${text}]`)
                    .should("have.css", "filter", "grayscale(0) brightness(1)")
                    .should("have.css", "opacity", "0.8");
            }
        } else if (sceneType === "Widget") {
            cy.xpath(
                `//div[text()='${text}']//ancestor::div[@class='widgetPanel_title_container']`
            )
                .should("have.css", "filter", "grayscale(0) brightness(1)")
                .should("have.css", "opacity", "1");
        } else {
            cy.contains(text)
                .should("have.css", "filter", "grayscale(0) brightness(1)")
                .should("have.css", "opacity", "1");
        }
    }
);

Cypress.Commands.add(
    "ValidateContentWithoutVisualExplanations",
    (text, sceneType) => {
        if (sceneType === "Navigation") {
            cy.xpath(`(//div[@class='options_button'])[${text}]`)
                .should("be.visible")
                .should(
                    "have.css",
                    "transform",
                    "matrix(0.875, 0, 0, 0.875, 0, 0)"
                );
        } else if (sceneType === "Checklist") {
            cy.xpath(`//span[contains(text(),'${text}')]//ancestor::div[1]`)
                .should("be.visible")
                .should("have.css", "opacity", "1")
                .should("have.css", "visibility", "visible")
                .should("have.css", "box-shadow", "none")
                .should("have.css", "opacity", "1");
        } else if (sceneType === "Widget") {
            cy.xpath(
                `//div[text()='${text}']//ancestor::div[@class='widgetPanel_title_container']`
            )
                .should("have.css", "filter", "grayscale(0.9) brightness(0.8)")
                .should("have.css", "opacity", "1");
        } else {
            cy.contains(text)
                .should("be.visible")
                .should("have.css", "filter", "grayscale(0.9) brightness(0.8)")
                .should("have.css", "opacity", "0.7");
        }
    }
);

Cypress.Commands.add(
    "ValidateTranslatedLanguages",
    (languageName, assertText, panel = "setting") => {
        Player.playBtn.should("be.visible").click();

        if (panel === "setting") {
            Player.HighlightElementAndClick(Player.settingTray);
            cy.intercept("POST", "**/api/translate", (req) => {
                expect(req.body).to.have.property("language", languageName);
            }).as("GetUpdatedLang");
            cy.get(
                '[class="selectTab languageSelect language-options-settings"]'
            )
                .eq(0)
                .find(`[data-locale='${languageName}']`)
                .should("be.visible")
                .click({
                    force: true,
                });

            if (
                languageName === "english" ||
                languageName === "british" ||
                languageName === "australian"
            ) {
                // Do Nothing
            } else {
                cy.wait("@GetUpdatedLang").then((interception) => {
                    expect(interception.response.statusCode).to.equal(200);
                });
            }
            cy.contains(assertText).should("be.visible");
        } else if (panel === "bottom-language") {
            Player.HighlightElementAndClick(Player.FooterLanguage);
            cy.intercept("POST", "**/api/translate", (req) => {
                expect(req.body).to.have.property("language", languageName);
            }).as("GetUpdatedLang");

            cy.get('[class="selectTab languageSelect"]')
                .eq(0)
                .find(`[data-locale='${languageName}']`)
                .click({
                    force: true,
                });

            if (
                languageName === "english" ||
                languageName === "british" ||
                languageName === "australian"
            ) {
                // Do Nothing
            } else {
                cy.wait("@GetUpdatedLang").then((interception) => {
                    expect(interception.response.statusCode).to.equal(200);
                });
            }
        }
    }
);

class Player {
    /** Gets the Player Play element. */
    get playBtn() {
        return cy.get('[data-testid="play-button"]');
    }

    /** Gets the Player Avatar button element. */
    get AvatarHideBtn() {
        return cy.get('[id="idVisemeRealtime"]');
    }

    /** Gets the Player Blob button element. */
    get BlobBtn() {
        return cy.get(".idVisemeRealtime");
    }

    /** Gets the Player Setting button element. */
    get settingTray() {
        return cy.get(
            '[class="noselect panel-footer-button panel-footer-settings-button"]'
        );
    }

    /** Gets the Player transcript button element. */
    get transcriptTray() {
        return cy.get('[class="transcripts-button"]');
    }

    /** Gets the Player transcript popup Narration element. */
    get transcriptStepNarration() {
        return cy.get(".transcript-step-narration");
    }

    /** Gets the Player transcript toggle element. */
    get transcriptToggle() {
        return cy.get("#expand-transcript-menu-details-button");
    }

    /** Gets the Player Setting > Avatar > None Button element. */
    get settingAvatarNone() {
        return cy.get("#idBlob");
    }

    /** Gets the Player Setting > Avatar > Character Button element. */
    get settingAvatarCharacter() {
        return cy.get("#idCharacter");
    }

    /** Gets the Player feedback menu toggle on icon element. */
    get feedbackMenuToggleOnIcon() {
        return cy.get("#feedback-menu-toggle-on-icon");
    }

    /** Gets the Player Bell Icon element. */
    get RecommendationsIcon() {
        return cy
            .get('[class="side-panel-collapsed"]')
            .find('[id="landscape-action-feedback-menu-toggle-button"]');
    }

    /** Gets the Player feedback thumb-up button element. */
    get feedbackThumbUpButton() {
        return cy.get("#feedback-thumb-up-button");
    }

    /** Gets the Player feedback thumb down button element. */
    get feedbackThumbDownButton() {
        return cy.get("#feedback-thumb-down-button");
    }

    /** Gets the Player feedback submit button element. */
    get feedbackSubmitButton() {
        return cy.get("#feedback-submit-button");
    }

    /** Gets the Player feedback-textarea element. */
    get feedbackTextarea() {
        return cy.get("#feedback-textarea");
    }

    /** Gets the Player Setting' Apply Changes Button element. */
    get settingApplyChanges() {
        return cy.get('[data-testid="apply-icon"]');
    }

    /** Gets the Player feedback close button element. */
    get feedbackCloseButton() {
        return cy.get(".feedback-menu-cancel-button");
    }

    /** Gets the Player Right Panel expand element. */
    get ExpandRightPanel() {
        return cy.get('[class="side-panel-left-button"]');
    }

    /** Gets the Player Current Narration element. */
    get CurrentNarration() {
        return cy.get('[id="idNarrationBox"]');
    }

    /** Gets the Player side panel playback speed element. */
    get SidePanelPlaybackSpeed() {
        return cy.get('[class="side-panel-playback-speed"]');
    }

    /** Gets the Player bottom panel playback speed element. */
    get FooterPlaybackSpeed() {
        return cy.getByTestId("current-playback-speed");
    }

    /** Gets the Player bottom panel language element. */
    get FooterLanguage() {
        return cy.getByTestId("footer-language-button");
    }

    /** Highlight any Element with border. */
    HighlightElement(elementToHighlight) {
        elementToHighlight.should("be.visible");
        elementToHighlight.then(($el) => {
            $el.css("border", "1px solid magenta");
        });
    }

    /** Highlight and click any Element with border. */
    HighlightElementAndClick(elementToHighlight) {
        elementToHighlight.should("be.visible");
        elementToHighlight.then(($el) => {
            $el.get(0).click();
            $el.css("border", "1px solid magenta");
        });
    }
}

export default new Player();

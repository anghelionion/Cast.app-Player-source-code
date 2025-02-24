/* eslint-disable */
"use strict";

import model from "../env/model/AppModel";
import "./MobileBottomBar.css";

import DesktopBottomBar from "./DesktopBottomBar";

export default class MobileBottomBar extends DesktopBottomBar {
    constructor(props) {
        super(props);

        this._onUpdateActions();
        model.onUpdateActions.subscribe(this._onUpdateActions);
    }

    _onUpdateActions = () => {
        let index = parseInt(model.onUpdateActions.data);
        if (index === null || index < 0) index = 0;
        if (index > 10) index = 10;
        gsap.set(this.element.querySelectorAll(".bell"), {
            autoAlpha: 0,
        });
        gsap.set(this.el("#bell" + index.toString()), {
            autoAlpha: 1,
        });
    };

    _updateControlState() {
        const menuType = model.controlsState.data.menuType;

        if (menuType === "setting" || menuType === "actionFeedback") {
            [this.el(".mobile-ama-button")].forEach((el) => {
                gsap.set(el, { display: "none" });
            });
        } else {
            [this.el(".mobile-ama-button")].forEach((el) => {
                gsap.set(el, { clearProps: "display" });
            });
        }
        if (menuType === "setting") {
            gsap.set([this.el("#right-menu-control-container"), this.el(".right-control-settings-container-box-mobile")], { display: "flex" });
            gsap.set("#right-menu-close-button-mobile", { display: "none" });
        } else {
            gsap.set(this.el("#right-menu-control-container"), { display: "none" });
        }

        if (menuType === "actionFeedback") {
            gsap.set(this.el("#right-menu-control-container"), { display: "flex" });
            gsap.set(this.el(".right-control-settings-container-box-mobile"), { display: "none" });
            gsap.set("#right-menu-close-button-mobile", { display: "block", autoAlpha: 1, cursor: "pointer" });
        }

        super._updateControlState();

        if (menuType === "setting" || menuType === "actionFeedback") {
            [this.el(".transcripts-button-mobile"), this.el(".recommendations-button-mobile")].forEach((el) => {
                gsap.set(el, { display: "none" });
            });
            return;
        }

        if (menuType === "none" || (orientation === "landscape" && menuType === "actionFeedback")) {
            [this.el(".transcripts-button-mobile"), this.el(".recommendations-button-mobile")].forEach((el) => {
                gsap.set(el, { clearProps: "display" });
            });
        }
    }

    render() {
        const html = `
        <div class="mbb__left">
                <div>
                   <div class="left__blobAvatarContainer">${blobSVG("dark")}</div>
                   <div class="left__blobRestIcon"> ${SVG.blobRestIcon()} </div>
                </div>
                <div class="panel-footer-row panel-footer-feedback-buttons">
                                    <div id="feedback-menu-container">
                           
                            <div id="feedback-menu-body">  
                             <div id="feedback-menu-heading">
                                <div id="feedback-menu-title">                        
                                    <span id="feedback-menu-title-text">${Cast.locale.translatedContent["feedbackMenuTitle"]}</span>
                                
                                </div>
                            </div>              
                                <div id="feedback-form">
                                    <textarea
                                        id="feedback-textarea"
                                        name="Feedback Text Area"
                                        placeholder="${Cast.locale.translatedContent["feedbackTextAreaPlaceholder"]}"
                                    ></textarea>
                                 
                                    <div id="feedback-buttons">
                                        <div id="feedback-submit-button" class="feedback-menu-apply-button">
                                            ${SVG.transcriptsApplyIcon()}
                                        </div>
                                        <div class="feedback-menu-cancel-button" onclick="Cast.collapseFeedbackMenu()">
                                            ${SVG.transcriptsCancelIcon()}
                                        </div>
                                    </div>
                                </div>
                                <div id="feedback-confirmation">
                                    ${SVG.successConfirmationCheckIcon()}
                                    <p id="feedback-success-confirmation-message"></p>
                                </div>
                            </div>
                        </div>
                              <div id="feedback-thumb-up-button" class="feedback-thumb-button thumb-up-button">
                                        ${SVG.thumbUpNew()}
                                    </div>
                                    <div id="feedback-thumb-down-button" class="feedback-thumb-button thumb-down-button">
                                        ${SVG.thumbDownNew()}
                                    </div>
                        </div> 
             
                <div class="left__right" >
                            
               </div>
            
        </div>
          <div id="player-control-container">
                    <div id="rewind-button" class="noselect tray-button" onclick="skipBackward()">
                        ${SVG.rewindButtonIcon()}
                      
                    </div>
                    <div id="tray-play-button" class="noselect tray-button" onclick="togglePlayPause()">
                        ${SVG.trayPlayButtonIcon(castColor(0))}
                        ${SVG.replayIcon(castColor(0))}
                    </div>
                    <div id="tray-pause-button" class="noselect tray-button" onclick="togglePlayPause()">
                        ${SVG.trayPauseButtonIcon()}
                    </div>
                    <div id="skip-button" class="noselect tray-button" onclick="skipForward()">
                        ${SVG.skipButtonIcon()}
                        
                    </div>
                </div>
        <div class="mbb__right">
           <div class="noselect panel-footer-button panel-footer-settings-button" >
                                <div class="panel-footer-tooltip-text panel-footer-settings-button-tooltip" data-testid="footer-setting-button">Settings</div>
                                <div class="panel-footer-settings-button-icon">${SVG.settingMenuToggleButtonIcon("white")}</div>
                            </div>
           
          
            <button class="transcripts-button-mobile">${SVG.transcriptsButtonIcon()}</button>
             <button class="recommendations-button-mobile">    
               ${SVG.actionFeedbackMenuToggleButtonIcon()}            
            </button>
            <div id="right-menu-control-container">
                  
                     <div class="right-control-settings-container-box-mobile">
                        <div id="setting-menu-apply-button" class="noselect mobile-tray-button" onclick="applySettingsAndCloseMenu()">
                            ${SVG.settingMenuApplyButtonIcon()}
                        </div>
                        <div id="setting-menu-cancel-button" class="noselect mobile-tray-button" onclick="cancelSettingsAndCloseMenu()">
                            ${SVG.settingMenuCancelButtonIcon()}
                        </div>    
                    </div>
                      <div id="right-menu-close-button-mobile" class="noselect mobile-tray-button" onclick="closeMenu(Cast.userInteracted, true)">
                        ${SVG.menuCloseButtonIconLight()}
                    </div>   
                                  
                </div>
           
        </div>
          
            `;

        this.element.innerHTML = html;

        [".panel-footer-settings-button"].forEach((e) => {
            this.el(e).addEventListener("click", () => {
                openMenu();
                this.closeFeedback();
            });
        });

        this.el(".recommendations-button-mobile").addEventListener("click", () => {
            openMenu("actionFeedback");
            model.onViewRecommendations.notify();
        });

        this.el(".transcripts-button-mobile").addEventListener("click", () => {
            openMenu("actionFeedback");
            model.onViewTranscripts.notify();
        });

        this.el(".thumb-up-button").addEventListener("click", () => {
            if (this._thumbButtonsDisabled) return;
            this.doThumbUp();
            this.doSilentFeedback("Positive", "", "");
        });

        this.el(".thumb-down-button").addEventListener("click", () => {
            if (this._thumbButtonsDisabled) return;
            this.doThumbDown();
            this.doSilentFeedback("Negative", "", "");
        });

        this.el(".feedback-menu-apply-button").addEventListener("click", () => {
            this.submitFeedback();
        });

        this.el(".feedback-menu-cancel-button").addEventListener("click", () => {
            this.closeFeedback();
        });

        this.el("#feedback-textarea").addEventListener("keyup", this.validateFeedbackInputs);

        gsap.set(this.el("#feedback-menu-container"), { display: "none" });
        const feedbackPanelState = model.feedbackPanelState.data;
        if (feedbackPanelState) {
            if (feedbackPanelState.thumbUp) this.doThumbUp();
            else this.doThumbDown();
            this.el("#feedback-textarea").value = feedbackPanelState.text;
        }
        this.validateFeedbackInputs();

        [this.el(".left__blobAvatarContainer"), this.el(".left__blobRestIcon")].forEach((el) => {
            el.addEventListener("click", () => {
                if (NarratorAvatarSetting.getCurrent() === "blob" && NarratorAvatarSetting.lastSelectedAvatar) {
                    NarratorAvatarSetting.setNew(NarratorAvatarSetting.lastSelectedAvatar);
                } else {
                    NarratorAvatarSetting.setNew("blob");
                }
                NarratorAvatarSetting.applyNew();
                applyNarratorAvatar();
            });
        });
    }
}

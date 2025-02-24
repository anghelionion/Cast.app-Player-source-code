/* eslint-disable */
"use strict";

import model from "../env/model/AppModel";
import "./DesktopBottomBar.css";
import Component from "./Component";
import Scrubber from "./Scrubber";

export default class DesktopBottomBar {
    constructor(props) {
        this.props = props;
        this.element = document.createElement("div");
        this.element.classList.add("desktop-bottom-bar-content");
        this._thumbButtonsDisabled = false;

        this.render();
        this.updateLocale();
        model.onTranslationChange.subscribe(this.updateLocale);
        model.onConfirmFeedback.subscribe(this.onConfirmFeedback);

        this.updateControlsState();
        model.controlsState.subscribe(this.updateControlsState);

        this.onNarratorAvatarChange();
        model.onNarratorAvatarChange.subscribe(this.onNarratorAvatarChange);

        this.updateProgressState();
        model.progressState.subscribe(this.updateProgressState);

        model.onViewRecommendations.subscribe(this.onViewRecommendations);
    }

    onViewRecommendations = () => {
        [this.el(".transcripts-button")].forEach((e) => e && e.classList.remove("active"));
        [this.el(".recommendations-button")].forEach((e) => e && e.classList.add("active"));
    };

    updateControlsState = () => {
        this._updateControlState();
    };

    _updateControlState() {
        [this.el("#skip-button"), this.el("#rewind-button"), this.el("#tray-play-button"), this.el("#tray-pause-button")].forEach((el) => {
            Component.hideElement(el);
        });

        const orientation = !isDesktopMode() ? "portrait" : "landscape";
        const playMode = Cast.userInteracted ? "normal" : "auto";
        const mode = playMode === "auto" ? "disabled" : "enabled";
        const cursor = playMode === "auto" ? "default" : "pointer";
        const opacity = playMode === "auto" ? 0.4 : 1;
        const menuType = model.controlsState.data.menuType;

        if (menuType === "setting" || menuType === "actionFeedback") {
            [
                this.el(".panel-footer-settings-button"),
                this.el(".right-panel-playback-speed"),
                this.el(".panel-footer-language-button"),
                this.el(".feedback-text"),
                this.el(".thumb-up-button"),
                this.el(".thumb-down-button"),
                this.el(".transcripts-button"),
                this.el(".recommendations-button"),
                this.el(".left__content__progress"),
                this.el(".left__blobRestIcon"),
                this.el(".ama-button"),
                this.el(".dbb__right-border"),
            ].forEach((el) => {
                gsap.set(el, { display: "none" });
            });
            this.closeFeedback();

            gsap.set(this.el(".right-control-settings-container-box"), { clearProps: "display" });

            return;
        }

        if (menuType === "none" || (orientation === "landscape" && menuType === "actionFeedback")) {
            [
                this.el(".panel-footer-settings-button"),
                this.el(".right-panel-playback-speed"),
                this.el(".panel-footer-language-button"),
                this.el(".feedback-text"),
                this.el(".thumb-up-button"),
                this.el(".thumb-down-button"),
                this.el(".transcripts-button"),
                this.el(".recommendations-button"),
                this.el(".left__content__progress"),
                this.el(".left__blobRestIcon"),
                this.el(".ama-button"),
                this.el(".dbb__right-border"),
            ].forEach((el) => {
                gsap.set(el, { clearProps: "display" });
            });

            this.onNarratorAvatarChange();

            gsap.set(this.el(".right-control-settings-container-box"), { display: "none" });
            Component.showElement(this.el("#rewind-button"), mode, "block", cursor);

            if (Playback.isPaused) {
                Component.showElement(this.el("#tray-play-button"), mode, "block", cursor);
                if (Playback.hasEnded) {
                    gsap.set(this.el("#tray-play-button").querySelector(".playIconSVG"), { display: "none" });
                    gsap.set(this.el("#tray-play-button").querySelector(".replayIconSVG"), { display: "block" });
                } else {
                    gsap.set(this.el("#tray-play-button").querySelector(".playIconSVG"), { display: "block" });
                    gsap.set(this.el("#tray-play-button").querySelector(".replayIconSVG"), { display: "none" });
                }
            } else {
                Component.showElement(this.el("#tray-pause-button"), mode, "block", cursor);
            }
            gsap.set(this.el("#skip-button"), { display: "block" });
        }

        if (model.controlsState.data.canSkip) {
            Component.enableElement(this.el("#skip-button"), "block", "pointer", 1);
        } else {
            Component.disableElement(this.el("#skip-button"));
        }
    }

    updateLocale = () => {
        gsap.set(".recommendations-button .text", { innerHTML: Cast.locale.translatedContent["actionMenuTitle"] });
        gsap.set(".transcripts-button .text", { innerHTML: Cast.locale.translatedContent["transcriptButton"] });

        const el = document.querySelector(`.languageSelect p[data-locale=${Cast.locale.lang}] svg`);
        if (el) gsap.set(".panel-footer-language-button-icon", { innerHTML: el.outerHTML });
        if (this.el(".panel-footer-language-button-icon svg")) this.el(".panel-footer-language-button-icon svg").classList.remove("locale-flag");

        gsap.set(this.el(".feedback-text"), { innerHTML: Cast.locale.translatedContent["feedbackTrayTitle"] });

        const s = extractMetadataProperty(gStory.getUntranslatedStory(), "autoFeedbackTitle", null);
        gsap.set(this.el("#feedback-menu-title-text"), { innerHTML: s ? s : Cast.locale.translatedContent["feedbackMenuTitle"] });
        gsap.set(this.el("#feedback-textarea"), { placeholder: Cast.locale.translatedContent["feedbackTextAreaPlaceholder"] });

        const elementsToLocales = {
            ".tray-play-button-tooltip": "play",
            ".tray-pause-button-tooltip": "pause",
            ".rewind-button-tooltip": "previousSlide",
            ".skip-button-tooltip": "nextSlide",
            ".panel-footer-settings-button-tooltip": "settingMenuTitle",
            ".right-panel-playback-speed-current-tooltip": "settingPlaybackSpeed",
            ".panel-footer-language-button-tooltip": "settingLanguage",
            ".thumb-up-button-tooltip": "thumbUpButtonTooltip",
            ".thumb-down-button-tooltip": "thumbDownButtonTooltip",
        };

        //
        gsap.set(this.el(".ama-button .text"), { innerHTML: Cast.locale.translatedContent["askMeAnythingText"] });

        Object.keys(elementsToLocales).map((key) => {
            const el = this.element.querySelector(key);
            if (el) {
                el.innerHTML = Cast.locale.translatedContent[elementsToLocales[key]];
            }
        });
    };

    el = (selector) => {
        return this.element.querySelector(selector);
    };

    updateProgressState = () => {
        const { elapsedTime, totalTime, progress } = model.progressState.data;
        gsap.set(this.el(".controls-tooltip-elapsed-time"), { innerHTML: elapsedTime });
        gsap.set(this.el(".controls-tooltip-total-time"), { innerHTML: totalTime });
        gsap.set(this.el("#progress-bar"), { width: `${progress}%` });
    };
    render() {
        const html = `
        <div class="dbb__left">
                <div class="left__content">
                   <div class="left__blobAvatarContainer">${blobSVG("dark")}</div>
                   <div class="left__blobRestIcon"> ${SVG.blobRestIcon()} </div>
                   <div class="left__content__progress">
                       <div class="controls-tooltip-elapsed-time">1m28s</div>
                       <div id="scrubber-bar-container"></div>
                       <div class="controls-tooltip-total-time">4m18s</div>
                    </div>
                </div>
               <div id="player-control-container">
                    <div id="rewind-button" class="noselect tray-button" onclick="skipBackward()">
                        <div class="controls-tooltip-text rewind-button-tooltip">Previous slide</div>
                        ${SVG.rewindButtonIcon()}                      
                    </div>
                    <div id="tray-play-button" class="noselect tray-button" onclick="togglePlayPause()">
                     
                        <div class="controls-tooltip-text tray-play-button-tooltip" style="left:50%">Play</div>                    
                        ${SVG.trayPlayButtonIcon(castColor(0))}
                        ${SVG.replayIcon(castColor(0))}
                    </div>
                    <div id="tray-pause-button" class="noselect tray-button" onclick="togglePlayPause()" data-testid="pause-button">
                        <div class="controls-tooltip-text tray-pause-button-tooltip" style="left:50%; bottom:110%">Pause</div>
                        ${SVG.trayPauseButtonIcon()}
                    </div>
                    <div id="skip-button" class="noselect tray-button" onclick="skipForward()" data-testid="skip-button">
                        <div class="controls-tooltip-text skip-button-tooltip" >Next slide</div>
                        ${SVG.skipButtonIcon()}
                        
                    </div>
                </div>
                <div class="left__right" >
                            <div class="noselect panel-footer-button panel-footer-settings-button" >
                                <div class="panel-footer-tooltip-text panel-footer-settings-button-tooltip" data-testid="footer-setting-button" >Settings</div>
                                <div class="panel-footer-settings-button-icon">${SVG.settingMenuToggleButtonIcon("white")}</div>
                            </div>
                            <div class="panel-footer-button right-panel-playback-speed">
                                <div class="panel-footer-tooltip-text right-panel-playback-speed-current-tooltip" >Playback speed</div>
                                <div class="playback-speed-box">
                                    <div class="playback-speed-title">${Cast.locale.translatedContent["selectPlaybackSpeed"]}</div>
                                    <div class="playback-speed-options">
                                        <div class="playback-speed-option" data-speed="slow">0.5x</div>
                                        <div class="playback-speed-option active" data-speed="medium">1x</div>
                                        <div class="playback-speed-option" data-speed="fast">1.5x</div>
                                        <div class="playback-speed-option" data-speed="x-fast">2x</div>                       
                                    </div>
                                </div>
                                <div class="right-panel-playback-speed-current" data-testid="current-playback-speed" >1x</div>
                            </div>
                            <div class="panel-footer-button panel-footer-language-button">
                                  <div class="language-select-box">                        
                        <div class="configType popup-menu-section-title"><span class="setting-language">Language: </span> <span class="hovered-locale-name"></span></div>                        
                        <div class="selectTab languageSelect">
                        <p  class="selected" data-locale="english" data-name="US English" >
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="256" fill="#f0f0f0" r="256"/><g fill="#d80027"><path d="m244.87 256h267.13c0-23.106-3.08-45.49-8.819-66.783h-258.311z"/><path d="m244.87 122.435h229.556c-15.671-25.572-35.708-48.175-59.07-66.783h-170.486z"/><path d="m256 512c60.249 0 115.626-20.824 159.356-55.652h-318.712c43.73 34.828 99.107 55.652 159.356 55.652z"/><path d="m37.574 389.565h436.852c12.581-20.529 22.338-42.969 28.755-66.783h-494.362c6.417 23.814 16.174 46.254 28.755 66.783z"/></g><path d="m118.584 39.978h23.329l-21.7 15.765 8.289 25.509-21.699-15.765-21.699 15.765 7.16-22.037c-19.106 15.915-35.852 34.561-49.652 55.337h7.475l-13.813 10.035c-2.152 3.59-4.216 7.237-6.194 10.938l6.596 20.301-12.306-8.941c-3.059 6.481-5.857 13.108-8.372 19.873l7.267 22.368h26.822l-21.7 15.765 8.289 25.509-21.699-15.765-12.998 9.444c-1.301 10.458-1.979 21.11-1.979 31.921h256c0-141.384 0-158.052 0-256-50.572 0-97.715 14.67-137.416 39.978zm9.918 190.422-21.699-15.765-21.699 15.765 8.289-25.509-21.7-15.765h26.822l8.288-25.509 8.288 25.509h26.822l-21.7 15.765zm-8.289-100.083 8.289 25.509-21.699-15.765-21.699 15.765 8.289-25.509-21.7-15.765h26.822l8.288-25.509 8.288 25.509h26.822zm100.115 100.083-21.699-15.765-21.699 15.765 8.289-25.509-21.7-15.765h26.822l8.288-25.509 8.288 25.509h26.822l-21.7 15.765zm-8.289-100.083 8.289 25.509-21.699-15.765-21.699 15.765 8.289-25.509-21.7-15.765h26.822l8.288-25.509 8.288 25.509h26.822zm0-74.574 8.289 25.509-21.699-15.765-21.699 15.765 8.289-25.509-21.7-15.765h26.822l8.288-25.509 8.288 25.509h26.822z" fill="#0052b4"/></svg>
                        </p>
                        <p  data-locale="british" data-name="UK English" >
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="256" fill="#f0f0f0" r="256"/><g fill="#0052b4"><path d="m52.92 100.142c-20.109 26.163-35.272 56.318-44.101 89.077h133.178z"/><path d="m503.181 189.219c-8.829-32.758-23.993-62.913-44.101-89.076l-89.075 89.076z"/><path d="m8.819 322.784c8.83 32.758 23.993 62.913 44.101 89.075l89.074-89.075z"/><path d="m411.858 52.921c-26.163-20.109-56.317-35.272-89.076-44.102v133.177z"/><path d="m100.142 459.079c26.163 20.109 56.318 35.272 89.076 44.102v-133.176z"/><path d="m189.217 8.819c-32.758 8.83-62.913 23.993-89.075 44.101l89.075 89.075z"/><path d="m322.783 503.181c32.758-8.83 62.913-23.993 89.075-44.101l-89.075-89.075z"/><path d="m370.005 322.784 89.075 89.076c20.108-26.162 35.272-56.318 44.101-89.076z"/></g><g fill="#d80027"><path d="m509.833 222.609h-220.44-.001v-220.442c-10.931-1.423-22.075-2.167-33.392-2.167-11.319 0-22.461.744-33.391 2.167v220.44.001h-220.442c-1.423 10.931-2.167 22.075-2.167 33.392 0 11.319.744 22.461 2.167 33.391h220.44.001v220.442c10.931 1.423 22.073 2.167 33.392 2.167 11.317 0 22.461-.743 33.391-2.167v-220.44-.001h220.442c1.423-10.931 2.167-22.073 2.167-33.392 0-11.317-.744-22.461-2.167-33.391z"/><path d="m322.783 322.784 114.236 114.236c5.254-5.252 10.266-10.743 15.048-16.435l-97.802-97.802h-31.482z"/><path d="m189.217 322.784h-.002l-114.235 114.235c5.252 5.254 10.743 10.266 16.435 15.048l97.802-97.804z"/><path d="m189.217 189.219v-.002l-114.236-114.237c-5.254 5.252-10.266 10.743-15.048 16.435l97.803 97.803h31.481z"/><path d="m322.783 189.219 114.237-114.238c-5.252-5.254-10.743-10.266-16.435-15.047l-97.802 97.803z"/></g></svg>
                        </p>
                        <p  data-locale="australian" data-name="Australian" >
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m512 256c0 141.384-114.616 256-256 256s-256-114.616-256-256c0 .06 256-255.971 256-256 141.384 0 256 114.616 256 256z" fill="#0052b4"/><g fill="#f0f0f0"><path d="m256 0c-.014 0-.029.001-.043.001z"/><path d="m255.315 256h.685c0-.232 0-.454 0-.685-.228.229-.456.457-.685.685z"/><path d="m256 133.566c0-45.045 0-74.562 0-133.565h-.043c-141.365.023-255.957 114.628-255.957 255.999h133.565v-75.212l75.212 75.212h46.539c.229-.228.457-.456.685-.685 0-17.247 0-32.636 0-46.536l-75.213-75.213z"/></g><g fill="#d80027"><path d="m129.515 33.391c-40.039 22.799-73.325 56.085-96.124 96.124v126.485h66.783v-155.825-.001h155.826c0-21.063 0-41.129 0-66.783z"/><path d="m256 224.519-90.953-90.952h-31.481c0-.001 0 0 0 0l122.433 122.433h.001s0-21.705 0-31.481z"/></g><g fill="#f0f0f0"><path d="m154.395 300.522 14.05 29.378 31.727-7.333-14.208 29.302 25.514 20.233-31.767 7.16.089 32.564-25.405-20.373-25.404 20.373.089-32.564-31.768-7.16 25.515-20.233-14.21-29.302 31.729 7.333z"/><path d="m383.284 356.174 7.025 14.689 15.864-3.667-7.105 14.651 12.758 10.117-15.884 3.58.044 16.282-12.702-10.187-12.702 10.187.044-16.282-15.883-3.58 12.757-10.117-7.104-14.651 15.863 3.667z"/><path d="m317.933 200.348 7.024 14.69 15.864-3.668-7.104 14.651 12.757 10.117-15.883 3.58.043 16.282-12.701-10.187-12.702 10.187.043-16.282-15.883-3.58 12.757-10.117-7.104-14.651 15.864 3.668z"/><path d="m383.284 111.304 7.025 14.69 15.864-3.667-7.104 14.651 12.756 10.116-15.883 3.581.044 16.282-12.702-10.187-12.702 10.187.044-16.282-15.883-3.581 12.756-10.116-7.103-14.651 15.863 3.667z"/><path d="m440.368 178.087 7.024 14.69 15.864-3.668-7.104 14.651 12.757 10.117-15.884 3.581.044 16.281-12.701-10.186-12.702 10.186.043-16.281-15.883-3.581 12.757-10.117-7.104-14.651 15.863 3.668z"/><path d="m399.55 256 5.525 17.006h17.882l-14.467 10.511 5.527 17.005-14.467-10.51-14.466 10.51 5.525-17.005-14.466-10.511h17.881z"/></g></svg>
                        </p>
                        <p  data-locale="french" data-name="Française" >
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="256" fill="#f0f0f0" r="256"/><path d="m512 256c0-110.071-69.472-203.906-166.957-240.077v480.155c97.485-36.172 166.957-130.007 166.957-240.078z" fill="#d80027"/><path d="m0 256c0 110.071 69.473 203.906 166.957 240.077v-480.154c-97.484 36.171-166.957 130.006-166.957 240.077z" fill="#0052b4"/></svg>
                        </p>
                        <p  data-locale="spanish" data-name="Española" >
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m0 256c0 31.314 5.633 61.31 15.923 89.043l240.077 22.261 240.077-22.261c10.29-27.733 15.923-57.729 15.923-89.043s-5.633-61.31-15.923-89.043l-240.077-22.261-240.077 22.261c-10.29 27.733-15.923 57.729-15.923 89.043z" fill="#ffda44"/><g fill="#d80027"><path d="m496.077 166.957c-36.171-97.484-130.006-166.957-240.077-166.957s-203.906 69.473-240.077 166.957z"/><path d="m15.923 345.043c36.171 97.484 130.006 166.957 240.077 166.957s203.906-69.473 240.077-166.957z"/></g></svg>
                        </p>
                        <p  data-locale="italian" data-name="Italiano" >
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="256" fill="#f0f0f0" r="256"/><path d="m512 256c0-110.071-69.472-203.906-166.957-240.077v480.155c97.485-36.172 166.957-130.007 166.957-240.078z" fill="#d80027"/><path d="m0 256c0 110.071 69.472 203.906 166.957 240.077v-480.154c-97.485 36.171-166.957 130.006-166.957 240.077z" fill="#6da544"/></svg>
                        </p>
                        <p  data-locale="german" data-name="Deutsche" >
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m15.923 345.043c36.171 97.484 130.006 166.957 240.077 166.957s203.906-69.473 240.077-166.957l-240.077-22.26z" fill="#ffda44"/><path d="m256 0c-110.071 0-203.906 69.472-240.077 166.957l240.077 22.26 240.077-22.261c-36.171-97.484-130.006-166.956-240.077-166.956z"/><path d="m15.923 166.957c-10.29 27.733-15.923 57.729-15.923 89.043s5.633 61.31 15.923 89.043h480.155c10.29-27.733 15.922-57.729 15.922-89.043s-5.632-61.31-15.923-89.043z" fill="#d80027"/></svg>
                        </p>
                        <p  data-locale="dutch" data-name="Nederlandse" >
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="256" fill="#f0f0f0" r="256"/><path d="m256 0c-110.071 0-203.906 69.472-240.077 166.957h480.155c-36.172-97.485-130.007-166.957-240.078-166.957z" fill="#a2001d"/><path d="m256 512c110.071 0 203.906-69.472 240.077-166.957h-480.154c36.171 97.485 130.006 166.957 240.077 166.957z" fill="#0052b4"/></svg>
                        </p>
                        <p  data-locale="danish" data-name="Dansk" >
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="256" fill="#f0f0f0" r="256"/><g fill="#d80027"><path d="m200.349 222.609h309.484c-16.363-125.607-123.766-222.609-253.833-222.609-19.115 0-37.732 2.113-55.652 6.085v216.524z"/><path d="m133.565 222.608v-191.481c-70.293 38.354-120.615 108.705-131.398 191.482h131.398z"/><path d="m133.564 289.391h-131.397c10.783 82.777 61.105 153.128 131.398 191.481z"/><path d="m200.348 289.392v216.523c17.92 3.972 36.537 6.085 55.652 6.085 130.067 0 237.47-97.002 253.833-222.609h-309.485z"/></g></svg>
                        </p>
                        <p  data-locale="japanese" data-name="日本語" >
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="256" fill="#f0f0f0" r="256"/><circle cx="256" cy="256" fill="#d80027" r="111.304"/></svg>
                        </p>
                        <p  data-locale="hindi" data-name="हिंदी" >
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="256" fill="#f0f0f0" r="256"/><path d="m256 0c-101.494 0-189.19 59.065-230.598 144.696h461.195c-41.407-85.631-129.104-144.696-230.597-144.696z" fill="#ff9811"/><path d="m256 512c101.493 0 189.19-59.065 230.598-144.696h-461.196c41.408 85.631 129.104 144.696 230.598 144.696z" fill="#6da544"/><circle cx="256" cy="256" fill="#0052b4" r="89.043"/><circle cx="256" cy="256" fill="#f0f0f0" r="55.652"/><path d="m256 187.326 17.169 38.938 42.304-4.601-25.136 34.337 25.136 34.337-42.304-4.601-17.169 38.938-17.169-38.938-42.304 4.6 25.136-34.336-25.136-34.337 42.304 4.601z" fill="#0052b4"/></svg>
                        </p>
                        <p  data-locale="chinese" data-name="中文" >
                            <svg class="locale-flag" enable-background="new -49 141 512 512" viewBox="-49 141 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="207" cy="397" fill="#d80027" r="256"/><g fill="#ffda44"><path d="m91.1 296.8 22.1 68h71.5l-57.8 42.1 22.1 68-57.9-42-57.9 42 22.2-68-57.9-42.1h71.5z"/><path d="m254.5 537.5-16.9-20.8-25 9.7 14.5-22.5-16.9-20.9 25.9 6.9 14.6-22.5 1.4 26.8 26 6.9-25.1 9.6z"/><path d="m288.1 476.5 8-25.6-21.9-15.5 26.8-.4 7.9-25.6 8.7 25.4 26.8-.3-21.5 16 8.6 25.4-21.9-15.5z"/><path d="m333.4 328.9-11.8 24.1 19.2 18.7-26.5-3.8-11.8 24-4.6-26.4-26.6-3.8 23.8-12.5-4.6-26.5 19.2 18.7z"/><path d="m255.2 255.9-2 26.7 24.9 10.1-26.1 6.4-1.9 26.8-14.1-22.8-26.1 6.4 17.3-20.5-14.2-22.7 24.9 10.1z"/></g></svg>
                        </p>                        
                    </div>
                    </div>
                                <div class="panel-footer-tooltip-text panel-footer-language-button-tooltip">${Cast.locale.translatedContent["settingLanguage"]}</div> 
                                <div class="panel-footer-language-button-icon" data-testid="footer-language-button" ><svg  enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="256" fill="#f0f0f0" r="256"/><g fill="#d80027"><path d="m244.87 256h267.13c0-23.106-3.08-45.49-8.819-66.783h-258.311z"/><path d="m244.87 122.435h229.556c-15.671-25.572-35.708-48.175-59.07-66.783h-170.486z"/><path d="m256 512c60.249 0 115.626-20.824 159.356-55.652h-318.712c43.73 34.828 99.107 55.652 159.356 55.652z"/><path d="m37.574 389.565h436.852c12.581-20.529 22.338-42.969 28.755-66.783h-494.362c6.417 23.814 16.174 46.254 28.755 66.783z"/></g><path d="m118.584 39.978h23.329l-21.7 15.765 8.289 25.509-21.699-15.765-21.699 15.765 7.16-22.037c-19.106 15.915-35.852 34.561-49.652 55.337h7.475l-13.813 10.035c-2.152 3.59-4.216 7.237-6.194 10.938l6.596 20.301-12.306-8.941c-3.059 6.481-5.857 13.108-8.372 19.873l7.267 22.368h26.822l-21.7 15.765 8.289 25.509-21.699-15.765-12.998 9.444c-1.301 10.458-1.979 21.11-1.979 31.921h256c0-141.384 0-158.052 0-256-50.572 0-97.715 14.67-137.416 39.978zm9.918 190.422-21.699-15.765-21.699 15.765 8.289-25.509-21.7-15.765h26.822l8.288-25.509 8.288 25.509h26.822l-21.7 15.765zm-8.289-100.083 8.289 25.509-21.699-15.765-21.699 15.765 8.289-25.509-21.7-15.765h26.822l8.288-25.509 8.288 25.509h26.822zm100.115 100.083-21.699-15.765-21.699 15.765 8.289-25.509-21.7-15.765h26.822l8.288-25.509 8.288 25.509h26.822l-21.7 15.765zm-8.289-100.083 8.289 25.509-21.699-15.765-21.699 15.765 8.289-25.509-21.7-15.765h26.822l8.288-25.509 8.288 25.509h26.822zm0-74.574 8.289 25.509-21.699-15.765-21.699 15.765 8.289-25.509-21.7-15.765h26.822l8.288-25.509 8.288 25.509h26.822z" fill="#0052b4"/></svg></div>                                
                            </div>
                             <div class="recommendations-button__space"></div>
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
                                <div class="feedback-text">${Cast.locale.translatedContent["feedbackTrayTitle"]}</div>
                                   <div class="panel-footer-tooltip-text thumb-up-button-tooltip" >${Cast.locale.translatedContent["thumbUpButtonTooltip"]}</div>
                                   <div class="panel-footer-tooltip-text thumb-down-button-tooltip" >${Cast.locale.translatedContent["thumbDownButtonTooltip"]}</div>
                              <div id="feedback-thumb-up-button" class="feedback-thumb-button thumb-up-button">
                                       
                                        ${SVG.thumbUpNew()}
                                    </div>
                                    <div id="feedback-thumb-down-button" class="feedback-thumb-button thumb-down-button">
                                        ${SVG.thumbDownNew()}
                                    </div>
                        </div> 
                            <div class="right-control-settings-container-box">
                        <div class="noselect desktop-tray-button" onclick="applySettingsAndCloseMenu()" data-testid="apply-icon">
                            ${SVG.settingMenuApplyButtonIcon()}
                        </div>
                        <div class="noselect desktop-tray-button" onclick="cancelSettingsAndCloseMenu()" data-testid="cancel-icon">
                            ${SVG.settingMenuCancelButtonIcon()}
                        </div>    
                    </div>
                            
               </div>
            
        </div>        
        <div class="dbb__right">
        <div class="dbb__right_content">   
        
        <div class="dbb__right-border"></div>
            <button class="recommendations-button active">    
                <span class="icon">${SVG.bell()}</span>
                <span class="text">${Cast.locale.translatedContent["actionMenuTitle"]}</span>
            </button>
            
           
            <button class="transcripts-button">
                <span class="icon">${SVG.transcriptsButtonIcon()}</span>
                <span class="text">${Cast.locale.translatedContent["transcriptButton"]}</span></button>
             </div>
        </div>
          
            `;

        this.element.innerHTML = html;

        this.el("#scrubber-bar-container").append(new Scrubber({ model: model }).element);

        [".panel-footer-settings-button"].forEach((e) => {
            this.el(e).addEventListener("click", () => {
                openMenu();
                this.closeFeedback();
            });
        });

        this.el(".recommendations-button").addEventListener("click", () => {
            model.onViewRecommendations.notify();
        });

        this.el(".transcripts-button").addEventListener("click", () => {
            model.onViewTranscripts.notify();
            [this.el(".recommendations-button")].forEach((e) => e.classList.remove("active"));
            [this.el(".transcripts-button")].forEach((e) => e.classList.add("active"));
        });

        this.el(".thumb-up-button").addEventListener("click", () => {
            if (this._thumbButtonsDisabled) return;
            this._closeAllBoxes();
            this.doThumbUp();
            this.doSilentFeedback("Positive", "", "");
        });

        this.el(".thumb-down-button").addEventListener("click", () => {
            if (this._thumbButtonsDisabled) return;
            this._closeAllBoxes();
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

        const s = extractMetadataProperty(gStory.getUntranslatedStory(), "autoFeedbackTitle", null);
        if (s) gsap.set(this.el("#feedback-menu-title-text"), { innerHTML: s });

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

        gsap.set([this.element.querySelector(".playback-speed-box"), this.element.querySelector(".language-select-box")], { display: "none" });

        //Playback speed box
        const playbackSpeedOptions = this.element.querySelectorAll(".playback-speed-option");

        playbackSpeedOptions.forEach((item) => {
            item.addEventListener("click", (event) => {
                controlPause();
                updatePlayRateSelection(event.target.dataset.speed);
                applyPlayRateSelection();
                controlPlay();

                playbackSpeedOptions.forEach((item) => item.classList.remove("active"));
                event.target.classList.add("active");

                gsap.set(".playback-speed-box", { display: "none" });
                this.element.querySelector(".right-panel-playback-speed").classList.remove("active");
            });
        });

        this.element.querySelector(".right-panel-playback-speed-current").addEventListener("click", (e) => {
            e.stopImmediatePropagation();
            this._closeAllBoxes();
            document.addEventListener("click", this.checkMouseOutsidePlaybackSpeedBox);

            const playbackSpeedOptions = this.element.querySelectorAll(".playback-speed-option");
            gsap.set(this.el(".playback-speed-box"), { display: "block" });

            this.element.querySelector(".right-panel-playback-speed").classList.add("active");

            playbackSpeedOptions.forEach((item) => item.classList.remove("active"));

            const activeSpeedOption = this.element.querySelector(`.playback-speed-option[data-speed="${PlayRateSetting.getCurrent()}"]`);
            if (activeSpeedOption) {
                activeSpeedOption.classList.add("active");
            }
        });

        //Language
        this.element.querySelectorAll(".languageSelect p").forEach((element) => {
            //get element data-locale attribute
            element.addEventListener("click", (event) => {
                const locale = element.getAttribute("data-locale");
                if (locale == Cast.locale.lang) return;
                this.element.querySelectorAll(".languageSelect p").forEach((e) => {
                    e.classList.remove("selected");
                });

                updateLocaleSelection(locale);
                applySettingsAndCloseMenu();

                element.classList.add("selected");
                gsap.set(this.el(".language-select-box"), { display: "none" });
                this.element.querySelector(".panel-footer-language-button").classList.remove("active");
                this._closeAllBoxes();
            });

            element.addEventListener("mouseover", () => {
                const dataName = element.getAttribute("data-name");
                this.element.querySelector(".hovered-locale-name").innerHTML = dataName;
            });
            element.addEventListener("mouseout", () => {
                const dataName = this.element.querySelectorAll(`.languageSelect p[data-locale=${Cast.locale.lang}]`)[0].getAttribute("data-name");
                this.element.querySelector(".hovered-locale-name").innerHTML = dataName;
            });
        });

        this.element.querySelector(".panel-footer-language-button-icon").addEventListener("click", (event) => {
            this._closeAllBoxes();
            document.addEventListener("click", this.checkMouseOutsideLanguageBox);

            gsap.set(".language-select-box", { display: "block" });
            this.element.querySelector(".panel-footer-language-button").classList.add("active");
            this.element.querySelectorAll(".languageSelect p").forEach((e) => {
                e.classList.remove("selected");
            });
            const currentElement = this.element.querySelectorAll(`.languageSelect p[data-locale=${Cast.locale.lang}]`)[0];
            currentElement.classList.add("selected");

            const dataName = currentElement.getAttribute("data-name");
            this.element.querySelector(".hovered-locale-name").innerHTML = dataName;
        });

        this.addMouseOverTooltip(["rewind-button", "skip-button", "tray-pause-button", "tray-play-button"]);
        this._addMouseOverTooltip([
            "panel-footer-settings-button-icon",
            "panel-footer-transcripts-button-icon",
            "right-panel-playback-speed-current",
            "panel-footer-language-button-icon",
            "thumb-up-button",
            "thumb-down-button",
        ]);
        this.onNarratorAvatarChange();
    }

    checkMouseOutsideLanguageBox = (e) => {
        if (!e.target.closest(".language-select-box") && !e.target.closest(".panel-footer-language-button")) {
            this._closeAllBoxes();
        }
    };

    checkMouseOutsidePlaybackSpeedBox = (e) => {
        if (!e.target.closest(".playback-speed-box") && !e.target.closest(".right-panel-playback-speed")) {
            this._closeAllBoxes();
        }
    };

    _closeAllBoxes = () => {
        document.removeEventListener("click", this.checkMouseOutsideLanguageBox);
        document.removeEventListener("click", this.checkMouseOutsidePlaybackSpeedBox);
        gsap.set(".language-select-box", { display: "none" });
        this.element.querySelector(".panel-footer-language-button").classList.remove("active");

        gsap.set(".playback-speed-box", { display: "none" });
        this.element.querySelector(".right-panel-playback-speed").classList.remove("active");
        this.closeFeedback();
    };

    addMouseOverTooltip = (classList) => {
        classList.forEach((className) => {
            this.el("#" + className).addEventListener("mouseover", (event) => {
                if (!document.documentElement.classList.contains("isMobile")) {
                    gsap.set("." + className + "-tooltip", { autoAlpha: 1 });
                }
            });
            this.el("#" + className).addEventListener("mouseout", (event) => {
                gsap.set("." + className + "-tooltip", { autoAlpha: 0 });
            });
        });
    };

    _addMouseOverTooltip = (classList) => {
        classList.forEach((className) => {
            const el = this.el("." + className);
            if (!el) return;
            el.addEventListener("mouseenter", (event) => {
                if (isDesktopMode()) {
                    gsap.set("." + className.replace("-icon", "") + "-tooltip", { autoAlpha: 1 });
                }

                if (className === "panel-footer-transcripts-button-icon") {
                    gsap.set("." + className.replace("-icon", "") + "-tooltip", {
                        innerHTML:
                            TranscriptMenuDetails.getCurrent() === "expanded" ? Cast.locale.translatedContent["hideTranscripts"] : Cast.locale.translatedContent["showTranscripts"],
                    });
                }
            });
            this.el("." + className).addEventListener("mouseleave", (event) => {
                gsap.set("." + className.replace("-icon", "") + "-tooltip", { autoAlpha: 0 });
            });
        });
    };

    doThumbUp = () => {
        this.el(".thumb-up-button").classList.add("active");
        this.el(".thumb-down-button").classList.remove("active");
        gsap.set(this.el("#feedback-menu-container"), { display: "block" });
    };
    doThumbDown = () => {
        this.el(".thumb-up-button").classList.remove("active");
        this.el(".thumb-down-button").classList.add("active");
        gsap.set(this.el("#feedback-menu-container"), { display: "block" });
    };

    doSilentFeedback = (rating) => {
        const feedbackData = JSON.stringify({
            title: "What would make this experience better for you?",
            webhook: "https://cast.app",
            payload: "some payload",
        });

        // Process feedback.
        Cast.processFeedback(rating, "", feedbackData, "silent-feedback");
    };

    closeFeedback = () => {
        gsap.set(this.el("#feedback-menu-container"), { display: "none" });
        this.el(".thumb-up-button").classList.remove("active");
        this.el(".thumb-down-button").classList.remove("active");
        this.el("#feedback-textarea").value = "";
        this.validateFeedbackInputs();
        this._thumbButtonsDisabled = false;
        model.feedbackPanelState.data = null;
    };

    validateFeedbackInputs = () => {
        const feedbackInput = this.el("#feedback-textarea");

        const feedbackSubmitButton = this.el("#feedback-submit-button");

        if (feedbackInput.value.trim().length) {
            feedbackSubmitButton.classList.remove("submitShareDisableHover");
            gsap.set(feedbackSubmitButton, { alpha: 1, disabled: false });
        } else {
            feedbackSubmitButton.classList.add("submitShareDisableHover");
            gsap.set(feedbackSubmitButton, { alpha: 0.5, disabled: true });
        }
    };

    submitFeedback = () => {
        this._thumbButtonsDisabled = true;

        gsap.set([this.el("#feedback-menu-heading"), this.el("#feedback-form")], {
            display: "none",
        });

        // Get rating.

        const rating = this.el(".thumb-up-button").classList.contains("active") ? "Positive" : this.el(".thumb-down-button").classList.contains("active") ? "Negative" : "None";

        // Get feedback.
        const feedbackTextareaElement = document.getElementById("feedback-textarea");
        const feedback = feedbackTextareaElement ? feedbackTextareaElement.value : "";

        // Get feedback data.
        const feedbackData = JSON.stringify({
            title: "What would make this experience better for you?",
            webhook: "https://cast.app",
            payload: "some payload",
        });

        // Process feedback.
        Cast.processFeedback(rating, feedback, feedbackData ? feedbackData : "");
    };

    onConfirmFeedback = () => {
        const rating = model.onConfirmFeedback.data;
        gsap.set(this.el("#feedback-success-confirmation-message"), {
            innerText: rating === "Negative" ? Cast.locale.translatedContent["responseToNegativeFeedback"] : Cast.locale.translatedContent["responseToPositiveFeedback"],
        });

        // Show feedback submission confirmation.
        gsap.set("#feedback-confirmation", {
            display: "flex",
        });

        gsap.to({}, 3, {
            onComplete: () => {
                this.closeFeedback();

                gsap.set([this.el("#feedback-menu-heading"), this.el("#feedback-form")], {
                    display: "flex",
                });
                gsap.set("#feedback-confirmation", {
                    display: "none",
                });
            },
        });
    };

    onNarratorAvatarChange = () => {
        const narratorAvatar = model.onNarratorAvatarChange.data;

        if (narratorAvatar) {
            gsap.set(this.el(".left__blobAvatarContainer"), { display: narratorAvatar === "blob" ? "flex" : "none" });
            gsap.set(this.el(".left__blobRestIcon"), { display: narratorAvatar === "blob" ? "none" : "flex" });
        }
    };

    destroy() {
        model.onTranslationChange.unsubscribe(this.updateLocale);
        model.onConfirmFeedback.unsubscribe(this.onConfirmFeedback);
        model.controlsState.unsubscribe(this.updateControlsState);
        model.onNarratorAvatarChange.unsubscribe(this.onNarratorAvatarChange);
        model.progressState.unsubscribe(this.updateProgressState);

        if (this.el(".thumb-up-button").classList.contains("active") || this.el(".thumb-down-button").classList.contains("active")) {
            model.feedbackPanelState.data = {
                thumbUp: this.el(".thumb-up-button").classList.contains("active"),
                text: this.el("#feedback-textarea").value,
            };
        }
    }
}

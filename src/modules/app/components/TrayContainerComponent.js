/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

/* eslint-disable */
"use strict";

import Component from "./Component";
import model from "../env/model/AppModel";

export default class TrayContainerComponent extends Component {
    _totalTime = [];
    _sequences = [];
    constructor() {
        super("div", "tray-container", ["noselect"]);
    }

    setUpElement = () => {
        this.element.innerHTML = `
          
            <div id="narration-audio-loading-spinner">
                ${SVG.narrationAudioLoadingSpinnerIcon()}
            </div>
            
        `;

        this.narrationAudioLoadingSpinnerElement = this.element.querySelector("#narration-audio-loading-spinner");

        document.querySelector("#idVisemeRealtime").addEventListener("click", () => {
            if (NarratorAvatarSetting.getCurrent() === "blob" && NarratorAvatarSetting.lastSelectedAvatar) {
                NarratorAvatarSetting.setNew(NarratorAvatarSetting.lastSelectedAvatar);
            } else {
                NarratorAvatarSetting.setNew("blob");
            }
            NarratorAvatarSetting.applyNew();
            applyNarratorAvatar();
        });

        this.updateLocale();
    };

    updateTrayContainerElement = (orientation = "portrait", playMode = "auto", menuType = "none") => {
        model.controlsState.data.menuType = menuType;
        model.controlsState.notify();
    };

    hideReplayIcon() {}

    toggleTrayPauseButton = (playMode = "auto") => {
        model.controlsState.notify();
    };

    toggleTrayPlayButton = (playMode = "auto") => {
        model.controlsState.notify();
    };

    animateRewindButton = () => {
        gsap.fromTo(
            "#rewind-button",
            {
                x: "0px",
            },
            {
                duration: 0.15,
                x: "-8px",
                yoyo: true,
                repeat: 1,
            }
        );
    };

    animateSkipButton = () => {
        gsap.fromTo(
            "#skip-button",
            {
                x: "0px",
            },
            {
                duration: 0.15,
                x: "8px",
                yoyo: true,
                repeat: 1,
            }
        );
    };

    enableSkipButton = () => {
        model.controlsState.data.canSkip = true;
        model.controlsState.notify();
    };

    disableSkipButton = () => {
        model.controlsState.data.canSkip = false;
        model.controlsState.notify();
    };

    showNarrationAudioLoadingSpinner = () =>
        gsap.set(this.narrationAudioLoadingSpinnerElement, {
            display: "block",
        });

    hideNarrationAudioLoadingSpinner = () =>
        gsap.set(this.narrationAudioLoadingSpinnerElement, {
            display: "none",
        });

    updateProgressBar = (progressPercentage) => {
        this._progressPercentage = gsap.utils.clamp(0, 100, progressPercentage);
        progressPercentage = gsap.utils.clamp(1.5, 100, progressPercentage);

        this._updateElapsedTime();
        model.progressState.notify();
        gsap.to("#progress-bar", {
            width: `${progressPercentage}%`,
            onComplete: () => {
                model.progressState.data.progress = progressPercentage;
            },
        });
    };

    updateTrayColorTheme() {
        const theme = getThemeName();

        let backgroundColor = "#393531";
        let fillColor = "white";
        let opacity = 0.2;

        if (theme !== "dark") {
            backgroundColor = "white";
            fillColor = "#393531";
            opacity = 0.8;
        }
    }

    updateLocale() {
        const elementsToLocales = {
            ".transcript-menu-toggle-button-tooltip": "settingTranscript",
            ".setting-menu-toggle-button-tooltip": "settingMenuTitle",
            ".tray-play-button-tooltip": "play",
            ".tray-pause-button-tooltip": "pause",
            ".rewind-button-tooltip": "previousSlide",
            ".skip-button-tooltip": "nextSlide",
        };

        Object.keys(elementsToLocales).map((key) => {
            const el = this.element.querySelector(key);
            if (el) {
                el.innerHTML = Cast.locale.translatedContent[elementsToLocales[key]];
            }
        });
    }

    initTotalTime(seq) {
        const seqInitial = [];
        for (let i = 0; i < seq.length; i++) {
            const s = seq[i];
            seqInitial.push(s);

            if (s.startsWith("options")) break;
        }

        this._sequences.push(seqInitial);
        model.currentSequence.data = seqInitial;
        model.currentSequence.notify();
        const charLength = this._getSequenceTime(seqInitial);
        this._totalTime.push(charLength);
        this._updatedTotalTime();
    }

    addTime(sequence) {
        const filteredSequence = sequence.filter((s) => s !== "autofeedback");
        if (filteredSequence.length < 1) return;

        this._sequences.push(filteredSequence);
        const charLength = this._getSequenceTime(filteredSequence);
        this._totalTime.push(charLength);

        model.currentSequence.data = this._sequences[this._sequences.length - 1];
        model.currentSequence.notify();

        this._updatedTotalTime();
    }

    _getSequenceTime(seq) {
        let charLength = 0;
        for (let i = 0; i < seq.length; i++) {
            const currentSteps = steps(seq[i]);
            for (let j = 0; j < currentSteps.length; j++) {
                const step = currentSteps[j];
                const narrations = step.narrations;
                if (Array.isArray(narrations) && narrations.length) {
                    narrations.forEach((item) => {
                        if (typeof item === "string" || item instanceof String) {
                            charLength += item.length;
                        } else if (item.value) {
                            charLength += item.value.length;
                        }
                    });
                }
            }
        }

        charLength = parseInt(charLength * 0.05);
        return charLength;
    }

    _updatedTotalTime() {
        const total = this._totalTime.reduce((acc, val) => acc + val, 0);

        let totalString = "";
        if (total < 60) {
            totalString = autoseconds(total);
        } else {
            const minutes = Math.floor((((total % 31536000) % 86400) % 3600) / 60);
            if (total % 60 === 0) {
                totalString = `${minutes}m`;
            } else {
                totalString = autoseconds(total);
            }
        }

        console.log("_updatedTotalTime", this._totalTime);
        model.progressState.data.totalTime = totalString;
        model.progressState.notify();
    }
    _updateElapsedTime() {
        const times = this._totalTime.concat([]);
        const lastTime = times.pop() * (this._progressPercentage / 100);
        const timeText = autoseconds(parseInt(times.reduce((acc, val) => acc + val, 0) + lastTime));

        model.progressState.data.elapsedTime = timeText;
    }

    checkTotalTime(chartID) {
        if (chartID === "autofeedback") return;
        while (this._sequences.length > 1 && this._sequences[this._sequences.length - 1].indexOf(chartID) < 0) {
            this._sequences.pop();
            this._totalTime.pop();

            model.currentSequence.data = this._sequences[this._sequences.length - 1];
            model.currentSequence.notify();

            this._updatedTotalTime();
        }
    }
}

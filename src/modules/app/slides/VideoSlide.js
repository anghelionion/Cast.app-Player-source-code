/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

/* eslint-disable */
import BaseChart from "./BaseChart";

export default class VideoSlide extends BaseChart {
    constructor(story, chartID, source = null) {
        if (!story) throw new ErrorEvent("Invalid story");
        super(story, chartID, source, "widgets");

        this._videoEnded = false;
        this._narrationsEnded = false;
    }

    sunset(forward = 1, waitForUser = false, chartID = null) {
        if (!this._mainContainerDiv) return;
        if (this._sunsetCalled) {
            return;
        }
        this._sunsetCalled = true;
        this.unsetSceneTheme(chartID, forward);
    }

    unsetSceneTheme(chartID, forward, removeNarration = false) {
        if (this._videoElement) {
            this._videoElement.src = "";
        }
        super.unsetSceneTheme(chartID, forward, removeNarration);
    }

    noStepsToDo() {
        this._narrationsEnded = true;

        if (!this._videoEnded) {
            if (Cast.userInteracted) {
                if (this._videoElement.paused) {
                    this._videoElement.play();
                    //gsap.set(".player__control", { innerHTML: this._videoElement.paused ? SVG.trayPlayButtonIcon("#FFFFFF") : SVG.trayPauseButtonIcon("#000") });
                }
                return;
            }
        }
        super.noStepsToDo();
    }

    animationSetAndInlineImage(tl) {
        if (!this._animationSet) {
            tl.add(this.animationSet());
        }
    }

    animationSet() {
        const set = gsap.set;
        const tlInit = gsap.timeline();
        const videoSource = sceneLevelStrVal(this._chartIdentifier, "videoSource", "");

        this._mainContainerDiv = chartContainer(this._base64uuid4, "metricsContainer responsiveHeight");

        this.setupSceneTheme(tlInit);

        const chartTitle = chartContainer(this._base64uuid4 + "-chartTitle", "chartTitle");
        this._mainContainerDiv.appendChild(chartTitle);
        set(chartTitle, {
            text: chartHeadingTitle(gStory, this._chartIdentifier, "Video Slide"),
            color: this._imageTextColor,
        });

        this._widgets_container = elementOfTypeAndClass("div", "widgets_container");
        this._mainContainerDiv.appendChild(this._widgets_container);

        this._narrationBox = setupNarrationBox();

        this._videoContainer = elementOfTypeAndClass("div", "videoContainer");
        this._mainContainerDiv.appendChild(this._videoContainer);

        this._videoWrapper = elementOfTypeAndClass("div", "videoWrapper");
        this._videoContainer.appendChild(this._videoWrapper);

        this._videoElement = elementOfTypeAndClass("video", "videoElement");
        this._videoElement.src = videoSource;
        this._videoElement.controls = false;
        this._videoElement.playsInline = true;
        this._videoElement.allowFullscreen = false;
        this._videoElement.addEventListener("ended", () => {
            this._videoEnded = true;
            this.noStepsToDo();
        });
        this._videoElement.addEventListener("pause", () => {
            if (!Playback.isPaused) controlPause();
        });
        this._videoElement.addEventListener("play", () => {
            if (Playback.isPaused) controlPlay();
        });

        this._videoElement.addEventListener("timeupdate", () => {
            const percent = (this._videoElement.currentTime / this._videoElement.duration) * 100;
            gsap.set(".player__progress", { width: percent + "%" });
        });

        this._videoWrapper.appendChild(this._videoElement);

        this._videoControls = elementOfTypeAndClass("div", "player__controls");

        const videoControlsContent = `             
              <div class="player__seekbar">
                  <div class="player__progress"></div>
               </div>            
        `;

        this._videoControls.innerHTML = videoControlsContent;
        this._videoWrapper.appendChild(this._videoControls);

        const seekBar = this._videoControls.querySelector(".player__seekbar");
        seekBar.addEventListener("click", (event) => {
            const newTime = (event.offsetX / seekBar.offsetWidth) * this._videoElement.duration;
            this._videoElement.currentTime = newTime;
        });

        return tlInit;
    }

    updateVideoState(isPaused) {
        if (!this._narrationsEnded) return;
        if (isPaused) {
            if (!this._videoElement.paused) this._videoElement.pause();
        } else {
            if (this._videoElement.paused) this._videoElement.play();
        }
        //gsap.set(".player__control", { innerHTML: this._videoElement.paused ? SVG.trayPlayButtonIcon("#FFFFFF") : SVG.trayPauseButtonIcon("#000") });
    }

    doHighlight() {
        const tlSegment = gsap.timeline();

        addNarrationTween(tlSegment, this._narrationBox);

        return gsap.timeline().add([tlSegment]);
    }

    _getPanelBackgroundColor() {
        return sceneLevelStrVal(this._chartIdentifier, "widgetBackgroundColor", "");
        //lets not recalculate everytime
        if (this._cachedPanelBackgroundColor) return this._cachedPanelBackgroundColor;

        //IF a panel Text Color Override is provided use that otherwise default to the text color of slide
        const panelTextColor = sceneLevelStrVal(this._chartIdentifier, "panelTextColor", this._imageTextColor);

        //Use the slide background color to determine whihc dark color to use unless it is transparetn
        const slideBackgroundColor = this._backgroundColor === "transparent" ? "white" : this._backgroundColor;

        // following fixes bugs for custom background colors set in designer project settings
        // TESTED with #000, #191511, #393531, #292521, #a9a5a1
        const darkColorOverride = colorWithHigherContrast(slideBackgroundColor, "#191511", "#393531");
        this._cachedPanelBackgroundColor = colorWithHigherContrast(panelTextColor, darkColorOverride, "#ffffff"); // auto select panel color from text color
        return this._cachedPanelBackgroundColor;
    }
}

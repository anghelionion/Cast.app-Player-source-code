/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

/* eslint-disable */
"use strict";

import { delayLogic, utterAllNarrationsOfStep } from "../env/TTS";

export default class BaseChart {
    static mobileImage = "";
    static desktopImage = "";
    delayTL = null;

    static setBackgroundImageForMode(tlInit) {
        if (tlInit === undefined) tlInit = gsap.timeline();
        const image = isDesktopMode() ? BaseChart.desktopImage : BaseChart.mobileImage;
        tlInit.set(playBoxElement(), { backgroundImage: image.length > 0 ? `url(${encodeURI(image)})` : "none" });
    }

    constructor(story, chartID, source, type) {
        if (!story) throw new ErrorEvent("Invalid story");
        // console.log(type + " chartid: " + chartID);

        this._story = story;
        this._sceneId = story && story.charts && story.charts[chartID] && story.charts[chartID].scene_id ? story.charts[chartID].scene_id : "";

        // this._dimensions = calcDimensions();
        this._base64uuid4 = newBase64uuid4(type);
        this._chartIdentifier = chartID;

        this._animationSet = false;
        this._mode = sceneLevelStrVal(this._chartIdentifier, "mode", "");
        Cast.currentChart = this;
        this._sunsetCalled = false;
        this._stepsIdx = 0;
        this._narrationIndex = 0;

        this._inlineImageHeight = 0;

        this._inlineImageHeightLowerMargin = 0;
        this._source = source;
        this.stepsSupposedToFetchWhilePlaying = [];

        this._dashSeg = "-seg";

        racetrack("chart.create", {
            chartID: this._chartIdentifier,
            chartIndex: Cast.megaSequence.indexOf(this._chartIdentifier),
            totalCharts: Cast.megaSequence.length,
            sceneId: this._sceneId,
        });

        Cast.component.trayContainer.updateProgressBar(gStory.getNarrationsBeforeChartAsPercent(this._chartIdentifier));
    }

    get chartId() {
        return this._chartIdentifier;
    }

    stagger(/** @type {number} */ index) {
        return 0.02 * index;
    }

    unsetSceneTheme(chartID, forward, removeNarration = false) {
        this.clearDelay();

        if (playBoxElement()) {
            //greensock.com/forums/topic/35971-clearprops-issue/?do=findComment&comment=180095
            gsap.set(playBoxElement(), { clearProps: "backgroundImage,backgroundSize,backgroundPosition" });
            this.transition(chartID, gsap.timeline(), forward);

            playBoxElement().style.backgroundImage = "none"; //needed for some reason
            playBoxElement().style.backgroundSize = "";
            playBoxElement().style.backgroundPosition = "";
            // legacy "landing_v2"
            if (this._narrationBox && removeNarration && this._mode !== "editorial" && this._mode !== "panel-editorial" && this._mode !== "landing_v2")
                playBoxElement().removeChild(this._narrationBox);
        }
    }

    setupSceneTheme(tlInit, useLogoAsDefaultInlineImage) {
        let legacyImage = sceneLevelStrVal(this._chartIdentifier, "bgImg", "");
        const mImg = sceneLevelStrVal(this._chartIdentifier, "bgImgMobile", "");
        const dImg = sceneLevelStrVal(this._chartIdentifier, "bgImgDesktop", "");
        let bgImgPosition = "bottom";

        if (mImg.length > 0 || dImg.length > 0) {
            BaseChart.mobileImage = mImg;
            BaseChart.desktopImage = dImg;
            legacyImage = "";
        } else {
            BaseChart.mobileImage = BaseChart.desktopImage = legacyImage;
            //legacy supported img position
            bgImgPosition = sceneLevelStrVal(this._chartIdentifier, "bgImgPosition", "bottom");
        }

        this._panelOpacity = parseFloat(sceneLevelStrVal(this._chartIdentifier, "panelOpacity", "0.2"));
        this._backgroundColor = sceneLevelStrVal(this._chartIdentifier, "backgroundColor", "white");
        this._inlineImg = sceneLevelStrVal(this._chartIdentifier, "inlineImg", "");

        //Landing backwards compatibility
        this._imageTextColor = sceneLevelStrVal(this._chartIdentifier, "imageTextColor", customCssVariable("--cast-imageTextColor-default"));
        if (this._imageTextColor.includes("light")) this._imageTextColor = "light";
        if (this._imageTextColor.includes("dark")) this._imageTextColor = "dark";
        if (this._imageTextColor === "light" || this._imageTextColor === "dark") this._imageTextColor = customCssVariable("--cast-imageTextColor-" + this._imageTextColor);
        if (this._imageTextColor === "auto") this._imageTextColor = customCssVariable("--cast-prominent-fore-color");

        document.documentElement.style.setProperty("--cast-imageTextColor-current", this._imageTextColor);
        document.documentElement.style.setProperty("--cast-background-current", this._backgroundColor);

        playBoxElement().style.backgroundColor = hex(this._backgroundColor);

        playBoxElement().style.backgroundSize = "cover";
        playBoxElement().style.backgroundPosition = bgImgPosition;

        //If you change images in json to include the path begining with 'https://', you can load cdn images in local host, FOR TESTING.  for example
        //change
        // "bgImgMobile": "h924/acdd4a1f26bbd9e524c2643f3aab20b5___companies-m.svg",
        // "bgImgDesktop": "924/06eab1f5310cb38ff3cb8c12b0500649___companies-d.svg",
        // "inlineImg": "924/c62eb54dc84553d308c12a58dbf8f147___use-cases.svg",
        //to
        // "bgImgMobile": "https://storage.googleapis.com/cast-corp/images/landing/924/acdd4a1f26bbd9e524c2643f3aab20b5___companies-m.svg",
        // "bgImgDesktop": "https://storage.googleapis.com/cast-corp/images/landing/924/06eab1f5310cb38ff3cb8c12b0500649___companies-d.svg",
        // "inlineImg": "https://storage.googleapis.com/cast-corp/images/landing/924/c62eb54dc84553d308c12a58dbf8f147___use-cases.svg",
        if (BaseChart.mobileImage.length > 0) BaseChart.mobileImage = CDN.prefixBgPath(BaseChart.mobileImage);
        if (BaseChart.desktopImage.length > 0) BaseChart.desktopImage = CDN.prefixBgPath(BaseChart.desktopImage);

        BaseChart.setBackgroundImageForMode(tlInit);
        this._setVideoBackground();

        if (this._inlineImg.length > 0) {
            this._inlineImg = CDN.prefixBgPath(this._inlineImg);
            this._inlineImageHeight = parseInt(sceneLevelStrVal(this._chartIdentifier, "inlineImgHeight", "170"));
            this._inlineImageHeightLowerMargin = 16;
        } else if (useLogoAsDefaultInlineImage) {
            // COMMENTED OUT to not use logo as default image
            // this._inlineImg = customerLogoFullPath();
            // this._inlineImageHeight = 120;
            // this._inlineImageHeightLowerMargin = 16;
        } else {
            this._inlineImageHeight = parseInt(sceneLevelStrVal(this._chartIdentifier, "inlineImgHeight", "0"));
        }
    }

    do() {
        this._segments = segments(this._chartIdentifier);
        this._steps = steps(this._chartIdentifier);
        this.doStep();
        // Navigation slide fetch first slide for each option
    }

    transition(chartID, tlSunset, forward) {
        // console.log('transition to chartID', chartID, tlSunset)
        if (this._source !== null) {
            this.transitionToChart(this._source, tlSunset);
            return;
        }
        if (chartID != null) {
            this.transitionToChart(chartID, tlSunset);
        } else {
            this.transitionToNextChart(forward, tlSunset);
        }

        //remove sunsetted object
        if (this._mainContainerDiv && this._mainContainerDiv.parentNode) {
            // do not assign removeChild to a variable.  It will keep it in memory depending on scope of variable.
            // https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChildo
            this._mainContainerDiv.parentNode.removeChild(this._mainContainerDiv);
        }
        // backgroundMusicFadeToStop();
    }

    doStep(index = -1) {
        if (!this._steps || this._stepsIdx >= this._steps.length) {
            this.noStepsToDo();
            return;
        }
        this._boolAnimationDone = false;
        this._boolNarrationDone = false;

        if (index < 0) index = this._stepsIdx;
        if (index >= this._steps.length) index = this._steps.length - 1;

        if (Playback.tempStepIndex !== null) {
            index = Playback.tempStepIndex;
            Playback.tempStepIndex = null;
        }

        let nextStep = this._steps[index]; //first item after

        this._stepsIdx = index;
        this.doThisStep(nextStep);
    }

    _getNarrationIndex() {
        //update the narration index
        let narrationCount = 0;
        if (this._stepsIdx > 0) {
            const chartSteps = steps(this._chartIdentifier);
            if (chartSteps && chartSteps.length) {
                chartSteps.forEach((step, stepIndex) => {
                    if (stepIndex < this._stepsIdx) {
                        if (step.narrations && step.narrations.length) narrationCount += step.narrations.length;
                    }
                });
            }
        }
        return narrationCount;
    }

    doThisStep(step) {
        this._narrationIndex = this._getNarrationIndex();

        this.clearDelay();
        this.doAnimationStep(step, this.animationDone);
        if (featureValue("infoChartId")) {
            return;
        }

        if (Playback.tempNarrationIndex !== null) {
            const step = JSON.parse(JSON.stringify(this._steps[this._stepsIdx]));
            step.narrations = step.narrations.slice(Playback.tempNarrationIndex);
            this._narrationIndex += Playback.tempNarrationIndex;

            utterAllNarrationsOfStep(step, [], this, this.narrationDone, Cast.userInteracted);

            Playback.tempNarrationIndex = null;
        } else {
            utterAllNarrationsOfStep(step, this.stepsToFetchWhilePlaying(), this, this.narrationDone, Cast.userInteracted);
        }

        Cast.component.trayContainer.updateProgressBar(gStory.getNarrationsBeforeChartAsPercent(this._chartIdentifier, this._narrationIndex));
    }

    noStepsToDo() {
        if (isLastChart()) {
            setTimeout(() => {
                // hideInvite(); //Hide invite when going to next screen? commented
                setTimeout(() => {
                    // Disable wake lock at some point in the future.
                    // (does not need to be wrapped in any user input event handler)
                    noSleep.disable();
                }, 4000);
            }, 1000);
        } else {
            this.sunset();
        }
    }

    doAnimationStep(nextStep, animationDoneCallback) {
        let tl = gsap.timeline();
        this.animationSetAndInlineImage(tl);
        this.doHighlightAndInlineImage(tl, nextStep);
        tl.play().call(animationDoneCallback.bind(this));
    }

    doHighlightAndInlineImage(tl, nextStep) {
        if (nextStep) tl.add(this.doHighlight(nextStep.highlight));
        if (this._inlineImg !== "") {
            tl.add(
                gsap.to(this._inlineImgContainer, {
                    top: `${this.getTop(0) - this._inlineImageHeight - this._inlineImageHeightLowerMargin}px`,
                    autoAlpha: 1,
                    scale: 1,
                }),
                0.3
            );
        }
    }

    animationSetAndInlineImage(tl) {
        if (!this._animationSet) {
            tl.add(this.animationSet());

            this._inlineImgContainer = chartContainer(this._base64uuid4 + "-inlineImg", "inlineImg");
            this._mainContainerDiv.appendChild(this._inlineImgContainer);

            tl.add(
                gsap.set(this._inlineImgContainer, {
                    left: "0%",
                    top: 0,
                    autoAlpha: 0,
                    width: "100%",
                    zIndex: 2,
                    height: this._inlineImageHeight,
                    backgroundImage: `url(${encodeURI(this._inlineImg)})`,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    scale: 0.5,
                })
            );
        }
    }

    stepsToFetchWhilePlaying() {
        // return []
        // Disabling caching to solve ReadTimeoutError: Read timeout on endpoint URL: "https://polly.us-west-2.amazonaws.com/v1/speech"
        // utterAllNarrationsOfStep is not using this array anyway, because disabling MP3Cache
        if (typeof this._steps[this._stepsIdx] == "undefined" || typeof this._steps[this._stepsIdx].narrations == "undefined") {
            // console.log('MP3Cache - Do not send any narrations to fetch because no narrations will be played by utterAllNarrations.')
            return [];
        }
        let stepsToGet = gNarrationFetchLookahead;
        this.stepsSupposedToFetchWhilePlaying = [];
        while (stepsToGet > 0 && gNarrationFetchCurrChartIndex < Cast.megaSequence.length) {
            let stepsForCurrentChart = steps(Cast.megaSequence[gNarrationFetchCurrChartIndex]);
            let lookaheadSteps = stepsForCurrentChart.slice(gNarrationFetchCurrStepIndex, gNarrationFetchCurrStepIndex + stepsToGet);
            this.stepsSupposedToFetchWhilePlaying = this.stepsSupposedToFetchWhilePlaying.concat(lookaheadSteps);
            stepsToGet -= lookaheadSteps.length;
            if (gNarrationFetchCurrStepIndex + gNarrationFetchLookahead > stepsForCurrentChart.length) {
                gNarrationFetchCurrChartIndex += 1;
                gNarrationFetchCurrStepIndex = 0;
            } else {
                gNarrationFetchCurrStepIndex += lookaheadSteps.length;
            }
        }
        if (gNarrationFetchCurrChartIndex >= Cast.megaSequence.length) {
            // console.log('MP3Cache lookahead DONE')
        }
        // console.log(`MP3Cache supposed to get ${JSON.stringify(this.stepsSupposedToFetchWhilePlaying)}`);
        return this.stepsSupposedToFetchWhilePlaying;
    }

    transitionToChart(chartID, tlSunset) {
        racetrack("chart.transition.to.chart", {
            chartID: this._chartIdentifier,
            transition_to_chartIdentifier: chartID,
        });
        // console.log('transitioning to chart', chartID, 'sunsetting', tlSunset)
        tlSunset.play().call(() => {
            doChart(chartID);
        });
    }

    transitionToNextChart(forward, tlSunset) {
        racetrack("chart.transition.to.next", {
            chartID: this._chartIdentifier,
            forward: forward,
        });
        if (this._source !== null) {
            this.transitionToChart(this._source, tlSunset);
            return;
        }
        if (forward == 1) {
            if (isLastChart()) {
                // dont go to next chart when you are at the end.
                tlSunset.play().call(() => {
                    return doChart(this._chartIdentifier);
                });
                return;
            }
            tlSunset.play().call(doNextChart);
        } else if (forward == -1) {
            tlSunset.play().call(doPreviousChart);
        }
    }

    narrationDone(progressType) {
        // TODO: REMOVE EVENT AFTER LOAD TESTING
        // racetrack("chart.narration.done", {'chartID': this._chartIdentifier, 'progressType': progressType});
        // console.log("narrationDone ============== this: " + this + " type: " + progressType);
        if (progressType && progressType == "aNarrationDone") {
            Cast.component.trayContainer.updateProgressBar(gStory.getNarrationsBeforeChartAsPercent(this._chartIdentifier, ++this._narrationIndex));
        }

        if (progressType && progressType == "endAllNarrations") {
            // Disabling caching to solve ReadTimeoutError: Read timeout on endpoint URL: "https://polly.us-west-2.amazonaws.com/v1/speech"
            this.calibrateLookaheadWindow();
            this._boolNarrationDone = true;
            this.animationAndNarrationDone();
        }
    }

    calibrateLookaheadWindow() {
        const lookahead = 3;
        if (typeof this._steps[this._stepsIdx] == "undefined" || typeof this._steps[this._stepsIdx].narrations == "undefined") {
            // console.log('MP3Cache - Do not calibrate because no narrations were sent to utterAllNarrations.')
            return;
        }
        // console.log(`MP3Cache calibrateLookaheadWindow`)
        for (let stepToFetch of this.stepsSupposedToFetchWhilePlaying) {
            // console.log(`MP3Cache stepToFetch ${stepToFetch}`)
            if (stepToFetch && stepToFetch.narrations) {
                for (let narration of stepToFetch.narrations) {
                    // console.log(`MP3Cache  narration check ${narration}`)
                    if (
                        !(
                            castHashNarration(
                                narration,
                                PlayRateSetting.getBackendRate(Cast.locale.lang),
                                SampleRateSetting.getCurrent(),
                                Cast.locale.lang,
                                NarratorGenderSetting.getCurrent()
                            ) in gMp3Cache
                        )
                    ) {
                        // console.log(`MP3Cache unable to get  while saying ${JSON.stringify(this._steps[this._stepsIdx])}`)
                        gNarrationFetchLookahead--; //DECREMENT
                        gNarrationFetchLookahead = Math.max(gNarrationFetchLookahead, 1);
                        // console.log(`MP3Cache calibration reducing lookahead window to ${gNarrationFetchLookahead}`)
                        return;
                    }
                }
            }
        }
        if (gNarrationFetchCurrChartIndex >= Cast.megaSequence.length) return;
        gNarrationFetchLookahead++; // INCREMENT
        gNarrationFetchLookahead = Math.min(gNarrationFetchLookahead, lookahead);
    }

    animationDone() {
        // TODO: REMOVE EVENT AFTER LOAD TESTING
        // racetrack("chart.animation.done", {'chartID': this._chartIdentifier});
        if (Cast.userInteracted && !isLastChart()) {
            Playback.hasEnded = false;
            Cast.enablePlayPause();
            Cast.enableSkip();
        } else Cast.disableSkip();
        Cast.updateActions();
        this._boolAnimationDone = true;
        this.animationAndNarrationDone();
    }

    animationAndNarrationDone() {
        // TODO: REMOVE EVENT AFTER LOAD TESTING
        // racetrack("chart.animation.and.narration.done", {'chartID': this._chartIdentifier});

        if (this._boolAnimationDone && this._boolNarrationDone) {
            if (Cast.userInteracted) {
                let duration = Playback.delayStepNarration / PlayRateSetting.getNumberRate();

                if (this._stepsIdx >= this._steps.length - 1) {
                    duration = Playback.delaySlideNarration / PlayRateSetting.getNumberRate();
                } else {
                    const narrations = this._steps[this._stepsIdx] && this._steps[this._stepsIdx].narrations;
                    if (!delayLogic(narrations)) duration = Playback.delayStepNarrationShort / PlayRateSetting.getNumberRate();
                }
                // try {
                //     if (this._steps && this._steps[this._stepsIdx] && this._steps[this._stepsIdx].narrations && this._steps[this._stepsIdx].narrations[0])
                //         console.log("ZZZ", this._steps[this._stepsIdx].narrations[0], duration);
                // } catch (e) {
                //     debugger;
                // }
                const tl = gsap.timeline();
                tl.to({}, duration, {});
                tl.call(() => {
                    this.clearDelay();
                    this._gotoNextStep();
                });
                this.delayTL = tl;
            } else {
                this._gotoNextStep();
            }
        }
    }

    _gotoNextStep() {
        this._stepsIdx += 1;
        this._animationSet = true;
        this.doStep();
    }

    clearDelay() {
        if (this.delayTL) {
            this.delayTL.clear();
            this.delayTL.kill();
            this.delayTL = null;
        }
    }

    _setVideoBackground() {
        playBoxElement().querySelector(".videoBackgroundElement")?.remove();
        const suffix = !isDesktopMode() ? "Mobile" : "";
        const videoSource = sceneLevelStrVal(this._chartIdentifier, "bgVideo" + suffix, null);
        if (videoSource) {
            const videoElement = elementOfTypeAndClass("video", "videoBackgroundElement");
            videoElement.src = videoSource;
            videoElement.autoplay = true;
            videoElement.controls = false;
            videoElement.loop = true;
            videoElement.playsInline = true;
            videoElement.muted = true;

            const parent = playBoxElement();
            parent.prepend(videoElement);

            let objectFit = "cover";
            let objectPosition = "center center";
            const appearanceData = sceneLevelStrVal(this._chartIdentifier, "bgVideoAppearance" + suffix, "cover");
            if (appearanceData !== "cover") {
                const splitData = appearanceData.split(" ");
                objectFit = splitData[0];
                objectPosition = [splitData[1], splitData[2]].join(" ");
            }

            gsap.set(videoElement, { objectFit, objectPosition });
        }
    }
}

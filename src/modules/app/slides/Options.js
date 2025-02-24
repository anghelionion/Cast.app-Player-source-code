/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

/* eslint-disable */
import BaseChart from "./BaseChart";
import { utterAllNarrationsOfStep } from "../env/TTS";

export default class Options extends BaseChart {
    constructor(story, chartID, source = null) {
        super(story, chartID, source, "metric");

        this._segHt = 40;
        this._topPx = chartTop();
        this._titleHtPx = 32;
        this._marginIntraSegmentPx = 20;
        this._waitForUser = true;
        this.drilledDown = false;

        this._progressTL = null;

        Cast.newMegaSequence = []; //useful if TWO options present in chart
    }

    sunset(forward = 1, waitForUser = this._waitForUser, chartID = null) {
        if (waitForUser) {
            //set timer and if No response
            utterAllNarrationsOfStep(
                {
                    narrations: [Cast.locale.translatedContent["promptToSelectAnOptionText"]],
                },
                [],
                this,
                () => {
                    Playback.isOnDefaultOptionTimeout = true;
                    let defaultOptionIndices = this._segments.map((segment, index) => (segment.primary === true ? index : null)).filter((index) => index !== null);
                    //if (defaultOptionIndices.length === 0) defaultOptionIndices = [0];
                    if (Cast.userInteracted && (!Array.isArray(defaultOptionIndices) || defaultOptionIndices.length !== 1)) this._waitForClick = "perpetually";

                    //console.log("Wait for click", this._waitForClick);
                    if (this._waitForClick !== "perpetually") {
                        if (this._progressTL) {
                            this._progressTL.kill();
                            this._progressTL = null;
                        }
                        let timer = parseFloat(this._waitForClick) / 1000;
                        let defaultButton = null;
                        let progressBar = null;

                        if (defaultOptionIndices.length !== 0) {
                            defaultButton = this._ButtonDivs[defaultOptionIndices[0]];
                            progressBar = defaultButton.querySelector(".percent_bar");
                            gsap.set(defaultButton.querySelector(".options_button_progress_bar"), { autoAlpha: 1 });
                        }

                        const tl = gsap.timeline();
                        tl.to({}, timer, {
                            onComplete: () => {
                                if (!Playback.isOnDefaultOptionTimeout) return;
                                if (defaultButton) {
                                    gsap.set(defaultButton.querySelector(".options_check_icon"), { autoAlpha: 1 });
                                    gsap.set(defaultButton.querySelector(".options_button_progress_bar"), { autoAlpha: 0 });
                                }
                                const sequence = segmentSequenceArray(this._segments, defaultOptionIndices[0]);
                                if (sequence) {
                                    // If there are new subsequences from selecting an option, append them.
                                    // There are two versions of data from json, one where the new subsequence repeat the current option chart, and the one where it is not.
                                    // So, add the current option chart to new chart sequence and check for duplication if any.
                                    const oldChartSubsequence = Cast.megaSequence.slice(0, getCurrentChartIndex() + 1);
                                    Cast.newMegaSequence = Cast.megaSequence
                                        .slice(0, getCurrentChartIndex() + (sequence.length && oldChartSubsequence[oldChartSubsequence.length - 1] === sequence[0] ? 0 : 1))
                                        .concat(sequence.length ? sequence : ["autofeedback"]);
                                    // Sanitize the sequence by removing the chart with no steps.
                                    Cast.newMegaSequence = Cast.newMegaSequence.filter((chartID) => stepsOfStory(chartID, gStory.getUntranslatedStory()).length > 0);
                                    Cast.selectedOptionsIndexes[this._chartIdentifier] = defaultOptionIndices[0];
                                }
                                utterAllNarrationsOfStep(
                                    {
                                        narrations: [Cast.locale.translatedContent["promptToContinueWithDefaultOptionText"]],
                                    },
                                    [],
                                    this,
                                    () => {
                                        this.sunset(forward, false, chartID);
                                    },
                                    Cast.userInteracted
                                );
                                Playback.isOnDefaultOptionTimeout = false;

                                if (Cast.userInteracted) {
                                    const eventType = segmentLevelStrVal(this._segments, defaultOptionIndices[0], "eventType");
                                    const buttonLabel = segmentLevelStrVal(this._segments, defaultOptionIndices[0], "title");

                                    racetrack("click.option", {
                                        eventInformation: {
                                            type: "click.option",
                                            event_type: "click",
                                        },
                                        eventData: {
                                            object: {
                                                type: eventType,
                                                label: buttonLabel,
                                                userInteracted: false,
                                            },
                                            source: "option",
                                            chartID: this._chartIdentifier,
                                        },
                                    });
                                }
                            },
                            onUpdate: () => {
                                if (progressBar) {
                                    gsap.set(progressBar, {
                                        width: (tl.progress() * 100).toFixed(1) + "%",
                                    });
                                }
                            },
                            onUpdateParams: [tl],
                        });

                        this._progressTL = tl;
                    }
                },
                Cast.userInteracted
            );
            return;
        }

        // console.log('end scene')
        // if (waitForUser || (forward == 1 && chartID == null && Cast.megaSequence.length - 1 == getCurrentChartIndex())) {
        //   return;
        // } else {
        if (!this._mainContainerDiv) {
            return;
        }
        if (this._sunsetCalled) {
            return;
        }
        this._sunsetCalled = true;

        //IMAGE IMAGE
        // let tlSunset = gsap.timeline()
        // this.transition(chartID, tlSunset, forward);
        this.unsetSceneTheme(chartID, forward);
    }

    accept(buttonIndex) {
        Playback.isOnDefaultOptionTimeout = false;

        const sequence = segmentSequenceArray(this._segments, buttonIndex);

        const weburl = segmentLevelStrVal(this._segments, buttonIndex, "weburl");

        const webhook = segmentLevelStrVal(this._segments, buttonIndex, "webhook");
        const payload = segmentLevelStrVal(this._segments, buttonIndex, "payload");

        const buttonID = this._base64uuid4 + this._dashSeg + buttonIndex + "-bar";
        const chartID = this.chartId;

        const acceptText = segmentLevelStrVal(this._segments, buttonIndex, "acceptText");
        const eventType = segmentLevelStrVal(this._segments, buttonIndex, "eventType");
        const buttonLabel = segmentLevelStrVal(this._segments, buttonIndex, "title");

        if (sequence) {
            // If there are new subsequences from selecting an option, append them.
            // There are two versions of data from json, one where the new subsequence repeat the current option chart, and the one where it is not.
            // So, add the current option chart to new chart sequence and check for duplication if any.
            const oldChartSubsequence = Cast.megaSequence.slice(0, getCurrentChartIndex() + 1);
            Cast.newMegaSequence = Cast.megaSequence
                .slice(0, getCurrentChartIndex() + (sequence.length && oldChartSubsequence[oldChartSubsequence.length - 1] === sequence[0] ? 0 : 1))
                .concat(sequence.length ? sequence : ["autofeedback"]);
            // Sanitize the sequence by removing the chart with no steps.
            Cast.newMegaSequence = Cast.newMegaSequence.filter((chartID) => stepsOfStory(chartID, gStory.getUntranslatedStory()).length > 0);

            Cast.selectedOptionsIndexes[this._chartIdentifier] = buttonIndex;
        }

        this._waitForUser = true;
        racetrack("click.option", {
            eventInformation: {
                type: "click.option",
                event_type: "click",
            },
            eventData: {
                object: {
                    type: eventType,
                    label: buttonLabel,
                },
                source: "option",
                chartID,
            },
        });

        if (document.getElementById(buttonID)) {
            //this.changeButton(buttonID, document.getElementById(buttonID).innerHTML + " ✓");
            gsap.set(document.getElementById(buttonID).querySelector(".options_check_icon"), { autoAlpha: 1 });
            gsap.set(document.getElementById(buttonID).querySelector(".options_button_progress_bar"), { autoAlpha: 0 });
        }
        weburl && weburl.length > 0 && callWeburl(weburl);
        webhook && webhook.length > 0 && callWebhook(webhook, payload);

        if (Playback.isPaused) {
            controlPlay();
        }
        utterAllNarrationsOfStep({ narrations: [acceptText] }, [], this, this.acceptSunset, Cast.userInteracted);
    }
    acceptSunset() {
        this._waitForUser = false;
        // drill down already sunsets :)
        if (!this.drilledDown) {
            this.sunset(1, this._waitForUser);
        }
    }

    getTop(index) {
        return this._topPx + this._inlineImageHeight + this._inlineImageHeightLowerMargin + index * (Math.max(this._segHt, this._titleHtPx) + this._marginIntraSegmentPx);
    }

    animationSetAndInlineImage(tl) {
        if (!this._animationSet) {
            tl.add(this.animationSet());

            this._inlineImgContainer = chartContainer(this._base64uuid4 + "-inlineImg", "inlineImg");
            this._optionsInlineImageContainer.appendChild(this._inlineImgContainer);

            gsap.set(
                this._inlineImgContainer,
                {
                    left: "0%",
                    top: 0,
                    autoAlpha: 0,
                    width: "100%",
                    zIndex: 2,

                    backgroundImage: `url(${encodeURI(this._inlineImg)})`,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    position: "static",
                },
                0
            );

            if (this._segments.length < 9) {
                gsap.set(this._inlineImgContainer, {
                    height: this._inlineImageHeight,
                });
            }
        }
    }

    animationSet() {
        this._mainContainerDiv = chartContainer(this._base64uuid4, "optionsContainer responsiveHeight");
        this._ButtonDivs = [];
        this.calcBarHeight();
        let chartTitle = chartContainer(this._base64uuid4 + "-chartTitle", "chartTitle");
        this._mainContainerDiv.appendChild(chartTitle);
        let tlInit = gsap.timeline();
        this.setupSceneTheme(tlInit);
        this._waitForClick = Cast.userInteracted ? sceneLevelStrVal(this._chartIdentifier, "waitForClick", "5000") : "1000";
        tlInit.set(chartTitle, {
            autoAlpha: 1,
            //TODO @jo TO DISCUSS not used: top: `${chartTitleTop()}px`,
            text: chartHeadingTitle(gStory, this._chartIdentifier, "Approve"),
            color: this._imageTextColor,
            zIndex: 2,
        });

        this._optionsInlineImageContainer = elementOfTypeAndClass("div", "options_inline_image_container");
        this._mainContainerDiv.appendChild(this._optionsInlineImageContainer);

        const options_buttons_container = elementOfTypeAndClass("div", "options_buttons_container");
        this._mainContainerDiv.appendChild(options_buttons_container);
        if (this._inlineImg && this._segments.length > 8) {
            options_buttons_container.classList.add("small");
            this._mainContainerDiv.classList.add("small");
        }

        this._narrationBox = setupNarrationBox();
        const defaultButtonColor = sceneLevelStrVal(this._chartIdentifier, "buttonColor", castColor(0));
        const defaultButtonTextColor = colorWithHigherContrast(defaultButtonColor, "#ffffff", "#393531");
        const nonPrimaryButtonColor = sceneLevelStrVal(this._chartIdentifier, "nonPrimaryButtonColor", "white");
        const nonPrimaryButtonTextColor = nonPrimaryButtonColor === "transparent" ? this._imageTextColor : colorWithHigherContrast(nonPrimaryButtonColor, "#393531", "#f9f5f1");

        //scan primary
        let primaryMode = false;
        for (let index = 0; index < this._segments.length; index++) {
            primaryMode = primaryMode || segmentLevelBool(this._segments, index, "primary", false);
            if (primaryMode) break;
        }
        //real stuff
        for (let index = 0; index < this._segments.length; index++) {
            //TODO: @jo this may need to be looked into with new implementation. TO DISCUSS getTop() not used

            let buttonColor = defaultButtonColor;
            let buttonTextColor = defaultButtonTextColor;
            const buttonLabel = segmentLevelStrVal(this._segments, index, "title");
            let buttonIconType = segmentLevelStrVal(this._segments, index, "iconType", "default");
            if (buttonIconType === "default") {
                buttonIconType = this._getIconTypeHack(buttonLabel);
            }
            const buttonIconTypeSVG = this._getIconTypeSVG(buttonIconType, index);

            const buttonDiv = chartContainer(this._base64uuid4 + this._dashSeg + index + "-bar", "options_button", this, this.accept, index);
            buttonDiv.innerHTML = `${buttonIconTypeSVG}
                                    <span>Option</span>
                                    <div class="options_check_icon">
                                       ${SVG.checkMarkIcon()}
                                    </div>
                                    <div class="options_button_progress_bar" value="32" max="100">
                                        <div class="percent_bar"></div>
                                    </div>`;
            buttonDiv.querySelector("span").innerHTML = buttonLabel;

            options_buttons_container.appendChild(buttonDiv);
            this._ButtonDivs.push(buttonDiv);
            let primary = segmentLevelBool(this._segments, index, "primary", false);

            if (primaryMode && !primary) {
                buttonColor = nonPrimaryButtonColor;
                buttonTextColor = nonPrimaryButtonTextColor;
            }

            const progressBarBackgroundColor = hexWithOpacity(buttonTextColor, 0.5);

            if (isPrecursive()) {
                //certified hack --- Do not change colors
            } else {
                gsap.set(buttonDiv.querySelectorAll("svg path"), { attr: { fill: buttonTextColor } });
            }
            gsap.set(buttonDiv.querySelectorAll("svg circle"), { attr: { fill: buttonTextColor } });
            gsap.set(buttonDiv.querySelectorAll("svg text"), { attr: { fill: buttonColor } });
            gsap.set(buttonDiv.querySelectorAll(".options_check_icon svg path"), { attr: { fill: buttonTextColor } });
            gsap.set(buttonDiv.querySelector(".options_check_icon"), { autoAlpha: 0 });
            gsap.set(buttonDiv.querySelector(".options_button_progress_bar"), { autoAlpha: 0, backgroundColor: progressBarBackgroundColor });
            gsap.set(buttonDiv.querySelector(".percent_bar"), { width: "0%", backgroundColor: buttonTextColor });
            gsap.set(buttonDiv, {
                color: buttonTextColor,
                backgroundColor: buttonColor,
            });
            gsap.set(buttonDiv, { boxShadow: `0 2px 6px ${hexWithOpacity(buttonTextColor, 0.3)}` });

            buttonDiv.addEventListener("mouseenter", () => {
                gsap.set(buttonDiv, { boxShadow: `0 2px 6px ${hexWithOpacity(buttonTextColor, 0.6)}` });
            });
            buttonDiv.addEventListener("mouseleave", () => {
                gsap.set(buttonDiv, { boxShadow: `0 2px 6px ${hexWithOpacity(buttonTextColor, 0.3)}` });
            });
        }

        return tlInit;
    }

    doHighlight(highlights) {
        highlights = checkInfographics(highlights);
        const tlSegment = gsap.timeline();

        for (let index = 0; index < this._segments.length; index++) {
            if (Array.isArray(highlights) && highlights.length === 0) highlights = null;
            const hilite = highlights && highlights.includes(index);

            tlSegment.to(
                this._ButtonDivs[index],
                { autoAlpha: 1, scale: hilite ? 1 : 0.875, borderWidth: hilite ? 4 : 0, borderColor: hexWithOpacity(this._imageTextColor, 0.5), borderStyle: "solid" },
                this.stagger(index)
            );
        }

        //TODO: @jo this may need to be looked into with new implementation. getTop was segment index dependant. TO DISCUSS
        addNarrationTween(tlSegment, this._narrationBox);

        return gsap.timeline().add(tlSegment);
    }

    calcBarHeight() {
        //TODO: @jo this may need to be looked into with new implementation. TO DISCUSS
        if (this._segments.length <= 6) {
            this._topPx = 20 + chartTop();
        }

        if (this._segments.length <= 2) {
            this._segHt = 70;
        } else if (this._segments.length <= 6) {
            this._segHt = 60;
        } else if (this._segments.length <= 8) {
            this._segHt = 36;
            this._marginIntraSegmentPx = 8;
        } else {
            this._segHt = 32;
            this._marginIntraSegmentPx = 6;
        }
    }

    _getIconTypeSVG(type, index = -1) {
        if (type === "numeric") {
            return SVG.optionsNumericIconType(index + 1);
        }

        switch (type) {
            case "very-satisfied":
                return !isPrecursive() ? SVG.optionsVerySatisfiedIconType() : SVG.optionsIconTypeCsatShinny();
            case "satisfied":
                return !isPrecursive() ? SVG.optionsSatisfiedIconType() : SVG.optionsIconTypeCsatHappy();
            case "neutral":
                return !isPrecursive() ? SVG.optionsNeutralIconType() : SVG.optionsIconTypeCsatMeh();
            case "unsatisfied":
                return !isPrecursive() ? SVG.optionsUnsatisfiedIconType() : SVG.optionsIconTypeCsatImplode();
            case "very-unsatisfied":
                return !isPrecursive() ? SVG.optionsVeryUnsatisfiedIconType() : SVG.optionsIconTypeCsatDead();
            case "read":
                return SVG.optionsReadIconType();
            case "bag":
                return SVG.optionsBagIconType();
            case "homepage":
                return SVG.optionsHomepageIconType();
            case "clock":
                return SVG.optionsClockIconType();
            case "globe":
                return SVG.optionsGlobeIconType();
            case "external":
                return SVG.optionsExternalIconType();
            case "puzzle":
                return SVG.optionsPuzzleIconType();
            case "db":
                return SVG.optionsDbIconType();
            case "thumbsup":
                return SVG.optionsThumbsupIconType();
            case "thumbsdown":
                return SVG.optionsThumbsdownIconType();
            case "calendar":
                return SVG.optionsCalendarIconType();
            case "check":
                return SVG.optionsCheckIconType();
            case "clipboard-check":
                return SVG.optionsClipboardCheckIconType();
            case "clipboard-list":
                return SVG.optionsClipboardListIconType();
            case "rocket":
                return SVG.optionsRocketIconType();
            case "bell":
                return SVG.optionsBellIconType();
            case "all":
                return SVG.optionsAllIconType();
            case "bulb":
                return SVG.optionsBulbIconType();
            case "advocate":
                return SVG.optionsAdvocateIconType();
            default:
                return SVG.optionsDefaultIconType();
        }
    }

    _getIconTypeHack(title) {
        switch (title.toLowerCase()) {
            case "satisfied":
                return "satisfied";
                break;
            case "unsatisfied":
                return "unsatisfied";
                break;
            case "very satisfied":
                return "very-satisfied";
                break;
            case "very unsatisfied":
                return "very-unsatisfied";
                break;
            case "neutral":
                return "neutral";
                break;
            default:
                return "default";
                break;
        }
    }
}

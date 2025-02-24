/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

/* eslint-disable */
import BaseChart from "./BaseChart";

export default class ChartPoll extends BaseChart {
    constructor(story, chartID, source = null) {
        super(story, chartID, source, "metric");

        this._segHt = 32;
        this._topPx = chartTop();
        this._titleHtPx = 32;
        this._marginIntraSegmentPx = 16;
        this.confirmed = {};
        this._waitForUser = true;
        this.drilledDown = false;
    }

    sunset(forward = 1, waitForUser = this._waitForUser, chartID = null) {
        // console.log('end scene')
        if (waitForUser || (forward == 1 && chartID == null && isLastChart())) {
            return;
        } else {
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
        return;
    }

    changeButton(buttonId, newText) {
        if (document.getElementById(buttonId)) document.getElementById(buttonId).innerHTML = newText;
        return;
    }

    accept(buttonIndex) {
        let buttonID = this._base64uuid4 + this._dashSeg + buttonIndex + "-bar";
        let buttonLabel = segmentLevelStrVal(this._segments, buttonIndex, "link_title");
        let acceptText = segmentLevelStrVal(this._segments, buttonIndex, "acceptText");
        let destination = segmentLevelStrVal(this._segments, buttonIndex, "link_url");
        let link_type = segmentLevelStrVal(this._segments, buttonIndex, "link_type");
        let postData = segmentLevelStrVal(this._segments, buttonIndex, "post_data");
        let eventType = segmentLevelStrVal(this._segments, buttonIndex, "eventType");

        this._waitForUser = true;
        racetrack("click.action", {
            eventInformation: {
                type: "click.action",
                event_type: "click",
            },
            eventData: {
                object: {
                    type: eventType,
                    label: buttonLabel,
                },
                source: "option",
            },
        });
        acceptText = [`${acceptText}`];
        this.buttonAction(link_type, destination, postData);
        if (document.getElementById(buttonID) && !document.getElementById(buttonID).innerHTML.includes("✓")) {
            this.changeButton(buttonID, document.getElementById(buttonID).innerHTML + "&nbsp;&nbsp;✓");
        }
    }

    buttonAction(link_type, destination, postData) {
        switch (link_type) {
            case "replay":
                skipToChart(-1, Cast.megaSequence[0]);
                break;
            case "phone":
                window.open(destination, "_self");
                break;
            case "drillDown":
                this.drilledDown = true;
                let tlSunset = gsap.timeline();
                tlSunset.set(this._mainContainerDiv, {
                    top: "-50%",
                    autoAlpha: 0,
                });
                tlSunset.play().call(() => {
                    doChart(destination, this._chartIdentifier);
                });
                break;
            case "webhook":
                if (destination != "" && destination !== undefined && !useFeature("ro")) {
                    callWebhook(destination, postData);
                }
                break;
            default:
                if (typeof destination === "object") {
                    if (Platform.is_Android && destination.android) {
                        window.open(destination.android, "_blank");
                        return;
                    }
                    if (Platform.is_iOS && destination.ios) {
                        window.open(destination.ios, "_blank");
                        return;
                    }
                    window.open(destination.url, "_blank");
                    return;
                }
                window.open(destination, "_blank");
                return;
        }
    }

    acceptSunset() {
        this._waitForUser = false;
        // drill down already sunsets :)
        if (!this.drilledDown) {
            this.sunset(1, true);
        }
    }

    getTop(index) {
        return this._topPx + this._inlineImageHeight + this._inlineImageHeightLowerMargin + index * (Math.max(this._segHt, this._titleHtPx) + this._marginIntraSegmentPx);
    }

    animationSet() {
        this._clickedPoll = false;
        this._mainContainerDiv = chartContainer(this._base64uuid4, "pollContainer baseContainer responsiveHeight");
        this._ButtonDivs = [];

        this.calcBarHeight();

        let chartTitle = chartContainer(this._base64uuid4 + "-chartTitle", "chartTitle");
        this._mainContainerDiv.appendChild(chartTitle);

        let tlInit = gsap.timeline();
        this.setupSceneTheme(tlInit);

        tlInit.set(chartTitle, {
            left: "0%",
            top: `${chartTitleTop() + this._chartTitleExtra}px`,
            autoAlpha: 1,
            width: "100%",
            text: chartHeadingTitle(gStory, this._chartIdentifier, "Approve"),
            color: this._imageTextColor,
            zIndex: 2,
        });

        this._narrationBox = setupNarrationBox();
        if (actionListPresent(gStory.getUntranslatedStory())) {
            return tlInit;
        }
        // let buttonColorMode = sceneLevelStrVal(this._chartIdentifier, "buttonColorMode", "");
        let buttonColor = sceneLevelStrVal(this._chartIdentifier, "buttonColor", castColor(0));
        let buttonTextColor = colorWithHigherContrast(buttonColor, "#ffffff", "#393531");

        for (var index = 0; index < this._segments.length; index++) {
            let ButtonDiv = chartContainer(this._base64uuid4 + this._dashSeg + index + "-bar", "segmentBar", this, this.accept, index);

            this._mainContainerDiv.appendChild(ButtonDiv);

            this._ButtonDivs.push(ButtonDiv);

            //segment
            tlInit.set(
                ButtonDiv,
                {
                    text: SVG.defaultActionSvg("white") + segmentLevelStrVal(this._segments, index, "link_title"),
                    top: startingTop() + "px",
                    autoAlpha: 0,
                    height: this._segHt + "px",
                    lineHeight: this._segHt + "px",
                    paddingTop: 0,
                    paddingBottom: 0,
                    zIndex: index,
                    color: buttonTextColor, //,playBoxRoStyle().backgroundColor,
                    backgroundColor: buttonColor,
                },
                0
            );
        }
        return tlInit;
    }

    doHighlight(highlights) {
        highlights = checkInfographics(highlights);
        let tlSegment = gsap.timeline();

        if (!actionListPresent(gStory.getUntranslatedStory())) {
            for (let index = 0; index < this._segments.length; index++) {
                if (Array.isArray(highlights) && highlights.length === 0) highlights = null;
                const hilite = !highlights || highlights.includes(index);

                // const elementHighlight = highlights && highlights.includes(index);

                const topTitle = this.getTop(index);

                tlSegment.to(
                    this._ButtonDivs[index],
                    {
                        top: `${topTitle}px`,
                        autoAlpha: 1,
                        // autoAlpha: hilite ? 1 : dimGraphicsOpacity(),
                        // filter: graphicsHighlightFilter(hilite),
                        filter: graphicsHighlightFilter(true),
                        transform: "translateZ(0)",
                        // boxShadow: (elementHighlight ? "0px 0px 8px #acacac" : "0px 0px 0px transparent"),
                        scale: hilite ? 1 : 0.91,
                    },
                    this.stagger(index)
                );
            }
        }

        addNarrationTween(tlSegment, this._narrationBox);

        return gsap.timeline().add(tlSegment);
    }

    calcBarHeight() {
        if (this._segments.length <= 9) {
            this._topPx = 20 + chartTop();
            this._chartTitleExtra = 10;
        } else {
            this._chartTitleExtra = 0;
        }

        if (this._segments.length <= 2) {
            this._segHt = 60;
        } else if (this._segments.length <= 4) {
            this._segHt = 40;
        } else if (this._segments.length <= 8) {
            this._segHt = 36;
            this._marginIntraSegmentPx = 8;
        } else {
            this._segHt = 32;
            this._marginIntraSegmentPx = 6;
        }
    }
}

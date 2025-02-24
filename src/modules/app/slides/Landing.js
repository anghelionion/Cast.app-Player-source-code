/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

/* eslint-disable */
import BaseChart from "./BaseChart";

export default class Landing extends BaseChart {
    //
    //  Editorial OR Single PANE METRIC
    //
    //
    constructor(story, chartID, source = null) {
        if (!story) throw new ErrorEvent("Invalid story");
        super(story, chartID, source, "landing");

        this._landingSegmentHeight = 56;
        this._borderRadius = 10;
        this._topPx = chartTop();
        this._titleHeadingMargin = 0;
        this._titleHtPx = this._subtitleHtPx = 70;
        this._currentTopHighlightAdd = 0;
        this._panelMargin = 40;
        this._panelTopPadding = 60;
        this._panelBottomPadding = 60;
    }

    sunset(forward = 1, waitForUser = false, chartID = null) {
        if (!this._mainContainerDiv) return;
        if (this._sunsetCalled) {
            return;
        }
        this._sunsetCalled = true;

        this.unsetSceneTheme(chartID, forward, true);

        return;
    }

    landingBack(prefix, index, suffix) {
        return prefix + index + suffix;
    }

    animationSet() {
        this._mainContainerDiv = chartContainer(this._base64uuid4, "landingContainer baseContainer responsiveHeight");
        this._landingSegmentDivs = [];
        this._landingSegmentPanels = [];
        this._landingSegmentBrushes = [];
        this._landingsegTitleDivs = [];

        let tlInit = gsap.timeline();
        this.setupSceneTheme(tlInit, this._mode === "editorial");

        let chartTitle = chartContainer(this._base64uuid4 + "-chartTitle", "chartTitle");
        this._mainContainerDiv.appendChild(chartTitle);

        let titleOrReport;
        let title = chartHeadingTitle(gStory, this._chartIdentifier, "reservedReportName");
        if (title == "reservedEmpty") {
            titleOrReport = "&nbsp;";
        } else if (title == "reservedReportName") {
            titleOrReport = storyAndProductName(this._story);
        } else {
            titleOrReport = title;
        }

        if (titleOrReport === "Welcome {{contact_account}}") titleOrReport = "Welcome " + liquidContextContactAccount();

        tlInit.set(chartTitle, {
            left: "0%",
            top: `${chartTitleTop()}px`,
            autoAlpha: 1,
            width: "100%",
            text: titleOrReport,
            color: this._imageTextColor,
            zIndex: 2,
        });

        this._narrationBox = setupNarrationBox();
        addClasses(this._narrationBox, "specialCaseNarrationBox");

        if (this._segments.length === 0 || this._mode === "editorial") {
            const theme = getThemeName();

            let backgroundColor = "#393531";
            let color = "white";

            if (theme !== "dark") {
                backgroundColor = "white";
                color = "#393531";
            }
        }
        for (let index = 0; index < Math.min(1, this._segments.length); index++) {
            let segmentPanel = chartContainer(this._base64uuid4 + this._dashSeg + index + "-landingPanel", "segmentPanel");
            let segmentBrush = chartContainer(this.landingBack(this._base64uuid4 + this._dashSeg, index, "-landingBack"), "segmentBrush");
            let segTitle = chartContainer(this._base64uuid4 + this._dashSeg + index + "-title", "segTitle");

            this._mainContainerDiv.appendChild(segmentPanel);
            this._mainContainerDiv.appendChild(segmentBrush);
            this._mainContainerDiv.appendChild(segTitle);

            this._landingSegmentPanels.push(segmentPanel);
            this._landingSegmentBrushes.push(segmentBrush);
            this._landingsegTitleDivs.push(segTitle);

            const panelHeight = this._panelTopPadding + Math.max(this._titleHtPx, this._subtitleHtPx) + this._landingSegmentHeight + this._panelBottomPadding;

            if (this._mode !== "editorial") {
                // "" or "panel-editorial"  or legacy "landing_v2"
                //segment panel
                tlInit.set(segmentPanel, {
                    top: this.getTop(0),
                    autoAlpha: 1,
                    left: `calc (50% - ${customCssVariable("--cast-metrics-panel-width")}/2)`,
                    width: customCssVariable("--cast-metrics-panel-width"),
                    // backgroundColor: hexWithOpacity(contrastSafeReciprocalColor(this._imageTextColor, "#393531", "#ffffff"), 0.5), // auto select panel color from text color
                    backgroundColor: hexWithOpacity(castColor(0), 0.5), // auto select panel color from text color
                    backdropFilter: "blur(5px)",
                    borderRadius: 2 * this._borderRadius,
                    zIndex: 2 * index - 1,
                    scale: 0.8,
                    height: `${panelHeight}px`,
                    objectFit: "contain",
                    clipPath:
                        "path('M41.9688 11.2019C41.9363 10.883 41.9196 10.5596 41.9196 10.2324C41.9196 4.84636 46.4295 0.480133 51.9927 0.480133H348.379C353.943 0.480133 358.452 4.84636 358.452 10.2324C358.452 10.2764 358.452 10.3204 358.451 10.3643C358.525 27.3961 372.809 41.181 390.418 41.181V41.1871C395.981 41.1872 400.491 45.5534 400.491 50.9393V196.021C400.491 201.407 395.981 205.773 390.418 205.773V205.779C372.763 205.779 358.451 219.635 358.451 236.728L358.308 236.728C358.308 242.114 353.798 246.48 348.235 246.48H51.9927C46.4295 246.48 41.9196 242.114 41.9196 236.728C41.9196 236.401 41.9363 236.077 41.9688 235.758C41.4398 219.115 27.3372 205.779 10.0175 205.779V205.759C4.708 205.484 0.490723 201.229 0.490723 196.021V50.9393C0.490723 45.7309 4.708 41.476 10.0175 41.2012V41.181C27.3372 41.181 41.4398 27.8458 41.9688 11.2019Z')",
                });
                const panelTextColor = colorWithHigherContrast(castColor(0), "#ffffff", "#393531");
                //segment Title
                tlInit.set(segTitle, {
                    color: panelTextColor,
                    left: `calc (50% - ${customCssVariable("--cast-metrics-panel-width")}/2)`,
                    width: customCssVariable("--cast-metrics-panel-width"),
                    top: `${this.getTop(0) + this._panelTopPadding}px`,
                    autoAlpha: 0,
                    zIndex: 2 * index,
                });

                //segmentBrush === Metric
                tlInit.set(segmentBrush, {
                    top: `${this.getTop(0) + this._titleHtPx + this._panelTopPadding}px`,
                    autoAlpha: 0,
                    borderRadius: this._borderRadius,
                    color: panelTextColor,
                    zIndex: 2 * index,
                    fontWeight: "normal",
                    left: "5%",
                    width: "90%",
                    textAlign: "center",
                    height: this._landingSegmentHeight + this._currentTopHighlightAdd,
                    lineHeight: this._landingSegmentHeight + this._currentTopHighlightAdd + "px",
                });
            }
        }

        this._highestHilightedIndex = 0;
        return tlInit;
    }

    getTop(index) {
        return (
            this._topPx +
            this._inlineImageHeight +
            this._inlineImageHeightLowerMargin +
            this._titleHeadingMargin +
            this._panelMargin +
            index * (this._panelTopPadding + Math.max(this._titleHtPx, this._subtitleHtPx) + this._landingSegmentHeight + this._panelBottomPadding)
        );
    }

    //show segment opened. segTitle and segSubtitle are shown
    doHighlight(highlights) {
        highlights = checkInfographics(highlights);
        let tlSegment = gsap.timeline();
        let tlSubtitle = gsap.timeline();

        if (Array.isArray(highlights) && highlights.length === 0) highlights = null;
        if (highlights) highlights = highlights.slice(0, 1); //ignore highights other than first
        if (!highlights) highlights = [0]; // if expanded state set highlights array assume first

        let indexToReadFromJson = highlights[0];
        if (indexToReadFromJson > this._segments.length) indexToReadFromJson = 0;
        if (indexToReadFromJson < 0) indexToReadFromJson = 0;

        for (let index = 0; index < Math.min(1, this._segments.length); index++) {
            if (this._mode !== "editorial") {
                //SegmentPanel
                tlSegment.add(
                    gsap.to(this._landingSegmentPanels[index], {
                        autoAlpha: 1,
                        scale: 1,
                        top: this.getTop(0),
                    }),
                    0
                );

                let textVal = segmentLevelStrVal(this._segments, indexToReadFromJson, "title");
                if (textVal) textVal = textToDisplaySymbols(textVal);
                let footer = segmentLevelStrVal(this._segments, indexToReadFromJson, "footer");
                if (footer) footer = textToDisplaySymbols(footer);
                footer = textToDisplaySymbols(footer);

                tlSubtitle.set(
                    this._landingsegTitleDivs[index],
                    {
                        autoAlpha: 0,
                        text: textVal + (footer.length > 0 ? " - " : "") + footer,
                    },
                    0
                );
                tlSubtitle.to(
                    this._landingsegTitleDivs[index],
                    {
                        autoAlpha: 1,
                        filter: textHighlightFilter(true),
                        transform: "translateZ(0)",
                    },
                    0
                );

                //SegmentBrush === Metric
                const decimalPlaces = parseInt(segmentLevelStrVal(this._segments, indexToReadFromJson, "decimals", "0"));
                let metricVal = segmentFloatVal(this._segments, indexToReadFromJson);
                metricVal = Cast.locale.zeroConvert(metricVal, gStory._language, decimalPlaces);

                let text = metricVal;
                if (!isNaN(metricVal)) {
                    const prefix = segmentLevelStrVal(this._segments, indexToReadFromJson, "prefix");
                    const suffix = segmentLevelStrVal(this._segments, indexToReadFromJson, "suffix");
                    const textValue = prefix + formatted(Math.abs(metricVal), decimalPlaces, true) + suffix;
                    text = (parseFloat(metricVal) < 0 ? "-" : "") + textValue;
                }
                const fontSize = text.length > 10 ? 24 : 50;

                tlSegment.to(this._landingSegmentBrushes[index], { text, autoAlpha: 1, fontSize }, 0);
            }
        }

        addNarrationTween(tlSegment, this._narrationBox);

        return gsap.timeline().add([tlSegment, tlSubtitle]);
    }
}

/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

/* eslint-disable */
import BaseChart from "./BaseChart";

export default class ChartPieBar extends BaseChart {
    constructor(story, chartID, source = null) {
        if (!story) throw new ErrorEvent("Invalid story");
        super(story, chartID, source, "pieBar");

        this._originalSegHt = 10;
        this._segHt = this._originalSegHt;
        this._topPx = chartTop();
        this._titleHtPx = 20;
        this._subtitleHtPx = 20;
        this._marginIntraSegmentPx = 13;
        this._borderRadius = 5;
        this._segmentMargin = 0;
        this._titleSubtitlefontSize = "14px";
        this._gapBetweensegmentAndBackground = 0;
    }

    sunset(forward = 1, waitForUser = false, chartID = null) {
        if (!this._mainContainerDiv) return;
        if (this._sunsetCalled) {
            return;
        }
        this._sunsetCalled = true;
        //IMAGE IMAGE
        // let tlSunset = gsap.timeline()
        // this.transition(chartID, tlSunset, forward);
        this.unsetSceneTheme(chartID, forward);
        return;
    }

    animationSet() {
        this._mainContainerDiv = chartContainer(this._base64uuid4, "pieBarContainer baseContainer responsiveHeight");
        this._segmentDivs = [];
        this._segmentBackgrounds = [];
        this._segTitleDivs = [];
        this._segSubtitleDivs = [];
        this._highlightMarker = [];

        this._totalOfSegments = 0;
        for (let index = 0; index < this._segments.length; index++) {
            this._totalOfSegments += segmentFloatVal(this._segments, index);
        }
        this.calcBarHeight();

        let chartTitle = chartContainer(this._base64uuid4 + "-chartTitle", "chartTitle");
        this._mainContainerDiv.appendChild(chartTitle);

        let tlInit = gsap.timeline();
        this.setupSceneTheme(tlInit);

        tlInit.set(chartTitle, {
            left: "0%",
            top: `${chartTitleTop()}px`,
            autoAlpha: 1,
            width: "100%",
            text: chartHeadingTitle(gStory, this._chartIdentifier, "Categorization"),
            color: this._imageTextColor,
            zIndex: 2,
        });

        this._narrationBox = setupNarrationBox();

        for (let index = 0; index < this._segments.length; index++) {
            let segmentDiv = chartContainer(this._base64uuid4 + this._dashSeg + index + "-bar", "segmentBar");
            let segmentBackground = chartContainer(this._base64uuid4 + this._dashSeg + index + "-barBack", "segmentBarBackground");
            let segTitle = chartContainer(this._base64uuid4 + this._dashSeg + index + "-title", "segTitle");
            let segSubtitle = chartContainer(this._base64uuid4 + this._dashSeg + index + "-footer", "segSubtitle");

            this._mainContainerDiv.appendChild(segmentDiv);
            this._mainContainerDiv.appendChild(segmentBackground);
            this._mainContainerDiv.appendChild(segTitle);
            this._mainContainerDiv.appendChild(segSubtitle);

            this._segmentDivs.push(segmentDiv);
            this._segmentBackgrounds.push(segmentBackground);
            this._segTitleDivs.push(segTitle);
            this._segSubtitleDivs.push(segSubtitle);

            let highlightMarker = chartContainer(this._base64uuid4 + this._dashSeg + index + "-highlightmarker", "segmentBar");
            this._mainContainerDiv.appendChild(highlightMarker);
            this._highlightMarker.push(highlightMarker);
            tlInit.set(
                highlightMarker,
                {
                    backgroundColor: castColor(index),
                    left: highlightMarkerLeft(),
                    top: this.getTop(index) + this.titleHeight(),
                    autoAlpha: 0,
                    zIndex: 2 * index,
                    width: highlightMarkerWidth(),
                    height: this._getHeight() - this.titleHeight(),
                    borderRadius: highlightMarkerBorderRadius(),
                    borderWidth: "0px",
                },
                0
            );

            const suffix = segmentLevelStrVal(this._segments, index, "valueSuffix");

            //segment Title
            let percent = (100 * segmentFloatVal(this._segments, index)) / this._totalOfSegments;
            let percentText = "";
            if (suffix !== "%") {
                percentText = formatted(percent, 0);
                if (percent < 1) percentText = "<1";
                percentText = percentText + "%";
                percentText = `<span style=font-size:85%;color:${castColor(index)}>${percentText}</span>`;
            }
            const pie = `<span style="display:flex; margin: 1px 3px">${pieMaker(percent / 100, castColor(index))}</span>`;
            tlInit.set(
                segTitle,
                {
                    color: this._imageTextColor,
                    left: "0%",
                    top: this.getTop(index),
                    autoAlpha: 1,
                    text: getIndicator(index) + segmentLevelStrVal(this._segments, index, "title"),
                    zIndex: 2 * index,
                    height: this._titleHtPx + "px",
                    lineHeight: this._titleHtPx + "px",
                    fontSize: this._titleSubtitlefontSize,
                },
                0
            );

            //segmentBackground
            tlInit.set(
                segmentBackground,
                {
                    left: "0%",
                    // top: `${this._topPx + this._titleHtPx}px`,
                    top: this.getTop(index) + this._titleHtPx + this._gapBetweensegmentAndBackground,
                    autoAlpha: 1,
                    width: "100%",
                    height: this._segHt - 2 * this._gapBetweensegmentAndBackground,
                    borderRadius: this._borderRadius,
                    zIndex: 2 * index,
                },
                0
            );

            //segment
            tlInit.set(
                segmentDiv,
                {
                    left: "0%",
                    width: "100%",
                    top: this.getTop(index) + this._titleHtPx,
                    autoAlpha: 1,
                    height: this._segHt,
                    borderTopLeftRadius: index == 0 ? this._borderRadius : 0,
                    borderBottomLeftRadius: index == 0 ? this._borderRadius : 0,
                    borderTopRightRadius: index == this._segments.length - 1 ? this._borderRadius : 0,
                    borderBottomRightRadius: index == this._segments.length - 1 ? this._borderRadius : 0,
                    backgroundColor: castColor(index),
                    zIndex: 2 * index + 1,
                },
                0
            );

            let vFloat = segmentFloatVal(this._segments, index);
            let decimalPlaces = parseInt(segmentLevelStrVal(this._segments, index, "decimals", "0"));

            //segment subtitle
            let subtitle = segmentLevelStrVal(this._segments, index, "valuePrefix") + formatted(vFloat, decimalPlaces, true) + singularPlural(suffix, vFloat, decimalPlaces);
            let footerVal = segmentLevelStrVal(this._segments, index, "footer");

            if (SubtitleSetting.length > 0 && footerVal.length > 0) {
                subtitle += " " + footerVal;
            } else if (SubtitleSetting.length > 0 || footerVal.length > 0) {
                subtitle += footerVal;
            }

            segmentLevelStrVal(this._segments, index, "footer");
            subtitle = textToDisplaySymbols(subtitle);
            tlInit.set(
                segSubtitle,
                {
                    color: this._imageTextColor,
                    right: "0%",
                    top: this.getTop(index),
                    autoAlpha: 1,
                    text: subtitle + pie + percentText,
                    zIndex: 2 * index,
                    lineHeight: this._subtitleHtPx + "px",
                    height: this._subtitleHtPx + "px",
                    fontSize: this._titleSubtitlefontSize,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                },
                0
            );
        }
        return tlInit;
    }

    getTop(index) {
        return this._topPx + this._inlineImageHeight + this._inlineImageHeightLowerMargin + this._marginIntraSegmentPx + index * (this._getHeight() + this._marginIntraSegmentPx);
    }

    _getHeight() {
        return this.titleHeight() + this._segHt;
    }

    titleHeight() {
        return Math.max(this._titleHtPx, this._subtitleHtPx);
    }

    //show segment opened. segTitle and segSubtitle are shown
    doHighlight(highlights) {
        highlights = checkInfographics(highlights);
        this.calcBarHeight();

        let tlSegment = gsap.timeline();
        let tlSubtitle = gsap.timeline();

        let totalOfPreviousSegments = 0;

        for (let index = 0; index < this._segments.length; index++) {
            if (Array.isArray(highlights) && highlights.length === 0) highlights = null;
            const hilite = !highlights || highlights.includes(index);
            const segmentHilite = highlights && highlights.includes(index);

            tlSubtitle.add(
                gsap.to(this._segTitleDivs[index], {
                    autoAlpha: hilite ? 1 : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    text: getIndicator(index, hilite) + segmentLevelStrVal(this._segments, index, "title"),
                }),
                0
            );

            let percent = (100 * segmentFloatVal(this._segments, index)) / this._totalOfSegments;
            tlSegment.add(
                gsap.to(this._segmentDivs[index], {
                    autoAlpha: hilite ? 1 : dimGraphicsOpacity(),
                    filter: graphicsHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    width: percent + "%",
                    left: (100 * totalOfPreviousSegments) / this._totalOfSegments + "%",
                    // border: segmentHilite?"1px solid "+ this._imageTextColor:"0px",
                }),
                this.stagger(index)
            );

            tlSegment.add(
                gsap.to(this._segmentBackgrounds[index], {
                    autoAlpha: hilite ? 1 : dimGraphicsOpacity(),
                    filter: graphicsHighlightFilter(hilite),
                    transform: "translateZ(0)",
                }),
                0
            );

            tlSubtitle.add(
                gsap.to(this._segSubtitleDivs[index], {
                    autoAlpha: hilite ? 1 : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    // top: `${topTitle}px`,
                }),
                0
            );

            tlSegment.to(
                this._highlightMarker[index],
                {
                    autoAlpha: highlights && highlights.includes(index) ? 1 : 0,
                },
                this.stagger(index)
            );

            totalOfPreviousSegments += segmentFloatVal(this._segments, index);
        }

        addNarrationTween(tlSegment, this._narrationBox);

        return gsap.timeline().add([tlSegment, tlSubtitle]);
    }

    calcBarHeight() {
        //Making 20 bars work for PURE
        switch (this._segments.length) {
            case 1:
                this._marginIntraSegmentPx = 32;
                this._segHt = 200;
                this._gapBetweensegmentAndBackground = 15;
                break;
            case 2:
            case 3:
                this._marginIntraSegmentPx = 32;
                this._segHt = 96;
                this._gapBetweensegmentAndBackground = 6;
                break;
            case 4:
            case 5:
            case 6:
                this._marginIntraSegmentPx = 24;
                this._segHt = 40;
                this._gapBetweensegmentAndBackground = 4;
                break;
            case 7:
            case 8:
                this._marginIntraSegmentPx = 18;
                this._segHt = 24;
                this._gapBetweensegmentAndBackground = 4;
                break;
            case 9:
            case 10:
                this._marginIntraSegmentPx = 15;
                this._segHt = 18;
                this._gapBetweensegmentAndBackground = 4;
                break;
            case 11:
            case 12:
                this._marginIntraSegmentPx = 12;
                this._segHt = 12;
                this._gapBetweensegmentAndBackground = 4;
                break;
            case 13:
            case 14:
                this._marginIntraSegmentPx = 8;
                this._segHt = 9;
                this._gapBetweensegmentAndBackground = 3;
                break;
            case 15:
            case 16:
                this._marginIntraSegmentPx = 5;
                this._segHt = 9;
                this._titleSubtitlefontSize = "12px";
                this._gapBetweensegmentAndBackground = 3;
                break;
            case 17:
            case 18:
                this._marginIntraSegmentPx = 1.5;
                this._segHt = 9;
                this._titleSubtitlefontSize = "12px";
                this._gapBetweensegmentAndBackground = 2;
                break;
            case 19:
                this._marginIntraSegmentPx = 1.2;
                this._segHt = 8;
                this._titleSubtitlefontSize = "12px";
                this._gapBetweensegmentAndBackground = 2;
                break;
            case 20:
            default:
                this._marginIntraSegmentPx = 1;
                this._segHt = 8;
                this._titleSubtitlefontSize = "12px";
                this._gapBetweensegmentAndBackground = 2;
                break;
        }
        this._gapBetweensegmentAndBackground = 0;
        // console.log(this._segments.length, this._marginIntraSegmentPx, this._segHt)
    }
}

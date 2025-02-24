/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

/* eslint-disable */
import BaseChart from "./BaseChart";

export default class ChartFunnel extends BaseChart {
    constructor(story, chartID, source = null) {
        if (!story) throw new ErrorEvent("Invalid story");
        super(story, chartID, source, "funnel");

        this._segHt = 90;
        this._borderRadius = 1;
        this._topPx = chartTop();
        this._titleHeadingMargin = 0;
        this._titleHtPx = 20;
        this._subtitleHtPx = 18;
        this._marginIntraSegmentPx = 8;
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
    }

    _getSubtitle(index, theValue, maxValue) {
        const decimalPlaces = parseInt(segmentLevelStrVal(this._segments, index, "decimals", "0"));
        const pie = `<span style="display:flex; margin: 1px 3px">${pieMaker(this._getRatio(theValue, maxValue), castColor(index))}</span>`;
        const pieLabel = `<span style="font-size:85%; color:${castColor(index)}">${this._getPercentString(theValue, maxValue, decimalPlaces)}</span>`;
        const prefix = segmentLevelStrVal(this._segments, index, "prefix");
        const suffix = segmentLevelStrVal(this._segments, index, "suffix");
        const formattedValue = formatted(theValue, decimalPlaces, true);
        return prefix + formattedValue + suffix + pie + pieLabel;
    }

    _getTitle(index) {
        return segmentLevelStrVal(this._segments, index, "title");
    }

    _getPercentString(numerator, denominator, decimalPlaces) {
        //applying decimalPlaces to value not percent
        decimalPlaces = 0;
        return formatted(100 * this._getRatio(numerator, denominator), decimalPlaces, false) + "%";
    }

    _getRatio(numerator, denominator) {
        return numerator / denominator;
    }

    getTop(index) {
        if (index < 0) index = 0;
        return this._topPx + this._inlineImageHeight + this._inlineImageHeightLowerMargin + this._titleHeadingMargin + this._marginIntraSegmentPx + index * this._getHeight();
    }

    _getHeight() {
        return this._marginIntraSegmentPx + Math.max(this._segHt, this._titleHtPx + this._subtitleHtPx);
    }

    animationSet() {
        this._mainContainerDiv = chartContainer(this._base64uuid4, "funnelContainer baseContainer responsiveHeight");
        this._segmentDivs = [];
        this._segTitleDivs = [];
        this._segSubtitleDivs = [];
        this._highlightMarker = [];

        this.calcBarHeight();

        let tlInit = gsap.timeline();

        this.setupSceneTheme(tlInit);

        let chartTitle = chartContainer(this._base64uuid4 + "-chartTitle", "chartTitle");
        this._mainContainerDiv.appendChild(chartTitle);

        tlInit.set(chartTitle, {
            left: "0%",
            top: `${chartTitleTop()}px`,
            autoAlpha: 1,
            width: "100%",
            text: chartHeadingTitle(gStory, this._chartIdentifier, "Funnel"),
            color: this._imageTextColor,
            zIndex: 2,
        });

        let maxSegVal = this._getSegValue(0);
        this.funnelMode = true;
        this.valuesNotSorted = false;
        for (let index = 0; index < this._segments.length; index++) {
            if (this._getSegValue(index) > this._getSegValue(index - 1)) this.funnelMode = false;
            if (!this.valuesNotSorted && this._getSegValue(index) < this._getSegValue(index - 1)) this.valuesNotSorted = true;
            maxSegVal = Math.max(this._getSegValue(index), maxSegVal);
            // console.log(index, this._getSegValue(index), "max:", maxSegVal, this._getSegValue(index) > maxSegVal, this._towerOfHanoiMode);
        }
        if (maxSegVal === 0) maxSegVal = 1;

        this._narrationBox = setupNarrationBox();

        for (let index = 0; index < this._segments.length; index++) {
            let segmentDiv = chartContainer(this._base64uuid4 + this._dashSeg + index + "-bar", "segmentBar");
            let segTitle = chartContainer(this._base64uuid4 + this._dashSeg + index + "-title", "segTitle autogap");
            let segSubtitle = chartContainer(this._base64uuid4 + this._dashSeg + index + "-footer", "segSubtitle autogap");

            this._mainContainerDiv.appendChild(segmentDiv);
            this._mainContainerDiv.appendChild(segTitle);
            this._mainContainerDiv.appendChild(segSubtitle);

            this._segmentDivs.push(segmentDiv);
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
                    top: this.getTop(index) + 2,
                    autoAlpha: 0,
                    zIndex: 2 * index,
                    width: highlightMarkerWidth(),
                    height: this._getHeight() - 4,
                    borderRadius: highlightMarkerBorderRadius(),
                    borderWidth: "0px",
                },
                0
            );

            const funnelWidthPercent = 60;

            // SEGMENT FUNNEL
            const isNextSegmentLarger = this._getSegValue(index + 1) > this._getSegValue(index);
            let widthPercent = 0;
            let clip = 0;
            // if (isNextSegmentLarger) {
            //     widthPercent = this._getWidth(index + 1, funnelWidthPercent, maxSegVal);
            //     clip = (50 * (this._getSegValue(index + 1) - this._getSegValue(index))) / this._getSegValue(index + 1);
            // } else {
            //     widthPercent = this._getWidth(index, funnelWidthPercent, maxSegVal);
            //     clip = (50 * (this._getSegValue(index) - this._getSegValue(index + 1))) / this._getSegValue(index);
            // }
            widthPercent = this._getWidth(index, funnelWidthPercent, maxSegVal);
            clip = (50 * (this._getSegValue(index) - this._getSegValue(index + 1))) / this._getSegValue(index);

            let clipPoly = `polygon(0 0, 100% 0, ${100 - clip}% 100%, ${clip}% 100%)`;
            if (widthPercent < 20 && index === this._segments.length - 1) clipPoly = `polygon(0 0, 100% 0, 85% 85%, 15% 100%)`;
            // console.log(index, widthPercent, isNextSegmentLarger, funnelWidthPercent, this._getSegValue(index), this._getSegValue(index + 1), clip, clipPoly);
            tlInit.set(segmentDiv, {
                left: (funnelWidthPercent - widthPercent) / 2 + "%",
                top: startingTop() + "px",
                autoAlpha: 0,
                width: widthPercent + "%",
                height: 0,
                backgroundColor: castColor(index),
                zIndex: index,
                clipPath: this.funnelMode ? clipPoly : "unset",
                // rotate: isNextSegmentLarger ? "180deg" : 0,
            });

            //segment Title
            tlInit.set(segTitle, {
                color: this._imageTextColor,
                left: widthPercent + (funnelWidthPercent - widthPercent) / 2 + "%",
                top: `${this._topPx}px`,
                autoAlpha: 0,
                width: 100 - (widthPercent + (funnelWidthPercent - widthPercent) / 2) + "%", //2% is to compensate for left while keeping this gsap-able
                text: this._getTitle(index),
                zIndex: index,
            });

            //segment subtitle / footer
            tlInit.set(segSubtitle, {
                color: this._imageTextColor,
                top: startingTop() + "px",
                autoAlpha: 0,
                left: widthPercent + (funnelWidthPercent - widthPercent) / 2 + "%",
                width: 100 - (widthPercent + (funnelWidthPercent - widthPercent) / 2) + "%", //2% is to compensate for left while keeping this gsap-able
                text: this._getSubtitle(index, this._getSegValue(index), maxSegVal),
                zIndex: index,
                fontSize: "15px",
                lineHeight: "15px",
                display: "flex",
                alignItems: "center",
            });
        }
        return tlInit;
    }

    _getSegValue(index) {
        index = gsap.utils.clamp(0, this._segments.length - 1, index);
        return segmentFloatVal(this._segments, index);
    }

    _getWidth(index, funnelWidthPercent, maxSegVal) {
        const val = this._getSegValue(index);
        // const valnext = this._getSegValue(index);
        // const valAvg = (val + valnext) / 2;
        let widthPercent = (funnelWidthPercent * val) / maxSegVal;
        if (widthPercent < 1 && val !== 0) widthPercent = 1;
        return widthPercent;
    }

    //show segment opened/highlighted, segTitle and segSubtitle are shown
    doHighlight(highlights) {
        highlights = checkInfographics(highlights);
        let tlSegment = gsap.timeline();
        let tlSubtitle = gsap.timeline();

        const segmentHeight = Math.max(this._segHt, this._titleHtPx + this._subtitleHtPx);

        for (let index = 0; index < this._segments.length; index++) {
            if (Array.isArray(highlights) && highlights.length === 0) highlights = null;
            const hilite = !highlights || highlights.includes(index);

            //title
            tlSubtitle.to(
                this._segTitleDivs[index],
                {
                    text: this._getTitle(index),
                    autoAlpha: hilite ? 1 : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    top: `${this.getTop(index)}px`,
                },
                this.stagger(index)
            );

            //segment
            let topBorder = this._borderRadius;
            let bottomBorder = this._borderRadius;
            if (0 === index && this.funnelMode) {
                topBorder = 14;
            }
            if (!this.funnelMode) {
                topBorder = (this._marginIntraSegmentPx + segmentHeight) / 3;
                bottomBorder = this.valuesNotSorted ? topBorder : (this._marginIntraSegmentPx + segmentHeight) / 5;
            }
            tlSegment.to(
                this._segmentDivs[index],
                {
                    autoAlpha: hilite ? 1 : dimGraphicsOpacity(),
                    filter: graphicsHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    top: `${this.getTop(index)}px`,
                    height: this._marginIntraSegmentPx + segmentHeight - (this.funnelMode ? 0 : 3),
                    borderTopLeftRadius: topBorder,
                    borderTopRightRadius: topBorder,
                    borderBottomRightRadius: bottomBorder,
                    borderBottomLeftRadius: bottomBorder,
                },
                this.stagger(index)
            );

            //subtitle
            tlSubtitle.to(
                this._segSubtitleDivs[index],
                {
                    autoAlpha: hilite ? 1 : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    top: `${this.getTop(index) + this._titleHtPx}px`,
                },
                this.stagger(index)
            );

            tlSegment.to(
                this._highlightMarker[index],
                {
                    autoAlpha: highlights && highlights.includes(index) ? 1 : 0,
                },
                this.stagger(index)
            );
        }

        addNarrationTween(tlSegment, this._narrationBox);

        return gsap.timeline().add([tlSegment, tlSubtitle]);
    }

    calcBarHeight() {
        // USE THIS FOR TUNING - do not delete
        if (window.location.href.includes("localhost:5001")) {
            // this._segments = this._segments.slice(0, 7) //remove segments
            // or
            // this._segments.push(this._segments[0]) //add a segment
            // this._segments.push(this._segments[1]) //add a segment
        }

        //Making 20 bars work for PURE
        switch (this._segments.length) {
            case 1:
                this._marginIntraSegmentPx = 24;
                this._segHt = 120;
                break;
            case 2:
            case 3:
                this._marginIntraSegmentPx = 24;
                this._segHt = 96;
                break;
            case 4:
                this._marginIntraSegmentPx = 24;
                this._segHt = 72;
                break;
            case 5:
                this._marginIntraSegmentPx = 24;
                this._segHt = 64;
                break;
            case 6:
                this._marginIntraSegmentPx = 24;
                this._segHt = 40;
                break;
            case 7:
            case 8:
                this._marginIntraSegmentPx = 18;
                this._segHt = 20;
                break;
            case 9:
            case 10:
                this._marginIntraSegmentPx = 15;
                this._segHt = 14;
                break;
            case 11:
            case 12:
            default:
                this._marginIntraSegmentPx = 12;
                this._segHt = 12;
                break;
        }
        // console.log(this._segments.length, this._marginIntraSegmentPx, this._segHt)
    }
}

/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

/* eslint-disable */
import BaseChart from "./BaseChart";

export default class Waterfall extends BaseChart {
    constructor(story, chartID, source = null) {
        if (!story) throw new ErrorEvent("Invalid story");
        super(story, chartID, source, "waterfall");

        this._originalSegHt = 10;
        this._segHt = this._originalSegHt;
        this._topPx = chartTop();
        this._titleHtPx = 20;
        this._subtitleHtPx = 20;
        this._marginIntraSegmentPx = 13;
        this._borderRadius = "50%";
        this._borderRadiusLight = 5;
        this._firstHighlight = true;
        this._topMarginPx = 10;
        this._titleSubtitlefontSize = "14px";
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
        this._mainContainerDiv = chartContainer(this._base64uuid4, "waterfallContainer baseContainer responsiveHeight");
        this._segmentDivs = [];
        this._segmentsMarker = [];
        this._segTitleDivs = [];
        this._segSubtitleDivs = [];
        this._highlightMarker = [];

        let chartTitle = chartContainer(this._base64uuid4 + "-chartTitle", "chartTitle");
        this._mainContainerDiv.appendChild(chartTitle);

        this.calcBarHeight();

        //Chart title
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

        //Calculate the total
        let runningTotal = 0;
        this._segmentValues = [];
        for (let index = 0; index < this._segments.length - 1; index++) {
            let val = this._getParsedCorrectedValue(index);
            runningTotal += val;
            this._segmentValues.push(val);
        }
        //Overwrite the total
        this._segmentValues.push(runningTotal);

        //Calculate the min and max values
        let minValue = 0;
        let maxValue = 0;
        runningTotal = 0;
        for (let index = 0; index < this._segmentValues.length - 1; index++) {
            minValue = Math.min(minValue, runningTotal + this._segmentValues[index]);
            maxValue = Math.max(maxValue, runningTotal + this._segmentValues[index]);
            runningTotal += this._segmentValues[index];
        }
        // console.log(this._segmentValues, minValue, maxValue);

        let valFr = 0;
        let valTo = 0;
        this._positions = [];

        for (let index = 0; index < this._segments.length; index++) {
            let segmentDiv = chartContainer(this._base64uuid4 + this._dashSeg + index + "-bar", "segmentBar");
            let segmentsMarker = chartContainer(this._base64uuid4 + this._dashSeg + index + "-barMarker", "segmentBarBackground");
            let segTitle = chartContainer(this._base64uuid4 + this._dashSeg + index + "-title", "segTitle");
            let segSubtitle = chartContainer(this._base64uuid4 + this._dashSeg + index + "-footer", "segSubtitle");

            this._mainContainerDiv.appendChild(segmentDiv);
            this._mainContainerDiv.appendChild(segmentsMarker);
            this._mainContainerDiv.appendChild(segTitle);
            this._mainContainerDiv.appendChild(segSubtitle);

            this._segmentDivs.push(segmentDiv);
            this._segmentsMarker.push(segmentsMarker);
            this._segTitleDivs.push(segTitle);
            this._segSubtitleDivs.push(segSubtitle);

            let val = this._segmentValues[index];
            let segColor = customCssVariable(val > 0 ? "--cast-waterfall-positive" : "--cast-waterfall-negative");
            if (this.firstOrLastIndex(index)) segColor = castColor(0);

            let highlightMarker = chartContainer(this._base64uuid4 + this._dashSeg + index + "-highlightmarker", "segmentBar");
            this._mainContainerDiv.appendChild(highlightMarker);
            this._highlightMarker.push(highlightMarker);
            tlInit.set(
                highlightMarker,
                {
                    backgroundColor: segColor,
                    left: highlightMarkerLeft(),
                    top: this.getTop(index), // + this.titleHeight(),
                    autoAlpha: 0,
                    zIndex: 2 * index,
                    width: highlightMarkerWidth(),
                    height: this._getHeight(), // - this.titleHeight(),
                    borderRadius: highlightMarkerBorderRadius(),
                    borderWidth: "0px",
                },
                0
            );

            let sign = val < 0 ? "-" : this.firstOrLastIndex(index) ? "" : "+";
            // if (index === 0) sign = segmentLevelStrVal(this._segments, index, "subtitle", "Starting") + ": ";
            // if (this.isLastIndex(index)) sign = segmentLevelStrVal(this._segments, index, "subtitle", "Ending") + ": ";
            // sign = textToDisplaySymbols(sign);

            valTo = val + valFr;
            if (this.isLastIndex(index)) valTo = 0;

            let pos = {
                // required for debugging negative totals   ,
                // index,
                // minValue,
                // maxValue,
                // valFr,
                // valTo,
                // valToMinusvalTo: valTo - valFr,
                // absValToMinusvalToWIDTH: Math.abs(valTo - valFr),
                // minvalFrAndvalToLEFT: Math.min(valFr, valTo),
                // totalWIDTH: maxValue - minValue,
                left: (Math.min(valFr, valTo) - minValue) / (maxValue - minValue),
                width: Math.abs(valTo - valFr) / (maxValue - minValue),
                positive: val > 0,
                segColor,
            };

            //segment Title
            // const customMarker = pos.positive ? "⊕" : "⊖";
            const indicator = this.firstOrLastIndex(index) ? getIndicatorOfColor(segColor) : getIndicatorOfColorMarker("•", segColor);
            tlInit.set(
                segTitle,
                {
                    left: "0%",
                    top: `${this.getTop(index)}px`,
                    autoAlpha: 0,
                    color: segColor,
                    text: indicator + segmentLevelStrVal(this._segments, index, "title"),
                    zIndex: 2 * index,
                    fontSize: this._titleSubtitlefontSize,
                },
                0
            );

            const lb = pos.positive || this.firstOrLastIndex(index) ? this._borderRadiusLight : this._borderRadius;
            const rb = pos.positive && !this.firstOrLastIndex(index) ? this._borderRadius : this._borderRadiusLight;
            //segment
            tlInit.set(segmentDiv, {
                // left: (pos.positive && index !== this._segments.length - 1 ? pos.left : pos.left + pos.width) + "%",
                width: 0,
                left: 100 * pos.left + "%",
                top: this.getTop(index) + this._titleHtPx,
                autoAlpha: 0,
                height: this._segHt,
                borderTopLeftRadius: lb,
                borderBottomLeftRadius: lb,
                borderTopRightRadius: rb,
                borderBottomRightRadius: rb,
                backgroundColor: segColor,
                zIndex: 2 * this._segments.length + 1,
            });

            //marker
            if (index > 0) {
                let left = 100 * pos.left;
                if (!pos.positive) left = 100 * (pos.left + pos.width);
                if (index === this._segments.length - 1) left = 100 * (pos.left + pos.width);
                left = left + "%";
                const top = this.getTop(index - 1) + this._titleHtPx + this._segHt / 2 + (index === 1 ? this._segHt / 2 : 0);
                pos.markerHeight = this.getTop(index) - this.getTop(index - 1) - this._segHt / 2 - (index === 1 ? this._segHt / 2 : 0);
                // WILL USE WHEN https://github.com/cast-corp/cast/issues/5690 is resolved.
                // const $mc1 = hexWithOpacity(this._imageTextColor, 0.5);
                // const $mc2 = hexWithOpacity(this._imageTextColor, 0); //because transparent is interpreted as transparent black on older mobile devices
                // const $l1 = 2;
                // const $l2 = 2 * $l1;
                // const background = `repeating-linear-gradient(${$mc1}, ${$mc1} ${$l1}px, ${$mc2} ${$l1}px, ${$mc2} ${$l2}px)`;
                tlInit.set(segmentsMarker, {
                    width: 3,
                    left,
                    top,
                    autoAlpha: 0,
                    height: pos.markerHeight,
                    borderRadius: this._borderRadiusLight,
                    // background,
                    backgroundColor: hexWithOpacity(this._imageTextColor, 0.1),
                    zIndex: 2 * this._segments.length,
                });
            }

            let decimalPlaces = parseInt(segmentLevelStrVal(this._segments, index, "decimals", "0"));

            const prefix = sceneLevelStrVal(this._chartIdentifier, "prefix");
            const suffix = sceneLevelStrVal(this._chartIdentifier, "suffix");
            let upDown = "";
            if (this.isLastIndex(index)) {
                const val0 = this._segmentValues[0];
                let symbol = "";

                if (val0 < val) symbol = `<span style='color:${customCssVariable("--cast-waterfall-positive")}'> ▲`;
                if (val0 > val) symbol = `<span style='color:${customCssVariable("--cast-waterfall-negative")}'> ▼`;
                if (symbol) upDown = symbol + prefixValueSuffix(prefix, val0 - val, decimalPlaces, suffix) + "</span>";
            }

            //segment subtitle
            // let subtitle = sign + prefix + formatted(Math.abs(val), decimalPlaces, true) + singularPlural(suffix, Math.abs(val), decimalPlaces) + upDown;
            let subtitle = sign + prefixValueSuffix(prefix, val, decimalPlaces, suffix) + upDown;
            subtitle = textToDisplaySymbols(subtitle);
            tlInit.set(
                segSubtitle,
                {
                    // color: this._imageTextColor,
                    top: `${this.getTop(index)}px`,
                    autoAlpha: 0,
                    color: segColor,
                    text: subtitle,
                    zIndex: 2 * index,
                    fontSize: this._titleSubtitlefontSize,
                },
                this.stagger(3)
            );

            this._positions.push(pos);
            //for the next set
            if (index < this._segments.length - 1) valFr = valTo;
            else valTo = 0;
        }

        function prefixValueSuffix(prefix, val, decimalPlaces, suffix) {
            return prefix + formatted(Math.abs(val), decimalPlaces, true) + singularPlural(suffix, Math.abs(val), decimalPlaces);
        }

        return tlInit;
    }

    _getParsedCorrectedValue(index) {
        let r = segmentFloatVal(this._segments, index);
        return isNaN(r) ? 0 : r;
    }

    getTop(index) {
        return this._topPx + this._topMarginPx + this._inlineImageHeight + this._inlineImageHeightLowerMargin + index * (this._getHeight() + this._marginIntraSegmentPx);
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
        const durationWaterfall = 2.0 / this._segments.length;

        for (let index = 0; index < this._segments.length; index++) {
            const topSegment = this.getTop(index) + this._titleHtPx;

            if (Array.isArray(highlights) && highlights.length === 0) highlights = null;
            const hilite = !highlights || highlights.includes(index);

            tlSubtitle.to(
                this._segTitleDivs[index],
                {
                    autoAlpha: hilite ? 1 : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    // color: "#ffffff",
                },
                this.stagger(index)
            );

            tlSegment.to(
                this._segmentDivs[index],
                {
                    autoAlpha: hilite ? 1 : dimGraphicsOpacity(),
                    filter: graphicsHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    top: `${topSegment}px`,
                    left: 100 * this._positions[index].left + "%",
                    width: 100 * this._positions[index].width + "%",
                    duration: durationWaterfall,
                },
                index * durationWaterfall
            );
            tlSegment.to(
                this._segmentsMarker[index],
                {
                    autoAlpha: hilite ? 1 : dimGraphicsOpacity(),
                    filter: graphicsHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    height: this._positions[index].markerHeight,
                    duration: durationWaterfall,
                },
                index * durationWaterfall
            );

            tlSubtitle.to(
                this._segSubtitleDivs[index],
                {
                    autoAlpha: hilite ? 1 : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    textDecoration: highlights && highlights.includes(index) ? "underline" : "none",
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

        this._firstHighlight = false;
        return gsap.timeline().add([tlSegment, tlSubtitle]);
    }

    isLastIndex(index) {
        return index === this._segments.length - 1;
    }

    firstOrLastIndex(index) {
        return index === 0 || index === this._segments.length - 1;
    }

    calcBarHeight() {
        //Making 10 bars
        switch (this._segments.length) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
                this._marginIntraSegmentPx = 12;
                this._segHt = 20;
                break;
            case 9:
            case 10:
                this._marginIntraSegmentPx = 12;
                this._segHt = 18;
                break;
            case 11:
            case 12:
                this._marginIntraSegmentPx = 12;
                this._segHt = 12;
                break;
            case 13:
            case 14:
                this._marginIntraSegmentPx = 8;
                this._segHt = 9;
                break;
            case 15:
            case 16:
                this._marginIntraSegmentPx = 5;
                this._segHt = 9;
                this._titleSubtitlefontSize = "12px";
                break;
            case 17:
            case 18:
                this._marginIntraSegmentPx = 1.5;
                this._segHt = 9;
                this._titleSubtitlefontSize = "12px";
                break;
            case 19:
                this._marginIntraSegmentPx = 1.2;
                this._segHt = 8;
                this._titleSubtitlefontSize = "12px";
                break;
            case 20:
            default:
                this._marginIntraSegmentPx = 1.2;
                this._segHt = 6;
                this._titleSubtitlefontSize = "12px";
                break;
        }
        // console.log(this._segments.length, this._marginIntraSegmentPx, this._segHt)
    }
}

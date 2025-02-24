/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

/* eslint-disable */
import BaseChart from "./BaseChart";

export default class Bars extends BaseChart {
    constructor(story, chartID, source = null) {
        if (!story) throw new ErrorEvent("Invalid story");
        super(story, chartID, source, "bars");

        this._segHt = 6;
        this._originalSegHt = 10;
        this._intraBarGap = 1;
        this._borderRadius = 5;
        this._topPx = chartTop();
        this._titleHeadingMargin = 0;
        this._titleHtPx = 20;
        this._subtitleHtPx = 20;
        this._marginIntraSegmentPx = 5;
        this._initialPercent = 0;
        this._segmentMargin = 0;
        this._spaced = 15;
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
    }

    animationSet() {
        this._mainContainerDiv = chartContainer(this._base64uuid4, "barsContainer baseContainer responsiveHeight");
        this._barsSegmentDivs = [];
        this._barsSegmentBackgrounds = [];
        this._barssegTitleDivs = [];
        this._barssegSubtitleDivs = [];
        this._barssegLabelLegend = [];
        this._highlightMarker = [];

        let tlInit = gsap.timeline();
        this.setupSceneTheme(tlInit);

        let chartTitle = chartContainer(this._base64uuid4 + "-chartTitle", "chartTitle");
        this._mainContainerDiv.appendChild(chartTitle);

        //calculate this._scaleMin this._scaleMax this._numBars
        this.numBarsScaleMinMax();

        tlInit.set(chartTitle, {
            left: "0%",
            top: `${chartTitleTop()}px`,
            // top: startingTop() + "px",
            autoAlpha: 1,
            width: "100%",
            text: chartHeadingTitle(gStory, this._chartIdentifier, "Bars Chart"),
            color: this._imageTextColor,
            zIndex: 2,
        });

        this.calcBarHeight();

        this._narrationBox = setupNarrationBox();

        let titleWidth = parseFloat(sceneLevelStrVal(this._chartIdentifier, "titleWidth", "40"));
        this._firstColorIndex = "firstColorIndex" === sceneLevelStrVal(this._chartIdentifier, "barColorMode", "");

        for (let index = 0; index < this._segments.length; index++) {
            // let numBarsForSegment = segmentValueAsArray(this._segments, index).length;

            let segmentDiv = [];
            for (let barIndex = 0; barIndex < this._numBars; barIndex++) {
                segmentDiv[barIndex] = chartContainer(this._base64uuid4 + this._dashSeg + index + "-bar-" + barIndex, "segmentBar");
                this._mainContainerDiv.appendChild(segmentDiv[barIndex]);
            }
            let segmentBackground = chartContainer(this._base64uuid4 + this._dashSeg + index + "-barsBack", "transparentSegmentBarBackground");
            this._mainContainerDiv.appendChild(segmentBackground);

            let segTitle = chartContainer(this._base64uuid4 + this._dashSeg + index + "-title", "segTitle");
            this._mainContainerDiv.appendChild(segTitle);

            let segSubtitle = chartContainer(this._base64uuid4 + this._dashSeg + index + "-footer", "segSubtitle");
            this._mainContainerDiv.appendChild(segSubtitle);

            let segLabelLegend = chartContainer(this._base64uuid4 + this._dashSeg + index + "-footer", "segLabelLegend");
            this._mainContainerDiv.appendChild(segLabelLegend);

            this._barsSegmentDivs.push(segmentDiv);
            this._barsSegmentBackgrounds.push(segmentBackground);
            this._barssegTitleDivs.push(segTitle);
            this._barssegSubtitleDivs.push(segSubtitle);
            this._barssegLabelLegend.push(segLabelLegend);

            let highlightMarker = chartContainer(this._base64uuid4 + this._dashSeg + index + "-highlightmarker", "segmentBar");
            this._mainContainerDiv.appendChild(highlightMarker);
            this._highlightMarker.push(highlightMarker);
            tlInit.set(
                highlightMarker,
                {
                    backgroundColor: hexWithOpacity(this._imageTextColor, 0.5),
                    left: highlightMarkerLeft(),
                    top: this.getTop(index) + this._numBars * this._intraBarGap + 1.5,
                    autoAlpha: 0,
                    zIndex: 2 * index,
                    width: highlightMarkerWidth(),
                    height: this._getHeight() - 3,
                    borderRadius: highlightMarkerBorderRadius(),
                    borderWidth: "0px",
                },
                0
            );

            //segment Title
            tlInit.set(segTitle, {
                color: this._imageTextColor,
                left: "0%",
                top: startingTop() + "px",
                autoAlpha: dimTextOpacity(),
                filter: textHighlightFilter(),
                transform: "translateZ(0)",
                text: (this.howManyColors() ? "" : getIndicator(this._firstColorIndex ? 0 : index)) + segmentLevelStrVal(this._segments, index, "title"),
                zIndex: 2 * index,
                width: titleWidth + "%",
                fontSize: this._titleSubtitlefontSize,
            });

            let backColor = "transparent"; // customCssVariable("--cast-seg-back");

            //segmentBackground
            tlInit.set(segmentBackground, {
                left: "0%",
                top: startingTop() + this._segHt / 3 + "px",
                autoAlpha: dimGraphicsOpacity(),
                filter: graphicsHighlightFilter(),
                transform: "translateZ(0)",
                width: "100%",
                height: (this._segHt + this._intraBarGap) * this._numBars - 2 * (this._segHt / 3),
                borderTopLeftRadius: this._borderRadius,
                borderBottomLeftRadius: this._borderRadius,
                borderTopRightRadius: this._borderRadius,
                borderBottomRightRadius: this._borderRadius,
                backgroundColor: backColor,
                zIndex: 2 * index,
            });

            let labelLegend = "";
            let unformattedLabelLegend = "";
            let valuesLegend = "";
            let prefix = segmentLevelStrVal(this._segments, index, "prefix");
            let suffix = segmentLevelStrVal(this._segments, index, "suffix");

            //bars
            for (let barIndex = 0; barIndex < this._numBars; barIndex++) {
                let { borderTL, borderBL, borderTR, borderBR } = this.calcBorder(barIndex, 0, this._numBars - 1);

                let bgColor;
                if (this._firstColorIndex) {
                    bgColor = castColor(0);
                } else {
                    bgColor = castColor(this.howManyColors() ? barIndex : index);
                    if (this.howManyColors() && colorsOverridden(this._segments, index)) {
                        let oc = this.overrideColors(index, barIndex);
                        if (!isNaN(oc)) {
                            bgColor = castColor(oc);
                        } else {
                            bgColor = lighten(bgColor, -0.2);
                        }
                    }
                }

                tlInit.set(segmentDiv[barIndex], {
                    left: "0%",
                    width: this._initialPercent + "%",
                    top: startingTop() + "px",
                    autoAlpha: dimGraphicsOpacity(),
                    filter: graphicsHighlightFilter(),
                    transform: "translateZ(0)",
                    height: this._segHt,
                    backgroundColor: bgColor,
                    borderTopLeftRadius: borderTL,
                    borderBottomLeftRadius: borderBL,
                    borderTopRightRadius: borderTR,
                    borderBottomRightRadius: borderBR,
                    zIndex: 2 * index + 1,
                });

                let b2v = this.barValue2(index, barIndex);
                let label = this.label(index, barIndex);
                let decimalPlacesForSmallNumbers = segmentLevelStrVal(this._segments, index, "decimals", 0);
                if (label.length > 0) {
                    // labelLegend += `<span class='label' style=color:white;background-color:${lighten(bgColor, -.4)}>${label} </span>`;
                    labelLegend += getIndicatorOfColor(bgColor) + label + " ";
                    unformattedLabelLegend += label;
                }
                if (b2v >= 0) {
                    let b2vwc = largeNumbersWithCommaNoDecimals(b2v, decimalPlacesForSmallNumbers);
                    valuesLegend += `<span class='label' style=color:white;background-color:${lighten(bgColor, -0.4)}>${prefix}${b2vwc}${singularPlural(suffix, b2vwc)} </span>`;
                }
            }

            let subtitleprefix = segmentLevelStrVal(this._segments, index, "subtitleprefix");
            //segment right Numbers valuesLegend
            tlInit.set(segSubtitle, {
                color: this._imageTextColor,
                right: "0%",
                top: startingTop() + "px",
                autoAlpha: dimTextOpacity(),
                filter: textHighlightFilter(),
                transform: "translateZ(0)",
                text: textToDisplaySymbols(subtitleprefix + valuesLegend),
                zIndex: 2 * index,
                width: 100 - titleWidth + "%",
                fontSize: this._titleSubtitlefontSize,
            });

            //label legend labelLegend
            tlInit.set(segLabelLegend, {
                color: this._imageTextColor,
                left: "0%",
                top: startingTop() + "px",
                height: unformattedLabelLegend === "" ? 0 : this._subtitleHtPx,
                autoAlpha: dimTextOpacity(),
                filter: textHighlightFilter(),
                transform: "translateZ(0)",
                text: textToDisplaySymbols(labelLegend),
                zIndex: 2 * index,
                fontSize: this._titleSubtitlefontSize,
            });
        }
        return tlInit;
    }

    calcBorder(barIndex, firstBarIndex, lastBarIndex) {
        let borderTL;
        let borderTR = this._borderRadius;
        let borderBR = this._borderRadius;
        let borderBL;
        if (barIndex === firstBarIndex && firstBarIndex !== lastBarIndex) borderTL = this._borderRadius;
        else if (barIndex === firstBarIndex && firstBarIndex === lastBarIndex) borderTL = this._borderRadius;
        else borderTL = 0;
        if (barIndex === lastBarIndex && firstBarIndex !== lastBarIndex) borderBL = this._borderRadius;
        else if (barIndex === firstBarIndex && firstBarIndex === lastBarIndex) borderBL = this._borderRadius;
        else borderBL = 0;
        return { borderTL, borderBL, borderTR, borderBR };
    }

    //show segment opened. segTitle and segSubtitle are shown
    doHighlight(highlights) {
        highlights = checkInfographics(highlights);
        this.calcBarHeight();

        let tlSegment = gsap.timeline();

        for (let index = 0; index < this._segments.length; index++) {
            if (Array.isArray(highlights) && highlights.length === 0) highlights = null;
            const hilite = !highlights || highlights.includes(index);

            const topSegment = this.getTop(index);

            tlSegment.to(
                this._barssegTitleDivs[index],
                {
                    autoAlpha: hilite ? 1 : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    top: `${topSegment}px`,
                },
                0
            );

            for (let barIndex = 0; barIndex < this._numBars; barIndex++) {
                let range = this._scaleMax - this._scaleMin;
                let barWidth = this.barValue(index, barIndex) - this._scaleMin;
                let barPercent = 100;
                if (range !== 0) {
                    barPercent = (100 * barWidth) / range;
                }
                if (barPercent < 1.2) barPercent = 1.2;

                //bar
                tlSegment.to(
                    this._barsSegmentDivs[index][barIndex],
                    {
                        autoAlpha: hilite ? 0.8 : dimGraphicsOpacity(),
                        filter: graphicsHighlightFilter(hilite),
                        transform: "translateZ(0)",
                        top: `${topSegment + this._titleHtPx + barIndex * (this._segHt + this._intraBarGap)}px`,
                        height: this._segHt,
                        width: barPercent + "%",
                    },
                    0
                );
            }

            //bar background
            tlSegment.to(
                this._barsSegmentBackgrounds[index],
                {
                    autoAlpha: 1,
                    top: `${topSegment + Math.max(this._titleHtPx, this._subtitleHtPx) + this._segHt / 3}px`,
                    height: (this._segHt + this._intraBarGap) * this._numBars - 2 * (this._segHt / 3),
                },
                0
            );

            //valueLabels
            tlSegment.to(
                this._barssegSubtitleDivs[index],
                {
                    autoAlpha: hilite ? 1 : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    top: `${topSegment}px`,
                },
                0
            );

            //legendLabels
            tlSegment.to(
                this._barssegLabelLegend[index],
                {
                    autoAlpha: hilite ? 1 : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    top: `${topSegment + this._titleHtPx + this._numBars * (this._segHt + this._intraBarGap)}px`,
                },
                0
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

        return tlSegment;
    }

    howManyColors() {
        return this._numBars > 1;
    }

    calcBarHeight() {
        switch (this._segments.length) {
            case 1:
                this._segHt = 200;
                break;
            case 2:
                this._segHt = 150;
                break;
            case 3:
                this._segHt = 120;
                break;
            case 4:
                this._segHt = 90;
                break;
            case 5:
                this._segHt = 72;
                break;
            case 6:
                this._segHt = 64;
                break;
            case 7:
                this._segHt = 48;
                break;
            case 8:
                this._segHt = 42;
                break;
            case 9:
                this._segHt = 36;
                break;
            case 10:
                this._segHt = 28;
                break;
            case 11:
                this._segHt = 24;
                break;
            case 12:
                this._segHt = 20;
                break;
            case 13:
            case 14:
                this._segHt = 12;
                break;
            case 15:
            case 16:
                this._segHt = 10;
                this._titleSubtitlefontSize = "12px";
                break;
            case 17:
            case 18:
                this._segHt = 8.5;
                this._titleSubtitlefontSize = "12px";
                break;
            case 19:
                this._segHt = 8;
                this._titleSubtitlefontSize = "12px";
                break;
            case 20:
            default:
                this._segHt = 7;
                this._titleSubtitlefontSize = "12px";
                break;
        }
        this._segHt *= 0.92;

        if (this._inlineImg && this._segments.length > 4) this._segHt = this._segHt / 1.2;

        if (this._numBars * this._segments.length > 15) this._borderRadius = 3;

        if (this._numBars > 0) this._segHt = this._segHt / this._numBars;
        // console.log(this._segments.length, this._marginIntraSegmentPx, this._segHt)
    }

    getTop(index) {
        let labelLegendHt = 0;

        for (let i = 0; i < index; i++) {
            if (segmentValueLabelArray(this._segments, i).length > 0) {
                labelLegendHt += this._subtitleHtPx; //+ this._marginIntraSegmentPx
            }
        }

        return (
            this._topPx +
            this._inlineImageHeight +
            this._inlineImageHeightLowerMargin +
            this._titleHeadingMargin +
            this._segmentMargin +
            labelLegendHt +
            index * (this._getHeight() + this._marginIntraSegmentPx)
        );
    }

    _getHeight() {
        return Math.max(this._titleHtPx, this._subtitleHtPx) + this._segmentMargin + this._segHt * this._numBars;
    }

    numBarsScaleMinMax() {
        let min, max, num;
        for (let index = 0; index < this._segments.length; index++) {
            let valArray = segmentValueAsArray(this._segments, index);
            if (num === undefined || valArray.length > num) {
                num = valArray.length;
            }
            valArray.forEach(function (value) {
                let flt = parseFloat(value);
                if (max === undefined || flt > max) {
                    max = flt;
                }
                if (min === undefined || flt < min) {
                    min = flt;
                }
            });
        }

        let margin = (max - min) / 10;
        max = max + margin;
        if (min !== 0) min = min - margin;

        this._scaleMax = max;
        this._scaleMin = min < 0 ? min : 0;
        this._numBars = num;
    }

    barValue(index, barIndex) {
        let valArray = segmentValueAsArray(this._segments, index);
        if (barIndex >= valArray.length) return parseFloat(this._scaleMin);
        return parseFloat(valArray[barIndex]);
    }

    barValue2(index, barIndex) {
        let valArray = segmentValueAsArray(this._segments, index);
        if (barIndex >= valArray.length) return -1;
        return parseFloat(valArray[barIndex]);
    }

    label(index, barIndex) {
        let valArray = segmentValueLabelArray(this._segments, index);
        if (barIndex >= valArray.length) return "";
        return valArray[barIndex].toString();
    }

    overrideColors(index, barIndex) {
        let valArray = segmentValueColorsArray(this._segments, index);
        if (barIndex >= valArray.length) return NaN;
        return parseInt(valArray[barIndex]);
    }
}

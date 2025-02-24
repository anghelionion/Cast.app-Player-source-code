/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

/* eslint-disable */
import BaseChart from "./BaseChart";

export default class Gauges extends BaseChart {
    constructor(story, chartID, source = null) {
        if (!story) throw new ErrorEvent("Invalid story");
        super(story, chartID, source, "gauges");

        let ratio = 0.4;
        this._gaugesSegmentHeight = 20;
        this._gaugeColoredBackHeight = this._gaugesSegmentHeight * ratio;
        this._gaugeColoredBackTopDelta = (this._gaugesSegmentHeight - this._gaugeColoredBackHeight) / 2;
        this._borderRadius = 4;
        this._topPx = chartTop();
        this._titleHtPx = this._ticksHtPx = 20;
        this._marginIntraSegmentPx = 0;
        this._markerBorders = 1; //1
        this._markerMinWidth = parseFloat(customCssVariable("--cast-gauge-percent-width"));

        // if (playBoxHeightAdjusted() > 1000)
        //   this._topPx += 60;
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

    getTop(index) {
        return this._marginIntraSegmentPx + this._topPx + this._inlineImageHeight + this._inlineImageHeightLowerMargin + index * (this._getHeight() + this._marginIntraSegmentPx);
    }

    _getHeight() {
        return this.titleHeight() + this._ticksHtPx + this._gaugesSegmentHeight;
    }

    titleHeight() {
        return this._titleHtPx;
    }

    animationSet() {
        this._mainContainerDiv = chartContainer(this._base64uuid4, "gaugesContainer baseContainer responsiveHeight");
        this._gaugesSegmentDivs = [];
        this._gaugesSegmentDivLights = [];
        this._gaugessegTitleDivs = [];
        this._gaugessegSubtitleDivs = [];
        this._gaugesSegmentValueDivs = [];
        this._gaugesSegmentBreakBgs = [];
        this._gaugesSegmentBreakMins = [];
        this._firstHilight = [];
        this._highlightMarker = [];

        let tlInit = gsap.timeline();
        this.setupSceneTheme(tlInit);

        let chartTitle = chartContainer(this._base64uuid4 + "-chartTitle", "chartTitle");
        this._mainContainerDiv.appendChild(chartTitle);

        tlInit.set(chartTitle, {
            left: "0%",
            top: `${chartTitleTop()}px`,
            autoAlpha: 1,
            width: "100%",
            text: chartHeadingTitle(gStory, this._chartIdentifier, "Comparisions"),
            color: this._imageTextColor,
            zIndex: 2,
        });

        const sameTickScale = this.autoSameTickScale(); // !!sceneLevelBool(this._chartIdentifier, "sameTickScale");

        this.calcBarHeight();

        this._narrationBox = setupNarrationBox();

        for (let index = 0; index < this._segments.length; index++) {
            let segmentDiv = chartContainer(this._base64uuid4 + this._dashSeg + index + "-gauges", "segmentBar");
            let segmentDivLight = chartContainer(this._base64uuid4 + this._dashSeg + index + "-gaugesLight", "segmentBar");
            let segTitle = chartContainer(this._base64uuid4 + this._dashSeg + index + "-title", "segTitle");
            let segSubtitle = chartContainer(this._base64uuid4 + this._dashSeg + index + "-footer", "segSubtitle");
            let segmentValues = chartContainer(this._base64uuid4 + this._dashSeg + index + "-Values", "segSubtitle");

            this._firstHilight[index] = true;

            this._mainContainerDiv.appendChild(segmentDiv);
            this._mainContainerDiv.appendChild(segmentDivLight);
            this._mainContainerDiv.appendChild(segTitle);
            this._mainContainerDiv.appendChild(segSubtitle);
            this._mainContainerDiv.appendChild(segmentValues);

            this._gaugesSegmentDivs.push(segmentDiv);
            this._gaugesSegmentDivLights.push(segmentDivLight);
            this._gaugessegTitleDivs.push(segTitle);
            this._gaugessegSubtitleDivs.push(segSubtitle);
            this._gaugesSegmentValueDivs.push(segmentValues);

            let tickColor = this.gaugeTickColor(index, segmentFloatVal(this._segments, index));

            let highlightMarker = chartContainer(this._base64uuid4 + this._dashSeg + index + "-highlightmarker", "segmentBar");
            this._mainContainerDiv.appendChild(highlightMarker);
            this._highlightMarker.push(highlightMarker);
            tlInit.set(
                highlightMarker,
                {
                    backgroundColor: tickColor,
                    left: highlightMarkerLeft(),
                    top: this.getTop(index) + this.titleHeight(),
                    autoAlpha: 0,
                    zIndex: 2 * index,
                    width: highlightMarkerWidth(),
                    height: this._getHeight() - this.titleHeight() - this._ticksHtPx,
                    borderRadius: highlightMarkerBorderRadius(),
                    borderWidth: "0px",
                },
                0
            );

            const topSegment = this.getTop(index);

            //value is $5.3M
            let value = segmentFloatVal(this._segments, index);
            //segment Title
            tlInit.set(
                segTitle,
                {
                    color: this._imageTextColor,
                    left: "0%",
                    top: `${topSegment}px`,
                    autoAlpha: 0,
                    text: getIndicatorOfColor(tickColor) + segmentLevelStrVal(this._segments, index, "title") + ": " + this.getPrefixValueSuffix(index, value),
                    zIndex: 2 * index,
                },
                0
            );

            //segmentBackground = colored bars + br min labels
            let { gaugeMin, gaugeMax } = this.gaugeMinMax(index);

            let j = 0,
                aBreakBg = [],
                aBreakMin = [];
            let breaksLenMin1 = breaks(this._segments, index).length - 1;
            breaks(this._segments, index).forEach((br) => {
                let s = (100 * (parseFloat(br.min) - gaugeMin)) / (gaugeMax - gaugeMin);
                let e = (100 * (parseFloat(br.max) - gaugeMin)) / (gaugeMax - gaugeMin);

                let breakBg = chartContainer(this._base64uuid4 + this._dashSeg + index + "-gaugesBack-" + j, "segmentBarBackground");
                this._mainContainerDiv.appendChild(breakBg);
                aBreakBg.push(breakBg);

                //background  colored bars
                tlInit.set(
                    breakBg,
                    {
                        left: s + "%",
                        top: `${topSegment + this._titleHtPx + this._gaugeColoredBackTopDelta}px`,
                        autoAlpha: 0,
                        width: e - s + "%",
                        height: this._gaugeColoredBackHeight,
                        borderTopLeftRadius: j === 0 ? this._borderRadius : 0,
                        borderBottomLeftRadius: j === 0 ? this._borderRadius : 0,
                        borderTopRightRadius: j === breaksLenMin1 ? this._borderRadius : 0,
                        borderBottomRightRadius: j === breaksLenMin1 ? this._borderRadius : 0,
                        backgroundColor: hex(colorMap(br.bg)),
                        position: "absolute",
                        zIndex: 2 * index + 100,
                    },
                    0
                );

                let breakMin = chartContainer(this._base64uuid4 + this._dashSeg + index + "-gaugesMin-" + j, "segSubtitle");
                this._mainContainerDiv.appendChild(breakMin);
                aBreakMin.push(breakMin);

                //text ticks
                if (index === 0 || !sameTickScale) {
                    tlInit.set(
                        breakMin,
                        {
                            color: this._imageTextColor,
                            left: s + "%",
                            top: `${topSegment + this._gaugesSegmentHeight + this._titleHtPx}px`,
                            autoAlpha: 0,
                            width: e - s + "%",
                            height: this._ticksHtPx,
                            position: "absolute",
                            zIndex: 2 * index,
                            textAlign: "left",
                            text: this.getTickText(index, parseFloat(br.min)),
                            fontSize: "80%",
                        },
                        0
                    );
                }
                j++;
            });
            this._gaugesSegmentBreakBgs.push(aBreakBg);
            this._gaugesSegmentBreakMins.push(aBreakMin);

            //segmentLight
            tlInit.set(
                segmentDivLight,
                {
                    left: "0%",
                    width: "0%",
                    top: `${topSegment + this._titleHtPx}px`,
                    autoAlpha: 0,
                    height: this._gaugesSegmentHeight,
                    borderRadius: this._borderRadius,
                    zIndex: 2 * index + 1,
                    backgroundColor: customCssVariable("--cast-gaugelight-color"),
                    borderColor: playBoxRoStyle().backgroundColor,
                },
                0
            );

            //segmentDiv / tick
            tlInit.set(
                segmentDiv,
                {
                    left: "0%",
                    width: "0%",
                    top: `${topSegment + this._titleHtPx}px`,
                    autoAlpha: 0,
                    height: this._gaugesSegmentHeight,
                    borderRadius: this._borderRadius,
                    borderStyle: "solid",
                    borderLeftWidth: this._markerBorders + "px",
                    borderRightWidth: this._markerBorders + "px",
                    borderTopWidth: "0px",
                    borderBottomWidth: "0px",
                    zIndex: 2 * index + 1 + 200,
                    backgroundColor: tickColor,
                    borderColor: playBoxRoStyle().backgroundColor,
                },
                0
            );

            //segment subtitle is br.max of last
            if (index === 0 || !sameTickScale) {
                let tickText = this.getTickText(index, parseFloat(breaks(this._segments, index)[breaksLenMin1].max));
                tlInit.set(
                    segSubtitle,
                    {
                        color: this._imageTextColor,
                        right: "0%",
                        top: `${topSegment + this._gaugesSegmentHeight + this._titleHtPx}px`,
                        autoAlpha: 0,
                        text: tickText,
                        zIndex: 2 * index + 100,
                        fontSize: "80%",
                    },
                    0
                );
            }

            let fs,
                overrideFooter = textToDisplaySymbols(segmentLevelStrVal(this._segments, index, "footer"));
            if (overrideFooter.length === 0) {
                overrideFooter = ((100 * (parseFloat(value) - gaugeMin)) / (gaugeMax - gaugeMin)).toFixed(1) + "%";
            }
            overrideFooter = `<span class='singleItemlabel' style=color:white;background-color:${lighten(castColor(index), -0.4)}>${overrideFooter} </span>`;

            tlInit.set(
                segmentValues,
                {
                    color: this._imageTextColor,
                    right: "0%",
                    top: `${topSegment}px`,
                    autoAlpha: 0,
                    text: overrideFooter,
                    zIndex: 2 * index,
                    fontSize: fs,
                },
                0
            );
        }
        return tlInit;
    }

    getPrefixValueSuffix(index, value) {
        let valuePrefix = segmentLevelStrVal(this._segments, index, "valuePrefix");
        let valueSuffix = segmentLevelStrVal(this._segments, index, "valueSuffix");

        if (valueSuffix === "autoseconds") return autoseconds(value);

        let decimalPlaces = segmentLevelStrVal(this._segments, index, "decimals", 0);
        return valuePrefix + formatted(value, parseInt(decimalPlaces)) + singularPlural(valueSuffix, value, decimalPlaces);
    }

    getTickText(index, value) {
        let valueSuffix = segmentLevelStrVal(this._segments, index, "valueSuffix", "");
        if (valueSuffix === "") {
            let valuePrefix = segmentLevelStrVal(this._segments, index, "valuePrefix");
            let v = abbreviateNumber(value);
            return valuePrefix + v;
        } else {
            return this.getPrefixValueSuffix(index, value);
        }
    }

    gaugeMinMax(index) {
        let gaugeMin, gaugeMax;
        breaks(this._segments, index).forEach((br) => {
            if (typeof gaugeMin === "undefined") gaugeMin = parseFloat(br.min);
            if (typeof gaugeMax === "undefined") gaugeMax = parseFloat(br.max);
            if (gaugeMin > parseFloat(br.min)) gaugeMin = parseFloat(br.min);
            if (gaugeMax < parseFloat(br.max)) gaugeMax = parseFloat(br.max);
        });
        return { gaugeMin, gaugeMax };
    }

    gaugeTickColorRaw(index, value) {
        let breaksArray = breaks(this._segments, index);
        for (const br of breaksArray) {
            if (parseFloat(br.min) <= parseFloat(value) && parseFloat(value) <= parseFloat(br.max)) {
                return br.bg;
            }
        }
        if (breaksArray.length > 0) {
            if (parseFloat(value) <= parseFloat(breaksArray[0].min)) return breaksArray[0].bg;
            if (parseFloat(value) >= parseFloat(breaksArray[breaksArray.length - 1].max)) return breaksArray[breaksArray.length - 1].bg;
        }
        return customCssVariable("--cast-gauge-color");
    }

    autoSameTickScale() {
        let breaksString;

        for (let index = 0; index < this._segments.length; index++) {
            if (typeof breaksString === "undefined") {
                breaksString = JSON.stringify(breaks(this._segments, index));
            } else {
                if (breaksString !== JSON.stringify(breaks(this._segments, index))) return false;
            }
        }
        return true;
    }

    gaugeTickColor(index, value) {
        return hex(colorMap(this.gaugeTickColorRaw(index, value)));
    }

    //show segment opened. segTitle and segSubtitle are shown
    doHighlight(highlights) {
        highlights = checkInfographics(highlights);
        let tlSegment = gsap.timeline();
        let tlSubtitle = gsap.timeline();

        let highestSegment = 0;
        for (let index = 0; index < this._segments.length; index++) {
            let flt = segmentFloatVal(this._segments, index);
            if (flt > highestSegment) {
                highestSegment = flt;
            }
            flt = segmentFloatCompareVal(this._segments, index);
            if (flt > highestSegment) {
                highestSegment = flt;
            }
        }

        for (let index = 0; index < this._segments.length; index++) {
            if (Array.isArray(highlights) && highlights.length === 0) highlights = null;
            const hilite = !highlights || highlights.includes(index);

            const topSegment = this.getTop(index);

            tlSubtitle.to(
                this._gaugessegTitleDivs[index],
                {
                    autoAlpha: hilite ? 1 : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                },
                this.stagger(index)
            );

            let { gaugeMin, gaugeMax } = this.gaugeMinMax(index);
            let markerPosition = (100 * (segmentFloatVal(this._segments, index) - gaugeMin)) / (gaugeMax - gaugeMin);
            if (markerPosition > 100) markerPosition = 100; //garbage data

            //segmentLight
            tlSegment.to(
                this._gaugesSegmentDivLights[index],
                {
                    autoAlpha: hilite ? 0.375 : 0.2, // dimGraphicsOpacity(),
                    filter: graphicsHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    width: markerPosition + "%",
                    left: "0%",
                },
                this.stagger(index)
            );

            tlSegment.to(
                this._gaugesSegmentDivs[index],
                {
                    autoAlpha: hilite ? 1 : dimGraphicsOpacity(),
                    filter: graphicsHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    width: this._markerMinWidth + "%",
                    left: markerPosition - this._markerMinWidth + "%",
                },
                this.stagger(index)
            );

            let j = 0;
            breaks(this._segments, index).forEach((br) => {
                //colored bars
                tlSegment.to(
                    this._gaugesSegmentBreakBgs[index][j],
                    {
                        autoAlpha: hilite ? 1 : dimGraphicsOpacity(),
                        filter: graphicsHighlightFilter(hilite),
                        transform: "translateZ(0)",
                    },
                    this.stagger(index)
                );

                //ticks
                tlSegment.to(
                    this._gaugesSegmentBreakMins[index][j],
                    {
                        autoAlpha: hilite ? 1 : dimTextOpacity(),
                        filter: textHighlightFilter(hilite),
                        transform: "translateZ(0)",
                    },
                    this.stagger(index)
                );

                j++;
            });

            tlSubtitle.to(
                this._gaugessegSubtitleDivs[index],
                {
                    autoAlpha: hilite ? 1 : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                },
                this.stagger(index)
            );

            tlSubtitle.to(
                this._gaugesSegmentValueDivs[index],
                {
                    autoAlpha: hilite ? 1 : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
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
        // if (window.location.href.includes("localhost:5001")) {
        // this._segments = this._segments.slice(6, 9) //remove segments
        // or
        // this._segments.push(this._segments[0]); //add a segment
        // this._segments.push(this._segments[1]); //add a segment
        // this._segments.push(this._segments[1]); //add a segment
        // this._segments.push(this._segments[1]); //add a segment
        // this._segments.push(this._segments[1]); //add a segment
        // this._segments.push(this._segments[1]); //add a segment
        // this._segments.push(this._segments[1]); //add a segment
        // this._segments.push(this._segments[1]); //add a segment
        // }

        switch (this._segments.length) {
            case 1:
                this._marginIntraSegmentPx = 50;
                break;
            case 2:
            case 3:
                this._marginIntraSegmentPx = 46;
                break;
            case 4:
            case 5:
            case 6:
                this._marginIntraSegmentPx = 38;
                break;
            case 7:
            case 8:
                this._marginIntraSegmentPx = 14;
                break;
            default:
                this._marginIntraSegmentPx = 1;
                break;
        }
        if (this._inlineImg && this._segments.length > 4) this._marginIntraSegmentPx = this._marginIntraSegmentPx / 4;

        // console.log(this._segments.length, this._marginIntraSegmentPx, this._segHt);
    }
}

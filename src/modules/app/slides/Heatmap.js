/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

/* eslint-disable */
import BaseChart from "./BaseChart";

export default class Heatmap extends BaseChart {
    constructor(story, chartID, source = null) {
        if (!story) throw new ErrorEvent("Invalid story");
        super(story, chartID, source, "heatmap");

        this._borderRadius = 5;
        this._topPx = chartTop();
        this._borderWidth = "1px";
        this._verticalMarginPx = 8;
        this._bgColor = [];
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
        this._mainContainerDiv = chartContainer(this._base64uuid4, "heatmapContainer baseContainer responsiveHeight");
        this._SegmentDivs = [];
        this._SegmentBackgrounds = [];
        this._segTitle = [];
        this._segHt = 24;

        let tlInit = gsap.timeline();
        this.setupSceneTheme(tlInit);

        let chartTitle = chartContainer(this._base64uuid4 + "-chartTitle", "chartTitle");
        this._mainContainerDiv.appendChild(chartTitle);

        tlInit.set(chartTitle, {
            left: "0%",
            top: `${chartTitleTop()}px`,
            autoAlpha: 1,
            width: "100%",
            text: chartHeadingTitle(gStory, this._chartIdentifier, "Heatmap"),
            color: this._imageTextColor,
            zIndex: 2,
        });

        this._rawValues = [];
        //figure out: this._highestSeg, this._lowestSeg, this._omitRowHeaders
        for (let index = 0; index < this._segments.length; index++) {
            let val = segmentLevelStrVal(this._segments, index, "value", Number.NEGATIVE_INFINITY);
            if (isNaN(val)) val = 0;
            this._rawValues.push(parseFloat(val));

            let flt = val;
            if (index === 0 || flt > this._highestSeg) this._highestSeg = flt;
            if (index === 0 || flt < this._lowestSeg) this._lowestSeg = flt;
            if (index === 0) this._omitRowHeaders = true;
            if (this._omitRowHeaders && segmentLevelStrVal(this._segments, index, "title").length > 0) this._omitRowHeaders = false;
        }

        let rowHeaderWidthPercent = this._omitRowHeaders ? 0 : 33;
        this.calcBarHeight();
        this._columns = columns(this._chartIdentifier);
        this._SegmentWidth = (0.8 * (100 - rowHeaderWidthPercent)) / this._columns;
        this._horizontalMarginPx = (0.2 * (100 - rowHeaderWidthPercent)) / this._columns;

        let iterations = 40;
        let k = 10;
        let means = kMeans(iterations, this._rawValues, this._lowestSeg, this._highestSeg, k);
        let centers = centeroids(this._rawValues, means);
        let meansArr = [];
        means.forEach((m) => meansArr.push(m.val));
        meansArr.sort((a, b) => a - b);
        meansArr = Array.from(new Set(meansArr));
        for (let centeroidIndex = 0; centeroidIndex < centers.size; centeroidIndex++) {
            this._bgColor.push(castGradientColor(meansArr.indexOf(centers.get(centeroidIndex)), meansArr.length, this.gradientTheme()));
        }

        // console.log(means);
        // console.log(centers);
        // console.log(meansArr);
        // console.log(this._bgColor);
        //Centers has the centroid for each index
        //this._means has the ordered centroids for choosing colors

        this._narrationBox = setupNarrationBox();

        for (let index = 0; index < this._segments.length; index++) {
            let segmentDiv = chartContainer(this._base64uuid4 + this._dashSeg + index + "-heatmap", "segmentBar");
            let segmentBackground = chartContainer(this._base64uuid4 + this._dashSeg + index + "-heatmapBack", "positionAbsolute");
            let segTitle = chartContainer(this._base64uuid4 + this._dashSeg + index + "-heatmap-RowTitle", "segTitle");

            this._mainContainerDiv.appendChild(segmentDiv);
            this._mainContainerDiv.appendChild(segmentBackground);
            this._mainContainerDiv.appendChild(segTitle);

            this._SegmentDivs.push(segmentDiv);
            this._SegmentBackgrounds.push(segmentBackground);
            this._segTitle.push(segTitle);

            //Rowtitle
            let leftPercent = 0;
            if (index % this._columns === 0) {
                let rowHdr = segmentLevelStrVal(this._segments, index, "title", parseInt(index / this._columns).toString());
                tlInit.set(segTitle, {
                    color: this._imageTextColor,
                    left: leftPercent + "%",
                    // top: `${topSegment + this._titleHtPx}px`,
                    top: startingTop() + "px",
                    autoAlpha: 0,
                    filter: textHighlightFilter(false),
                    transform: "translateZ(0)",
                    text: this._omitRowHeaders ? "" : rowHdr,
                    width: rowHeaderWidthPercent + "%",
                    height: this._segHt + this._verticalMarginPx + "px",
                    zIndex: 2 * index,
                    lineHeight: this._segHt + "px",
                    fontSize: "12px",
                });
            }

            let grid = !!sceneLevelBool(this._chartIdentifier, "grid");
            //segmentBackground
            leftPercent = rowHeaderWidthPercent + (index % this._columns) * (this._SegmentWidth + this._horizontalMarginPx) + this._SegmentWidth / 2;
            tlInit.set(segmentBackground, {
                left: leftPercent + "%",
                // top: `${topSegment + this._titleHtPx}px`,
                top: startingTop() + "px",
                autoAlpha: 0,
                filter: graphicsHighlightFilter(false),
                transform: "translateZ(0)",
                width: this._SegmentWidth + this._horizontalMarginPx + "%",
                height: this._segHt + this._verticalMarginPx + "px",
                // backgroundColor: "red",//playBoxRoStyle().backgroundColor,
                borderColor: castColor(),
                borderStyle: "solid",
                borderTopWidth: index % this._columns > this._columns - 2 || index > this._segments.length - 2 ? "0px" : grid ? "1px" : "0px",
                borderRightWidth: "0px",
                borderBottomWidth: "0px",
                borderLeftWidth: index >= this._segments.length - this._columns ? "0px" : grid ? "1px" : "0px",
                borderRadius: "0px",
                zIndex: 2 * index,
            });

            let val = segmentFloatVal(this._segments, index);
            let formattedVal = segmentLevelStrVal(this._segments, index, "prefix") + formatted(parseFloat(val), 1, true) + segmentLevelStrVal(this._segments, index, "suffix");

            //segment //////////////////////////////////
            leftPercent = rowHeaderWidthPercent + (index % this._columns) * (this._SegmentWidth + this._horizontalMarginPx);
            let segColor = this._rawValues[index] === Number.NEGATIVE_INFINITY ? "inherit" : this._bgColor[index];
            let textColor = this._rawValues[index] === Number.NEGATIVE_INFINITY ? playBoxRoStyle().color : nodeTextColor(this.gradientTheme());
            let fontSize = this._rawValues[index] === Number.NEGATIVE_INFINITY ? "12px" : "10px";

            switch (chartStyle(this._story, this._chartIdentifier, "heatmap")) {
                default:
                case "heatmap":
                    tlInit.set(segmentDiv, {
                        top: startingTop() + "px",
                        autoAlpha: dimGraphicsOpacity(),
                        filter: graphicsHighlightFilter(),
                        transform: "translateZ(0)",
                        backgroundColor: segColor,
                        text: "",
                        fontSize: fontSize,
                        color: textColor,
                        zIndex: 2 * index + 1,
                        lineHeight: this._segHt + "px",
                        borderRadius: this._borderRadius + "px",
                        left: leftPercent + "%",
                        width: this._SegmentWidth + "%",
                        height: this._segHt + "px",
                    });
                    break;
                case "punchcardFixed":
                    tlInit.set(segmentDiv, {
                        top: startingTop() + "px",
                        autoAlpha: dimGraphicsOpacity(),
                        filter: graphicsHighlightFilter(),
                        transform: "translateZ(0)",
                        backgroundColor: segColor,
                        text: "",
                        fontSize: fontSize,
                        color: textColor,
                        zIndex: 2 * index + 1,
                        lineHeight: this._segHt + "px",
                        borderRadius: "50%",
                        height: this._segHt + "px",
                        width: this._segHt + "px",
                        left: `calc(${leftPercent}% + ${this._SegmentWidth / 2}% - ${this._segHt / 2}px)`,
                    });
                    break;
            }
        }
        return tlInit;
    }

    gradientTheme() {
        let gt = sceneLevelStrVal(this._chartIdentifier, "gradientTheme");
        if (gt.length > 0) return gt;
        return "anthony";
    }

    textValue(index) {
        let val = segmentFloatVal(this._segments, index);
        let strval = segmentLevelStrVal(this._segments, index, "strval", "");
        let showNodeLabel = !!sceneLevelBool(this._chartIdentifier, "showNodeLabel");

        let t;
        if (this._rawValues[index] === Number.NEGATIVE_INFINITY && strval.length > 0) {
            t = textToDisplaySymbols(strval);
        } else if (this._rawValues[index] === Number.NEGATIVE_INFINITY) {
            t = "";
        } else {
            let p = sceneLevelStrVal(this._chartIdentifier, "prefix");
            let s = sceneLevelStrVal(this._chartIdentifier, "suffix");
            t = showNodeLabel ? p + abbreviateNumber(val.toString()) + s : "";
        }
        return t;
    }

    getTop(index) {
        return this._topPx + this._inlineImageHeight + this._inlineImageHeightLowerMargin + parseInt(index / this._columns) * (this._segHt + this._verticalMarginPx);
    }

    //show segment opened. segTitle and segSubtitle are shown
    doHighlight(highlights) {
        highlights = checkInfographics(highlights);
        let tlSegment = gsap.timeline();
        let tlBackground = gsap.timeline();

        let rowHeadersToHighlight = new Set();

        for (let index = 0; index < this._segments.length; index++) {
            if (Array.isArray(highlights) && highlights.length === 0) highlights = null;
            const hilite = !highlights || highlights.includes(index);
            if (hilite) rowHeadersToHighlight.add(parseInt(index / this._columns));
        }

        for (let index = 0; index < this._segments.length; index++) {
            if (Array.isArray(highlights) && highlights.length === 0) highlights = null;
            const hilite = !highlights || highlights.includes(index);

            let topSegment = this.getTop(index);

            if (index % this._columns === 0) {
                const hilite2 = !highlights || rowHeadersToHighlight.has(parseInt(index / this._columns));
                tlSegment.add(
                    gsap.to(this._segTitle[index], {
                        autoAlpha: 1, // hilite2 ? 1 : textHighlightFilter(),
                        filter: textHighlightFilter(hilite2),
                        transform: "translateZ(0)",
                        top: topSegment + "px",
                    }),
                    0
                ); //this.stagger(parseInt(index / this._columns)));
            }

            //segment
            tlSegment.add(
                gsap.to(this._SegmentDivs[index], {
                    autoAlpha: hilite ? 1 : dimGraphicsOpacity(),
                    filter: graphicsHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    top: topSegment + "px",
                    text: this.textValue(index),
                    // width: wF + "%",
                }),
                0
            ); //this.stagger(parseInt(index / this._columns)));

            //background
            tlBackground.add(
                gsap.to(this._SegmentBackgrounds[index], {
                    autoAlpha: dimGraphicsOpacity(),
                    filter: graphicsHighlightFilter(false),
                    transform: "translateZ(0)",
                    top: topSegment + this._segHt / 2 + "px",
                    // width: wF + "%",
                }),
                0
            ); //this.stagger(parseInt(index / this._columns)));
        }

        let addForLastRow = 0;
        if (this._segments.length % this._columns !== 0) {
            addForLastRow += this._segHt + this._verticalMarginPx;
        }

        addNarrationTween(tlSegment, this._narrationBox);

        rowHeadersToHighlight.clear();
        return gsap.timeline().add([tlSegment, tlBackground]);
    }

    calcBarHeight() {}
}

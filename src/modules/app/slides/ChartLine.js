/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

/* eslint-disable */
import BaseChart from "./BaseChart";

export default class ChartLine extends BaseChart {
    constructor(story, chartID, source = null) {
        if (!story) throw new ErrorEvent("Invalid story");

        super(story, chartID, source, "line");

        this._segHt = 540;
        this._textSegmentHeight = 16;
        this._topPx = chartTop();
        this._marginIntraSegmentPx = 8;
        this._marginTopPx = 10;
    }

    sunset(forward = 1, waitForUser = false, chartID = null) {
        if (this._sunsetCalled) {
            return;
        }
        this._sunsetCalled = true;
        //IMAGE IMAGE
        // let tlSunset = gsap.timeline()
        // this.transition(chartID, tlSunset, forward);
        this.unsetSceneTheme(chartID, forward);
    }

    animationSetAndInlineImage(tl) {
        if (!this._animationSet) {
            tl.add(this.animationSet());

            this._inlineImgContainer = chartContainer(this._base64uuid4 + "-inlineImg", "inlineImg");
            this._optionsInlineImageContainer.appendChild(this._inlineImgContainer);
            tl.add(
                gsap.set(
                    this._inlineImgContainer,
                    {
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
                        position: "static",
                    },
                    0
                )
            );
        }
    }

    doAnimationStep(nextStep, animationDoneCallback) {
        let tl = gsap.timeline();
        this._animationSet || this.animationSetAndInlineImage(tl);
        tl.add(this.doHighlight(nextStep.highlight, nextStep.highlightData));
        tl.play().call(animationDoneCallback.bind(this));
    }

    getTop(index) {
        return (
            this._marginTopPx +
            this._topPx +
            this._inlineImageHeight +
            this._inlineImageHeightLowerMargin +
            index * (this._textSegmentHeight + this._textSegmentHeight + this._segHt + this._marginIntraSegmentPx)
        );
    }

    percentValue(value, min, max) {
        let r = 100 * (value / (max - min));
        if (r < 0) r = 0;
        if (r > 100) r = 100;
        return r;
    }

    animationSet() {
        this._mainContainerDiv = chartContainer(this._base64uuid4, "lineContainer responsiveHeight");
        this._upperDivs = [];
        this._upperLeftDivs = [];
        this._upperRightDivs = [];
        this._segmentSparkDivs = [];
        this._lowerDivs = [];
        this._lowerLeftDivs = [];
        this._lowerMidDivs = [];
        this._lowerRightDivs = [];

        this._yMinSegDivs = [];
        this._yMinDivs = [];

        this._x1Highlighters = [];
        this._x2Highlighters = [];
        this._x3Highlighters = [];

        this._y1Highlighters = [];
        this._y2Highlighters = [];
        this._y3Highlighters = [];

        let tlInit = gsap.timeline();
        this.setupSceneTheme(tlInit);
        this.calcBarHeight();
        this._highlightLineColor = hexWithOpacity(this._imageTextColor, 0.5);

        let chartTitle = chartContainer(this._base64uuid4 + "-chartTitle", "chartTitle");
        this._mainContainerDiv.appendChild(chartTitle);

        tlInit.set(chartTitle, {
            left: "0%",
            top: `${chartTitleTop()}px`,
            autoAlpha: 1,
            width: "100%",
            text: chartHeadingTitle(gStory, this._chartIdentifier, "Area & Line"),
            color: this._imageTextColor,
            zIndex: 2,
        });

        this._optionsInlineImageContainer = elementOfTypeAndClass("div", "options_inline_image_container");
        this._mainContainerDiv.appendChild(this._optionsInlineImageContainer);

        this._lineContainerContent = elementOfTypeAndClass("div", "lineContainerContent");
        this._mainContainerDiv.appendChild(this._lineContainerContent);

        this._narrationBox = setupNarrationBox();

        for (let index = 0; index < this._segments.length; index++) {
            let upperDiv = chartContainer(this._base64uuid4 + this._dashSeg + index + "-us", "seg");
            let upperLeft = chartContainer(this._base64uuid4 + this._dashSeg + index + "-ul", "left lefttop");
            let upperRight = chartContainer(this._base64uuid4 + this._dashSeg + index + "-ur", "right");

            let segmentSpark = chartContainer(this._base64uuid4 + this._dashSeg + index + "-c", "center");
            let lowerDiv = chartContainer(this._base64uuid4 + this._dashSeg + index + "-ls", "seg");
            let yMinSegDiv = chartContainer(this._base64uuid4 + this._dashSeg + index + "-yMinSeg", "seg");
            let lowerLeft = chartContainer(this._base64uuid4 + this._dashSeg + index + "-ll", "left");
            let lowerMid = chartContainer(this._base64uuid4 + this._dashSeg + index + "-lm", "mid");
            let lowerRight = chartContainer(this._base64uuid4 + this._dashSeg + index + "-lr", "right");
            let yMinDiv = chartContainer(this._base64uuid4 + this._dashSeg + index + "-yMin", "right");

            let x1Highlighter = chartContainer(this._base64uuid4 + this._dashSeg + index + "-xh1", "xHighlighter");
            let x2Highlighter = chartContainer(this._base64uuid4 + this._dashSeg + index + "-xh2", "xHighlighter secondary");
            let x3Highlighter = chartContainer(this._base64uuid4 + this._dashSeg + index + "-xh3", "xHighlighter secondary");

            let y1Highlighter = chartContainer(this._base64uuid4 + this._dashSeg + index + "-yh1", "yHighlighter");
            let y2Highlighter = chartContainer(this._base64uuid4 + this._dashSeg + index + "-yh2", "yHighlighter secondary");
            let y3Highlighter = chartContainer(this._base64uuid4 + this._dashSeg + index + "-yh3", "yHighlighter secondary");

            yMinSegDiv.appendChild(yMinDiv);

            [lowerLeft, lowerMid, lowerRight, x1Highlighter, x2Highlighter, x3Highlighter, y1Highlighter, y2Highlighter, y3Highlighter].forEach((e) => lowerDiv.appendChild(e));
            [upperLeft, upperRight].forEach((e) => upperDiv.appendChild(e));

            this._lineContainerContent.appendChild(upperDiv);
            this._lineContainerContent.appendChild(segmentSpark);
            this._lineContainerContent.appendChild(lowerDiv);

            this._upperDivs.push(upperDiv);
            this._upperLeftDivs.push(upperLeft);
            this._upperRightDivs.push(upperRight);

            this._segmentSparkDivs.push(segmentSpark);
            this._lowerDivs.push(lowerDiv);
            this._lowerLeftDivs.push(lowerLeft);
            this._lowerMidDivs.push(lowerMid);
            this._lowerRightDivs.push(lowerRight);

            this._x1Highlighters.push(x1Highlighter);
            this._x2Highlighters.push(x2Highlighter);
            this._x3Highlighters.push(x3Highlighter);

            this._y1Highlighters.push(y1Highlighter);
            this._y2Highlighters.push(y2Highlighter);
            this._y3Highlighters.push(y3Highlighter);

            this._yMinSegDivs.push(yMinSegDiv);
            this._yMinDivs.push(yMinDiv);

            this._lineContainerContent.appendChild(yMinSegDiv);

            let areaPoints = areaDataPoints(this._segments, index, "areaData");
            let area2Points = areaDataPoints(this._segments, index, "area2Data");
            let lineLowPoints = lineLowDataPoints(this._segments, index);
            let linePoints = lineDataPoints(this._segments, index);
            let lineHighPoints = lineHighDataPoints(this._segments, index);
            let maxXPoint = segmentLevelStrVal(this._segments, index, "maxXPoint");
            let maxYPoint = segmentLevelStrVal(this._segments, index, "maxYPoint");
            let { minX, minY, maxX, maxY } = minMaxAreaLine(areaPoints, area2Points, lineLowPoints, linePoints, lineHighPoints, maxXPoint, maxYPoint);

            let areaDataColor;
            let area2DataColor;
            let lineLowColor;
            let lineColor;
            let lineHighColor;
            ({ lineLowColor, lineColor, lineHighColor, areaDataColor, area2DataColor } = this._getColors(index));

            let decimalPlaces = parseInt(segmentLevelStrVal(this._segments, index, "decimals", "0"));
            let yMinLabel =
                segmentLevelStrVal(this._segments, index, "prefix") +
                formatted(minY, decimalPlaces) +
                singularPlural(segmentLevelStrVal(this._segments, index, "suffix"), minY, decimalPlaces);
            let yMaxLabel =
                segmentLevelStrVal(this._segments, index, "prefix") +
                formatted(maxY, decimalPlaces) +
                singularPlural(segmentLevelStrVal(this._segments, index, "suffix"), maxY, decimalPlaces);

            //upper Left
            tlInit.set(upperLeft, {
                color: this._imageTextColor,
                autoAlpha: 0,
                top: startingTop() + "px",
                text: getIndicatorOfColor(areaDataColor) + textToDisplaySymbols(segmentLevelStrVal(this._segments, index, "title")),
                zIndex: 2 * index + 1,
            });

            this.setElement(tlInit, lowerLeft, index, "left");
            this.setElement(tlInit, lowerMid, index, "middle");
            this.setElement(tlInit, lowerRight, index, "right");

            [x1Highlighter, x2Highlighter, x3Highlighter].forEach((e) => this.setXHighlighter(tlInit, e, index));
            [y1Highlighter, y2Highlighter, y3Highlighter].forEach((e) => this.setYHighlighter(tlInit, e, index));

            //segment center
            let smoothing = parseFloat(segmentLevelStrVal(this._segments, index, "smoothing", "0.03"));

            const getSvg = getSvgAreaLine(
                areaPoints,
                area2Points,
                lineLowPoints,
                linePoints,
                lineHighPoints,
                smoothing,
                1000,
                1000,
                this._segHt,
                lighten(castColor(index), parseFloat(customCssVariable("--cast-lightenSpark"))),
                lighten(castColor(index), parseFloat(customCssVariable("--cast-lightenSpark"))),
                this._base64uuid4 + this._dashSeg + index + "-c-svg",
                maxXPoint,
                maxYPoint,
                this._segments.length < 2 ? 0.5 : 1,
                playBoxRoStyle().color,
                lineLowColor,
                lineColor,
                lineHighColor,
                areaDataColor,
                area2DataColor
            );

            tlInit.set(segmentSpark, {
                autoAlpha: 0,
                // top: `${this._topPx}px`,
                top: startingTop() + "px",
                zIndex: -2 * index + 1,
                text: `<div style='height:${this._segHt}px;' class='spark'>` + getSvg.outerHTML + "</div>",
            });

            //upper right + yMax
            tlInit.set(upperRight, {
                color: this._imageTextColor,
                autoAlpha: 0,
                top: startingTop() + "px",
                text:
                    textToDisplaySymbols(segmentLevelStrVal(this._segments, index, "footer")) +
                    `<br><span style='opacity:${markerTextOpacity()}; text-shadow: 0px 0px 4px ${playBoxRoStyle().backgroundColor}'>` +
                    textToDisplaySymbols(`${yMaxLabel}` + "</span>&nbsp;"),
                zIndex: 2 * index + 2,
            });

            //yMin
            tlInit.set(yMinDiv, {
                autoAlpha: 0,
                top: startingTop() + "px",
                // textShadow: "0px 0px 4px " + playBoxRoStyle().backgroundColor,
                text: textToDisplaySymbols(`${yMinLabel}`),
                zIndex: 2 * index + 1,
            });
        }
        return tlInit;
    }

    setElement(tlInit, e, index, location) {
        tlInit.set(e, {
            color: this._imageTextColor,
            autoAlpha: 0,
            top: startingTop() + "px",
            text: textToDisplaySymbols(segmentLevelStrVal(this._segments, index, location)) /* + "⇥"*/,
            zIndex: 2 * +1,
            fontSize: 12,
        });
    }

    setYHighlighter(tlInit, y1Highlighter, index) {
        tlInit.set(y1Highlighter, {
            autoAlpha: 0,
            top: startingTop() + "px",
            width: "100%",
            left: 0,
            borderStyle: "solid",
            borderTopWidth: 0,
            borderBottomWidth: 0,
            zIndex: 2 * index + 100,
        });
    }

    setXHighlighter(tlInit, x1Highlighter, index) {
        tlInit.set(x1Highlighter, {
            autoAlpha: 0,
            top: startingTop() + "px",
            borderStyle: "solid",
            borderWidth: 0,
            zIndex: 2 * index + 100,
        });
    }

    _getColors(index) {
        let areaDataColor = segmentLevelStrVal(this._segments, index, "areaDataColor", castColor(index));
        let area2DataColor = segmentLevelStrVal(this._segments, index, "area2DataColor", castColor(index + 1));
        let lineColor = segmentLevelStrVal(this._segments, index, "lineColor", customCssVariable("--cast-sparklines-color"));
        let lineLowColor = segmentLevelStrVal(this._segments, index, "lineLowColor", customCssVariable("--cast-sparklines-color"));
        let lineHighColor = segmentLevelStrVal(this._segments, index, "lineHighColor", customCssVariable("--cast-sparklines-color"));

        if (lineColor === "red") lineColor = customCssVariable("--cast-red");
        if (lineColor === "green") lineColor = customCssVariable("--cast-green");
        if (lineColor === "yellow") lineColor = customCssVariable("--cast-yellow");
        if (lineColor === "blue") lineColor = customCssVariable("--cast-blue");
        if (lineColor === "pink") lineColor = customCssVariable("--cast-pink");

        if (lineLowColor === "red") lineLowColor = customCssVariable("--cast-red");
        if (lineLowColor === "green") lineLowColor = customCssVariable("--cast-green");
        if (lineLowColor === "yellow") lineLowColor = customCssVariable("--cast-yellow");
        if (lineLowColor === "blue") lineLowColor = customCssVariable("--cast-blue");
        if (lineLowColor === "pink") lineLowColor = customCssVariable("--cast-pink");

        if (lineHighColor === "red") lineHighColor = customCssVariable("--cast-red");
        if (lineHighColor === "green") lineHighColor = customCssVariable("--cast-green");
        if (lineHighColor === "yellow") lineHighColor = customCssVariable("--cast-yellow");
        if (lineHighColor === "blue") lineHighColor = customCssVariable("--cast-blue");
        if (lineHighColor === "pink") lineHighColor = customCssVariable("--cast-pink");

        if (areaDataColor === "red") areaDataColor = customCssVariable("--cast-red");
        if (areaDataColor === "green") areaDataColor = customCssVariable("--cast-green");
        if (areaDataColor === "yellow") areaDataColor = customCssVariable("--cast-yellow");
        if (areaDataColor === "blue") areaDataColor = customCssVariable("--cast-blue");
        if (areaDataColor === "pink") areaDataColor = customCssVariable("--cast-pink");

        if (area2DataColor === "red") area2DataColor = customCssVariable("--cast-red");
        if (area2DataColor === "green") area2DataColor = customCssVariable("--cast-green");
        if (area2DataColor === "yellow") area2DataColor = customCssVariable("--cast-yellow");
        if (area2DataColor === "blue") area2DataColor = customCssVariable("--cast-blue");
        if (area2DataColor === "pink") area2DataColor = customCssVariable("--cast-pink");
        return { lineLowColor, lineColor, lineHighColor, areaDataColor, area2DataColor };
    }

    //show segment opened. segTitle and segSubtitle are shown
    doHighlight(highlights, highlightData) {
        highlights = checkInfographics(highlights);
        if (this._inlineImg !== "") {
            gsap.to(this._inlineImgContainer, {
                top: `${this.getTop(0) - this._inlineImageHeight - this._inlineImageHeightLowerMargin}px`,
                autoAlpha: 1,
                scale: 1,
                delay: 0.3,
            });
        }

        let tlInit = gsap.timeline();
        let tlSegment = gsap.timeline();
        let tlSegmentLeft = gsap.timeline();
        let tlsegmentSpark = gsap.timeline();
        let tlSegmentRight = gsap.timeline();

        for (let index = 0; index < this._segments.length; index++) {
            if (Array.isArray(highlights) && highlights.length === 0) highlights = null;
            const hilite = !highlights || highlights.includes(index);

            const topOfRow = this.getTop(index);
            const opacityYAxisLabels = 0.85;

            tlSegmentLeft.add(
                gsap.to(this._upperLeftDivs[index], {
                    autoAlpha: hilite ? 1 : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    top: topOfRow, //`${topOfRow}px`,
                }),
                this.stagger(index)
            );

            tlSegmentLeft.add(
                gsap.to(this._lowerLeftDivs[index], {
                    autoAlpha: hilite ? opacityYAxisLabels : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    top: topOfRow + this._segHt + this._textSegmentHeight, //`${topOfRow}px`,
                }),
                this.stagger(index)
            );
            tlSegmentLeft.add(
                gsap.to(this._lowerMidDivs[index], {
                    autoAlpha: hilite ? opacityYAxisLabels : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    top: topOfRow + this._segHt + this._textSegmentHeight, //`${topOfRow}px`,
                }),
                this.stagger(index)
            );

            let areaPoints = areaDataPoints(this._segments, index, "areaData"),
                area2Points = areaDataPoints(this._segments, index, "area2Data"),
                lineLowPoints = lineLowDataPoints(this._segments, index),
                linePoints = lineDataPoints(this._segments, index),
                lineHighPoints = lineHighDataPoints(this._segments, index),
                maxXPoint = segmentLevelStrVal(this._segments, index, "maxXPoint"),
                maxYPoint = segmentLevelStrVal(this._segments, index, "maxYPoint"),
                xHighlighter = [
                    { s: "", l: "" },
                    { s: "", l: "" },
                    { s: "", l: "" },
                ],
                yHighlighter = [
                    { s: "", l: "" },
                    { s: "", l: "" },
                    { s: "", l: "" },
                ];

            if (highlights && highlights.includes(index) && highlightData && highlightData[index]) {
                if (Array.isArray(highlightData[index])) {
                    xyHighlightFromArray(xHighlighter, 0, index, yHighlighter);
                    if (highlightData[index].length > 1) xyHighlightFromArray(xHighlighter, 1, index, yHighlighter);
                    if (highlightData[index].length > 2) xyHighlightFromArray(xHighlighter, 2, index, yHighlighter);
                } else {
                    xyHightlight(xHighlighter, index, yHighlighter);
                }
            }
            let { minX, minY, maxX, maxY } = minMaxAreaLine(areaPoints, area2Points, lineLowPoints, linePoints, lineHighPoints, maxXPoint, maxYPoint);

            this.xVerticalHighlight(xHighlighter[0], maxX, tlInit, index, hilite, topOfRow, this._x1Highlighters[index]);
            this.xVerticalHighlight(xHighlighter[1], maxX, tlInit, index, hilite, topOfRow, this._x2Highlighters[index]);
            this.xVerticalHighlight(xHighlighter[2], maxX, tlInit, index, hilite, topOfRow, this._x3Highlighters[index]);

            this.yHorizontalHighlight(yHighlighter[0], minY, maxY, tlInit, index, hilite, topOfRow, this._y1Highlighters[index]);
            this.yHorizontalHighlight(yHighlighter[1], minY, maxY, tlInit, index, hilite, topOfRow, this._y2Highlighters[index]);
            this.yHorizontalHighlight(yHighlighter[2], minY, maxY, tlInit, index, hilite, topOfRow, this._y3Highlighters[index]);

            tlsegmentSpark.add(
                gsap.to(this._segmentSparkDivs[index], {
                    autoAlpha: hilite ? 1 : dimGraphicsOpacity(),
                    filter: graphicsHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    top: topOfRow + this._textSegmentHeight, //`${topOfRow}px`,
                }),
                this.stagger(index)
            );

            tlSegmentRight.add(
                gsap.to(this._upperRightDivs[index], {
                    autoAlpha: hilite ? 1 : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    top: topOfRow, //`${topOfRow}px`,
                }),
                this.stagger(index)
            );
            tlSegmentRight.add(
                gsap.to(this._yMinDivs[index], {
                    autoAlpha: hilite ? markerTextOpacity() : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    top: topOfRow + this._segHt + this._textSegmentHeight - 16, //`${topOfRow}px`,
                }),
                this.stagger(index)
            );
            tlSegmentRight.add(
                gsap.to(this._lowerRightDivs[index], {
                    autoAlpha: hilite ? opacityYAxisLabels : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    top: topOfRow + this._segHt + this._textSegmentHeight, //`${topOfRow}px`,
                }),
                this.stagger(index)
            );
        }

        addNarrationTween(tlSegment, this._narrationBox);

        return gsap.timeline().add([tlInit, tlSegment, tlSegmentLeft, tlsegmentSpark, tlSegmentRight]);

        function xyHightlight(xHighlighter, index, yHighlighter) {
            const i = 0;
            xHighlighter[i] = { s: highlightData[index].xHighlighter, l: highlightData[index].xHighlighterLabel };
            yHighlighter[i] = { s: highlightData[index].yHighlighter, l: highlightData[index].yHighlighterLabel };
        }

        function xyHighlightFromArray(xHighlighter, i, index, yHighlighter) {
            xHighlighter[i] = { s: highlightData[index][i].xHighlighter, l: highlightData[index][i].xHighlighterLabel };
            yHighlighter[i] = { s: highlightData[index][i].yHighlighter, l: highlightData[index][i].yHighlighterLabel };
        }
    }

    xVerticalHighlight(xHighlighter, maxX, tlInit, index, hilite, topOfRow, xH) {
        let leftPercent = this.percentValue(parseFloat(xHighlighter.s), 0, maxX);
        if (xHighlighter.s === "") leftPercent = 0;

        if (leftPercent > 40) {
            tlInit.set(
                xH,
                {
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    top: this._textSegmentHeight + topOfRow,
                    height: this._segHt + "px",
                    autoAlpha: hilite && typeof xHighlighter.s !== "undefined" && xHighlighter.s !== "" ? 0.8 : 0,
                    backgroundColor: "transparent",
                    borderColor: this._highlightLineColor,
                    text: !xHighlighter.l || xHighlighter.l.length === 0 ? "" : `<span class=right>` + xHighlighter.l + "</span>",
                    borderLeftWidth: 0,
                    borderRightWidth: "2px",
                    clearProps: "left", //TODO: https://greensock.com/forums/topic/35971-clearprops-issue/?do=findComment&comment=180095
                },
                0
            );
            tlInit.add(
                gsap.to(xH, {
                    right: 100 - leftPercent + "%",
                    textAlign: "right",
                }),
                0
            );
        } else {
            tlInit.set(
                xH,
                {
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    top: this._textSegmentHeight + topOfRow,
                    height: this._segHt + "px",
                    autoAlpha: hilite && typeof xHighlighter.s !== "undefined" && xHighlighter.s !== "" ? 0.8 : 0,
                    backgroundColor: "transparent",
                    borderColor: this._highlightLineColor,
                    text: !xHighlighter.l || xHighlighter.l.length === 0 ? "" : `<span class=left>` + xHighlighter.l + "</span>",
                    borderLeftWidth: "2px",
                    borderRightWidth: 0,
                    clearProps: "right", //TODO: https://greensock.com/forums/topic/35971-clearprops-issue/?do=findComment&comment=180095
                },
                0
            );
            tlInit.add(
                gsap.to(xH, {
                    left: leftPercent + "%",
                    textAlign: "left",
                }),
                0
            );
        }
    }

    yHorizontalHighlight(yHighlighter, minY, maxY, tlInit, index, hilite, topOfRow, yH) {
        let theTop = this.percentValue(parseFloat(yHighlighter.s), minY, maxY);
        if (yHighlighter.s === "") theTop = 100;
        theTop = 100 - theTop;
        theTop *= this._segHt / 100;

        tlInit.to(
            yH,
            {
                filter: textHighlightFilter(hilite),
                transform: "translateZ(0)",
                top: this._textSegmentHeight + topOfRow + theTop,
                minHeight: "20px",
                autoAlpha: hilite && typeof yHighlighter.s !== "undefined" && yHighlighter.s !== "" ? 0.8 : 0,
                backgroundColor: "transparent",
                borderColor: this._highlightLineColor,
                text: !yHighlighter.l || yHighlighter.l.length === 0 ? "" : `<span class=yHSpan>` + yHighlighter.l + "</span>",
                borderWidth: "2px 0 0 0",
            },
            0
        );
    }

    calcBarHeight() {
        // USE THIS FOR TUNING - do not delete
        if (window.location.href.includes("localhost:5001")) {
            // this._segments = this._segments.slice(6, 9) //remove segments
            // or
            // this._segments.push(this._segments[0]); //add a segment
            // this._segments.push(this._segments[0]); //add a segment
            // this._segments.push(this._segments[0]); //add a segment
            // this._segments.push(this._segments[0]); //add a segment
            // this._segments.push(this._segments[0]); //add a segment
            // this._segments.push(this._segments[0]); //add a segment
            // this._segments.push(this._segments[0]); //add a segment
            // this._segments.push(this._segments[1]) //add a segment
        }

        switch (this._segments.length) {
            case 1:
                this._segHt = this._inlineImg && this._inlineImg !== "" ? 360 : 460;
                this._marginIntraSegmentPx = 20;
                break;
            case 2:
                this._segHt = 240;
                this._marginIntraSegmentPx = 20;
                break;
            case 3:
                this._segHt = 144;
                this._marginIntraSegmentPx = 16;
                break;
            case 4:
                this._segHt = 100;
                this._marginIntraSegmentPx = 12;
                break;
            case 5:
                this._segHt = 72;
                this._marginIntraSegmentPx = 12;
                this._marginTopPx = 6;
                break;
            case 6:
                this._segHt = 56;
                this._marginIntraSegmentPx = 8;
                this._marginTopPx = 6;
                break;
            case 7:
                this._segHt = 42;
                this._marginIntraSegmentPx = 8;
                this._marginTopPx = 4;
                break;
            default:
                this._segHt = 36;
                this._marginIntraSegmentPx = 5;
                this._marginTopPx = 2;
                break;
        }
    }
}

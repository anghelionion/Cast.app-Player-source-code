/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

/* eslint-disable */
import BaseChart from "./BaseChart";

export default class Paths extends BaseChart {
    constructor(story, chartID, source = null) {
        if (!story) throw new ErrorEvent("Invalid story");
        super(story, chartID, source, "paths");

        this._borderRadius = 4;
        this._topPx = chartTop();
        this._verticalMarginPx = 20;
        this._titleHtPx = 20;
        this._segHt = 10;
        this._defaultVal = 0;
        this._unnamed = "_?_";
        this._gapPercent = 0.001;
        this._startEndNodePx = 15;
        this._ticksHt = 14;
        this._spacing = 24;
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

    //Is only used for inline image
    getTop(index) {
        return chartTop() + this._inlineImageHeight + this._inlineImageHeightLowerMargin + startingTop();
    }

    animationSet() {
        this._mainContainerDiv = chartContainer(this._base64uuid4, "pathsContainer baseContainer responsiveHeight");
        this._SegmentDivs = [];
        this._SegmentBackgrounds = [];
        this._segTitle = [];

        let pathLengthArr = [];
        let pathNodeCountArr = [];
        let pathNameArr = [];
        this._uniqueNodes = new Set();

        this._chartStyle = chartStyle(this._story, this._chartIdentifier, "process");

        let tlInit = gsap.timeline();
        this.setupSceneTheme(tlInit);

        if (this._inlineImg) {
            this._topPx += this._inlineImageHeight + this._inlineImageHeightLowerMargin;
        }

        let chartTitle = chartContainer(this._base64uuid4 + "-chartTitle", "chartTitle");
        this._mainContainerDiv.appendChild(chartTitle);

        let swapTicks = !!sceneLevelBool(this._chartIdentifier, "swapTicks");
        let autoHideUnnamedNodesAtOffsetZero = !!sceneLevelBool(this._chartIdentifier, "autoHideUnnamedNodesAtOffsetZero");
        this._colorOverride = !!sceneLevelBool(this._chartIdentifier, "colorOverride");

        tlInit.set(chartTitle, {
            left: "0%",
            top: `${chartTitleTop()}px`,
            autoAlpha: 1,
            width: "100%",
            text: textToDisplaySymbols(chartHeadingTitle(gStory, this._chartIdentifier, "paths")),
            color: this._imageTextColor,
            zIndex: 2,
        });

        // pre calc
        let legendSeparator = "➜";
        if (this._chartStyle === "stackedbar") legendSeparator = " ";
        this._node = [];
        let pathNodeCount = 0,
            pathLength = 0,
            pathIndex = 0;
        let pathName = "";
        for (let index = 0; index < this._segments.length; index++) {
            let type = segmentLevelStrVal(this._segments, index, "type", "node");

            let val = segmentLevelStrVal(this._segments, index, "value", this._defaultVal);
            val = parseFloat(val);
            if (val < 0) val = this._defaultVal;

            let nodeTitle = segmentLevelStrVal(this._segments, index, "title", this._unnamed);
            if (type === "node" && this._unnamed !== nodeTitle) this._uniqueNodes.add(nodeTitle);

            let offset = 0;
            let nodeValue = 0;

            if (type === "start") {
                pathNodeCount = 0;
                pathLength = 0;
                offset = 0;
                nodeValue = 0;
                pathName = ""; //"◉" + arrow ;
            } else if (type === "node") {
                // pathNodeCount++;
                offset = pathLength;
                pathLength += val;
                nodeValue = val;

                let colorIdx = this.colorIndex(index);
                let colorIndicator = colorIdx > -1 ? this.castColorOverride(colorIdx) : castColor();
                pathName += getIndicatorOfColor(colorIndicator) + (nodeTitle === this._unnamed ? "" : nodeTitle) + legendSeparator;
            } else if (type === "end") {
                // pathName += " " + arrow + "⊖";
                if (pathName[pathName.length - 1] === legendSeparator) pathName = pathName.slice(0, -1);
                pathLengthArr.push(pathLength);
                pathNodeCountArr.push(pathNodeCount);
                if (this._chartStyle === "pipeline" || this._chartStyle === "process") {
                    pathName = pathName.replace(new RegExp(legendSeparator, "g"), "<span style=opacity:.5 >" + legendSeparator + "</span>");
                }
                pathNameArr.push(pathName);
                offset = pathLength;
                nodeValue = 0;
            }

            this._node.push({
                type: type,
                offset: offset,
                pathIndex: pathIndex,
                value: nodeValue,
                nodeIndex: pathNodeCount,
            });

            if (type === "end") pathIndex++;
            if (type === "node") pathNodeCount++;
        }

        //Find pathLength
        this._maxPathLength = this._maxPathNodeCount = 0;
        for (let path = 0; path < pathLengthArr.length; path++) {
            this._maxPathLength = Math.max(pathLengthArr[path], this._maxPathLength);
            this._maxPathNodeCount = Math.max(pathNodeCountArr[path], this._maxPathNodeCount);
        }

        // console.log("pathNodeCountArr " + pathNodeCountArr);

        this.calcBarHeight(pathLengthArr.length);

        this._narrationBox = setupNarrationBox();

        for (let index = 0; index < this._segments.length; index++) {
            let segmentDiv = chartContainer(this._base64uuid4 + this._dashSeg + index + "-paths", "segmentBar");
            let segmentBackground = chartContainer(this._base64uuid4 + this._dashSeg + index + "-pathsBack", "positionAbsolute");
            let segTitle = chartContainer(this._base64uuid4 + this._dashSeg + index + "-paths-RowTitle", "segTitle");

            this._mainContainerDiv.appendChild(segmentDiv);
            this._mainContainerDiv.appendChild(segmentBackground);
            this._mainContainerDiv.appendChild(segTitle);

            this._SegmentDivs.push(segmentDiv);
            this._SegmentBackgrounds.push(segmentBackground);
            this._segTitle.push(segTitle);

            let type = segmentLevelStrVal(this._segments, index, "type", "node");

            if (type === "start") {
                //Rowtitle
                let titlePrefix = segmentLevelStrVal(this._segments, index, "titleprefix", "");
                if (titlePrefix.length > 16) titlePrefix = titlePrefix.substring(0, 16 - 1) + "⋯";
                if (titlePrefix.length > 0) titlePrefix += " ";
                let rowHdr = segmentLevelStrVal(this._segments, index, "title", pathNameArr[this._node[index].pathIndex]);
                tlInit.set(segTitle, {
                    color: this._imageTextColor,
                    left: "0%",
                    top: startingTop() + "px",
                    autoAlpha: 0,
                    filter: textHighlightFilter(false),
                    transform: "translateZ(0)",
                    text: titlePrefix + rowHdr,
                    width: "100%",
                    height: this._titleHtPx + "px",
                    zIndex: 2 * index,
                    lineHeight: this._titleHtPx + "px",
                });

                //segmentBackground
                tlInit.set(segmentBackground, {
                    left: "0%",
                    top: startingTop() + "px",
                    autoAlpha: 0,
                    // filter: graphicsHighlightFilter(false),
                    width: "100%",
                    height: this._segHt + this._verticalMarginPx + "px",
                    // backgroundColor: playBoxRoStyle().backgroundColor,
                    borderStyle: "solid",
                    borderTopWidth: "1px",
                    borderRightWidth: "0px",
                    borderBottomWidth: "0px",
                    borderLeftWidth: "0px",
                    borderRadius: "0px",
                    zIndex: 1,
                });
            }

            //TiCKS
            let decimalPlaces = parseInt(segmentLevelStrVal(this._segments, index, "decimals", "0"));
            if (index === this._segments.length - 1) {
                let aTick = [];
                for (let j = 0; j < 3; j++) {
                    let breakMin = chartContainer(this._base64uuid4 + this._dashSeg + index + "-PathsMin-" + j, "segSubtitle");
                    this._mainContainerDiv.appendChild(breakMin);
                    aTick.push(breakMin);

                    let talign, leftVal, displayVal;
                    if (j === 0) {
                        talign = "left";
                        leftVal = 0;
                        displayVal = swapTicks ? this._maxPathLength : 0;
                    } else if (j == 1) {
                        talign = "center";
                        leftVal = 40;
                        displayVal = this._maxPathLength / 2;
                    } else if (j === 2) {
                        talign = "right";
                        leftVal = 80;
                        displayVal = swapTicks ? 0 : this._maxPathLength;
                    }

                    let textVal =
                        sceneLevelStrVal(this._chartIdentifier, "prefix") + formatted(displayVal, decimalPlaces, true) + sceneLevelStrVal(this._chartIdentifier, "suffix");

                    // ticks text
                    tlInit.set(breakMin, {
                        color: this._imageTextColor,
                        left: leftVal + "%",
                        top: startingTop() + "px",
                        // top: `${topSegment + this._segHt + this._titleHtPx}px`,
                        autoAlpha: 0,
                        filter: textHighlightFilter(),
                        transform: "translateZ(0)",
                        width: 20 + "%",
                        height: index === this._segments.length - 1 ? this._ticksHt : 0,
                        position: "absolute",
                        zIndex: 2 * index,
                        textAlign: talign,
                        text: textVal,
                        fontSize: "90%",
                    });
                }
                this._SegmentTicks = aTick;
            }

            let textVal = "";
            if (this._chartStyle === "process" && type === "start") {
                textVal = "✪"; //◉
            } else if (this._chartStyle === "process" && type === "end") {
                textVal = "⊖";
            }

            //segment //////////////////////////////////
            //this._maxPathNodeCount
            let leftPercent = 100 * (this._node[index].offset / this._maxPathLength);
            if (type === "start") leftPercent = -2;
            if (type === "end") leftPercent = 101;
            if (type === "node") leftPercent = leftPercent + (this._maxPathNodeCount * this._gapPercent) / 2;
            let nodeWidth = 100 * (this._node[index].value / this._maxPathLength);

            let colorIdx = this.colorIndex(index);
            let backgroundColor = colorIdx > -1 ? this.castColorOverride(colorIdx) : castColor();
            if (type === "end" || type === "start") backgroundColor = playBoxRoStyle().backgroundColor;
            if (autoHideUnnamedNodesAtOffsetZero && this._node[index].offset === 0 && type === "node" && colorIdx === -1) backgroundColor = "transparent";

            let ht = this._segHt * (colorIdx > -1 || type === "end" || type === "start" ? 1 : 0.5);

            let segmentNodeWidthPercent = nodeWidth - this._maxPathNodeCount * this._gapPercent;

            //what is this nonsense? trying to show too small items
            const minNodeWidthPercent = 0.3;
            if (type === "node" && segmentNodeWidthPercent < minNodeWidthPercent) {
                segmentNodeWidthPercent = minNodeWidthPercent;
                leftPercent -= minNodeWidthPercent;
            }

            let leftEdge = this._node[index].type === "node" && this._node[index].nodeIndex === 0;
            let rightEdge = this._node[index].type === "node" && this._node[index].nodeIndex === pathNodeCountArr[this._node[index].pathIndex] - 1;

            tlInit.set(segmentDiv, {
                top: startingTop() + "px",
                autoAlpha: dimGraphicsOpacity(),
                filter: graphicsHighlightFilter(),
                transform: "translateZ(0)",
                backgroundColor: backgroundColor,
                zIndex: 2 * index + 1 + (type === "start" ? 2 : 0),
                lineHeight: ht + "px",
                borderTopLeftRadius: leftEdge ? this._borderRadius : 0 + "px",
                borderBottomLeftRadius: leftEdge ? this._borderRadius : 0 + "px",
                borderTopRightRadius: rightEdge ? this._borderRadius : 0 + "px",
                borderBottomRightRadius: rightEdge ? this._borderRadius : 0 + "px",
                left: leftPercent + "%",
                width: segmentNodeWidthPercent + "%",
                height: ht + "px",
                text: textVal,
                fontSize: "12px",
            });
        }
        return tlInit;
    }

    castColorOverride(colorIndex) {
        if (this._colorOverride && colorIndex === 0) return customCssVariable("--cast-red");
        if (this._colorOverride && colorIndex === 1) return customCssVariable("--cast-yellow");
        if (this._colorOverride && colorIndex === 2) return customCssVariable("--cast-green");
        return castColor(colorIndex);
    }

    colorIndex(index) {
        let nodeTitle = segmentLevelStrVal(this._segments, index, "title", this._unnamed);
        if (this._unnamed !== nodeTitle) this._uniqueNodes.add(nodeTitle);
        // let colorIndex = [...this._uniqueNodes].indexOf(nodeTitle);
        let colorIndex = Array.from(this._uniqueNodes).indexOf(nodeTitle);
        return colorIndex;
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
            if (hilite) rowHeadersToHighlight.add(this._node[index].pathIndex);
        }

        let topOfTick = 0;
        for (let index = 0; index < this._segments.length; index++) {
            if (Array.isArray(highlights) && highlights.length === 0) highlights = null;
            const hilite = !highlights || highlights.includes(index);
            let topSegment = this._topPx + this._spacing + this._node[index].pathIndex * (this._titleHtPx + this._verticalMarginPx + this._segHt);

            if (this._node[index].type === "start") {
                //Title
                tlSegment.add(
                    gsap.to(this._segTitle[index], {
                        autoAlpha: hilite ? 1 : dimTextOpacity(),
                        filter: textHighlightFilter(hilite),
                        transform: "translateZ(0)",
                        top: topSegment + "px",
                    }),
                    0
                );

                //background
                tlBackground.add(
                    gsap.to(this._SegmentBackgrounds[index], {
                        autoAlpha: dimGraphicsOpacity(),
                        // filter: graphicsHighlightFilter(false),
                        top: this._titleHtPx + topSegment + this._segHt / 2 + "px",
                    }),
                    0
                );
            }

            if (index === this._segments.length - 1) {
                for (let j = 0; j < 3; j++) {
                    tlSegment.add(
                        gsap.to(this._SegmentTicks[j], {
                            autoAlpha: markerTextOpacity(),
                            top: `${topSegment + this._segHt + this._titleHtPx}px`,
                            filter: textHighlightFilter(true),
                            transform: "translateZ(0)",
                        }),
                        0
                    );
                }
                topOfTick = topSegment + this._segHt + this._titleHtPx;
            }

            let colorIdx = this.colorIndex(index);
            let topVal = this._titleHtPx + topSegment + (colorIdx > -1 || this._node[index].type === "end" || this._node[index].type === "start" ? 0 : 0.25 * this._segHt);

            //segment
            tlSegment.add(
                gsap.to(this._SegmentDivs[index], {
                    autoAlpha: hilite ? 1 : dimGraphicsOpacity(),
                    filter: graphicsHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    top: topVal + "px",
                }),
                0
            ); //this.stagger(parseInt(index / this._columns)));
        }

        addNarrationTween(tlSegment, this._narrationBox);

        rowHeadersToHighlight.clear();
        return gsap.timeline().add([tlSegment, tlBackground]);
    }

    calcBarHeight(pathRows) {
        if (pathRows <= 2) {
            this._segHt = 28;
            this._titleHtPx = 28;
        } else if (pathRows == 3) {
            this._segHt = 24;
            this._titleHtPx = 20;
        } else if (pathRows == 4) {
            this._segHt = 20;
            this._titleHtPx = 14;
        }
    }
}

// this._verticalMarginPx = 8;
// this._titleHtPx = 20;
// this._segHt = 24;

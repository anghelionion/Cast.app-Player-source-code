/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

/* eslint-disable */
import BaseChart from "./BaseChart";

export default class CompareBar extends BaseChart {
    constructor(story, chartID, source = null) {
        if (!story) throw new ErrorEvent("Invalid story");
        super(story, chartID, source, "compareBar");

        this._segHt = 0;
        this._borderRadius = 5;
        this._topPx = chartTop();
        this._titleHeadingMargin = 0;
        this._titleHtPx = 20;
        this._subtitleHtPx = 18;
        this._ticksHt = 14;
        this._marginIntraSegmentPx = 8;
        this._borderWidth = 0;
        this._lowestSeg = 0;
        this._highestSeg = 0;
        this._boolJustInitialized = [];
        this._titleSubtitlefontSize = "14px";
        this._gapBetweensegmentAndBackground = 2;
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
        return (
            this._topPx +
            this._inlineImageHeight +
            this._inlineImageHeightLowerMargin +
            this._titleHeadingMargin +
            this._marginIntraSegmentPx +
            index * (this._getHeight() + this._marginIntraSegmentPx) +
            (index === this._segments.length ? this._titleHtPx : 0)
        );
    }

    _getHeight() {
        return this.titleHeight() + this._segHt;
    }

    titleHeight() {
        return Math.max(this._titleHtPx, this._subtitleHtPx);
    }

    animationSet() {
        this._mainContainerDiv = chartContainer(this._base64uuid4, "compareBarContainer baseContainer responsiveHeight");
        this._SegmentDivs = [];
        this._SegmentBackgrounds = [];
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
            text: chartHeadingTitle(gStory, this._chartIdentifier, "Comparisions"),
            color: this._imageTextColor,
            zIndex: 2,
        });

        this._narrationBox = setupNarrationBox();

        for (let index = 0; index < this._segments.length; index++) {
            let flt = segmentFloatVal(this._segments, index, true);
            if (flt > this._highestSeg) {
                this._highestSeg = flt;
            }
            if (flt < this._lowestSeg) {
                this._lowestSeg = flt;
            }
            flt = segmentFloatCompareVal(this._segments, index, true);
            if (flt > this._highestSeg) {
                this._highestSeg = flt;
            }
            if (flt < this._lowestSeg) {
                this._lowestSeg = flt;
            }
        }
        let multiplier = parseFloat(sceneLevelStrVal(this._chartIdentifier, "scaleMultiplierBetween1and2", "1"));
        if (isNaN(multiplier) || multiplier < 1) multiplier = 1;
        else if (multiplier > 2) multiplier = 2;

        multiplier--;

        this._highestSeg = this._highestSeg + (multiplier / 2) * (this._highestSeg - this._lowestSeg);

        this._lowestSeg = this._lowestSeg - (multiplier / 2) * (this._highestSeg - this._lowestSeg);

        this._leftStartingValue = leftStartingValue(this._chartIdentifier);

        // not sawing leftStartingValue when negatives in use
        if (this._lowestSeg < 0) this._leftStartingValue = 0;

        let showDifference = !!sceneLevelBool(this._chartIdentifier, "showDifference");
        for (let index = 0; index < this._segments.length; index++) {
            this._boolJustInitialized[index] = true;

            let segmentDiv = chartContainer(this._base64uuid4 + this._dashSeg + index + "-compareBar", "segmentBar");
            let segmentBackground = chartContainer(this._base64uuid4 + this._dashSeg + index + "-compareBarBack", "segmentBarBackground");
            let segTitle = chartContainer(this._base64uuid4 + this._dashSeg + index + "-title", "segTitle");
            let segSubtitle = chartContainer(this._base64uuid4 + this._dashSeg + index + "-footer", "segSubtitle");

            this._mainContainerDiv.appendChild(segmentDiv);
            this._mainContainerDiv.appendChild(segmentBackground);
            this._mainContainerDiv.appendChild(segTitle);
            this._mainContainerDiv.appendChild(segSubtitle);

            this._SegmentDivs.push(segmentDiv);
            this._SegmentBackgrounds.push(segmentBackground);
            this._segTitleDivs.push(segTitle);
            this._segSubtitleDivs.push(segSubtitle);

            let highlightMarker = chartContainer(this._base64uuid4 + this._dashSeg + index + "-highlightmarker", "segmentBar");
            this._mainContainerDiv.appendChild(highlightMarker);
            this._highlightMarker.push(highlightMarker);
            tlInit.set(
                highlightMarker,
                {
                    left: highlightMarkerLeft(),
                    top: this.getTop(index) + this.titleHeight(),
                    autoAlpha: 0,
                    zIndex: 2 * index,
                    width: highlightMarkerWidth(),
                    height: this._getHeight() - this.titleHeight(),
                    borderRadius: highlightMarkerBorderRadius(),
                    backgroundColor: castColor(index),
                    borderWidth: "0px",
                },
                0
            );

            //segment Title
            const segTitleText = textToDisplaySymbols(segmentLevelStrVal(this._segments, index, "title"));
            tlInit.set(segTitle, {
                color: this._imageTextColor,
                left: "0%",
                top: this.getTop(index),
                autoAlpha: dimTextOpacity(),
                filter: textHighlightFilter(),
                transform: "translateZ(0)",
                height: this._titleHtPx + "px",
                lineHeight: this._titleHtPx + "px",
                text: segTitleText,
                zIndex: 2 * index,
                fontSize: this._titleSubtitlefontSize,
            });

            let segColor = castColor(index);

            //segmentBackground
            let backColor = hexWithOpacity(segColor, 0.3);
            let cc = backColor;
            let ccv = "3.5px";

            tlInit.set(segmentBackground, {
                left: "0%",
                top: `${this.getTop(index) + this._titleHtPx}px`,
                autoAlpha: dimGraphicsOpacity(),
                filter: graphicsHighlightFilter(),
                transform: "translateZ(0)",
                width: "0%",
                height: this._segHt,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderTopRightRadius: this._borderRadius,
                borderBottomRightRadius: this._borderRadius,
                backgroundColor: backColor,
                borderColor: playBoxRoStyle().backgroundColor,
                zIndex: 2 * index,
                // backgroundImage: `linear-gradient(135deg, ${cc} ${ccv}, transparent ${ccv}), linear-gradient(45deg, ${cc} ${ccv}, transparent ${ccv})`,
                // backgroundSize: "6px 6px",
                // backgroundRepeat: "repeat-y"
            });

            if (this._leftStartingValue > 0) {
                tlInit.set(segmentBackground, {
                    backgroundImage: `linear-gradient(135deg, ${cc} ${ccv}, transparent ${ccv}), linear-gradient(45deg, ${cc} ${ccv}, transparent ${ccv})`,
                    backgroundSize: "6px 6px",
                    backgroundRepeat: "repeat-y",
                });
            }

            let decimalPlaces = parseInt(segmentLevelStrVal(this._segments, index, "decimals", "0"));

            if (index === this._segments.length - 1) {
                let aTick = [];
                for (let j = 0; j < 3; j++) {
                    let breakMin = chartContainer(this._base64uuid4 + this._dashSeg + index + "-compareBarsMin-" + j, "segSubtitle");
                    this._mainContainerDiv.appendChild(breakMin);
                    aTick.push(breakMin);

                    let talign, leftVal, displayVal;
                    if (j === 0) {
                        talign = "left";
                        leftVal = 0;
                        displayVal = parseFloat(this._lowestSeg) + parseFloat(this._leftStartingValue);
                    } else if (j === 1) {
                        talign = "center";
                        leftVal = 40;
                        displayVal = parseFloat(this._lowestSeg) + (parseFloat(this._highestSeg) - parseFloat(this._lowestSeg) - parseFloat(this._leftStartingValue)) / 2;
                    } else if (j === 2) {
                        talign = "right";
                        leftVal = 80;
                        displayVal = parseFloat(this._highestSeg);
                    }

                    let textVal =
                        segmentLevelStrVal(this._segments, index, "prefix") +
                        formatted(displayVal, decimalPlaces, true) +
                        singularPlural(segmentLevelStrVal(this._segments, index, "suffix"), displayVal, decimalPlaces);

                    // if (j == 0) textVal = "⇤" + textVal;
                    // if (j == 2) textVal = textVal + "⇥";

                    // ticks text
                    tlInit.set(breakMin, {
                        left: leftVal + "%",
                        top: `${this.getTop(index) + this._segHt + this._titleHtPx + this._marginIntraSegmentPx / 2.5}px`,
                        color: hexWithOpacity(this._imageTextColor, 0.5),
                        autoAlpha: 0,
                        filter: textHighlightFilter(),
                        transform: "translateZ(0)",
                        width: 20 + "%",
                        height: index === this._segments.length - 1 ? this._ticksHt : 0,
                        position: "absolute",
                        zIndex: 2 * index,
                        textAlign: talign,
                        text: textVal,
                        margin: "2px 0 0 0",
                        fontSize: "12px",
                    });
                }
                this._SegmentTicks = aTick;
            }

            //segment
            tlInit.set(segmentDiv, {
                left: "0%",
                width: "0%",
                top: `${this.getTop(index) + this._titleHtPx + this._gapBetweensegmentAndBackground}px`,
                autoAlpha: dimGraphicsOpacity(),
                filter: graphicsHighlightFilter(),
                transform: "translateZ(0)",
                height: this._segHt - 2 * this._gapBetweensegmentAndBackground,
                // lineHeight: this._segHt - 2 * this._gapBetweensegmentAndBackground,
                backgroundColor: segColor,
                borderColor: playBoxRoStyle().backgroundColor,
                borderStyle: "solid",
                borderLeftWidth: "0px",
                borderRightWidth: this._borderWidth,
                borderTopWidth: this._borderWidth,
                borderBottomWidth: this._borderWidth,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderTopRightRadius: this._borderRadius,
                // text:"VALUE",
                borderBottomRightRadius: this._borderRadius,
                zIndex: 2 * index + 1,
                // backgroundImage: `linear-gradient(135deg, ${cc} ${ccv}, transparent ${ccv}), linear-gradient(45deg, ${cc} ${ccv}, transparent ${ccv})`,
                // backgroundSize: "6px 6px",
                // backgroundRepeat: "repeat-y"
            });

            if (this._leftStartingValue > 0) {
                tlInit.set(segmentDiv, {
                    backgroundImage: `linear-gradient(135deg, ${cc} ${ccv}, transparent ${ccv}), linear-gradient(45deg, ${cc} ${ccv}, transparent ${ccv})`,
                    backgroundSize: "6px 6px",
                    backgroundRepeat: "repeat-y",
                });
            }

            //segment subtitle / labels
            let compareValueLabel = segmentLevelStrVal(this._segments, index, "compareValueLabel");
            let valueLabel = segmentLevelStrVal(this._segments, index, "valueLabel");

            //AutoFi
            if (segTitleText.toLowerCase().includes(" vs. ")) {
                let labels = segTitleText.split(" vs. ");
                valueLabel = labels[0];
                compareValueLabel = labels[1];
            }

            let vFloat = segmentFloatVal(this._segments, index);
            let cFloat = segmentFloatCompareVal(this._segments, index);
            const percent = (100 * vFloat) / cFloat;
            const pie = `<span style="display:flex; margin: 1px 3px">${pieMaker(vFloat / cFloat, segColor)}</span>`;

            let v = segmentLevelStrVal(this._segments, index, "prefix") + formatted(vFloat, decimalPlaces, true) + segmentLevelStrVal(this._segments, index, "suffix");
            let labels = `${pie}${formatted(percent)}%<span class='complabel' style='color: ${segColor}'>'dot'</span>${valueLabel + " " + v}`;
            if (showDifference) {
                let upDown, diffStr;
                if (vFloat > cFloat) {
                    upDown = "'up'";
                    diffStr =
                        segmentLevelStrVal(this._segments, index, "prefix") + formatted(vFloat - cFloat, decimalPlaces, true) + segmentLevelStrVal(this._segments, index, "suffix");
                } else if (vFloat === cFloat) {
                    upDown = "";
                    diffStr = " no change";
                } else {
                    upDown = "'down'";
                    diffStr =
                        segmentLevelStrVal(this._segments, index, "prefix") + formatted(cFloat - vFloat, decimalPlaces, true) + segmentLevelStrVal(this._segments, index, "suffix");
                }
                labels += `<span class='complabel' style='color: ${backColor}'>${upDown}</span>${diffStr}`;
            } else {
                let c = segmentLevelStrVal(this._segments, index, "prefix") + formatted(cFloat, decimalPlaces, true) + segmentLevelStrVal(this._segments, index, "suffix");
                labels += `<span class='complabel' style='color: ${backColor}'>'dot'</span>${compareValueLabel + " " + c}`;
            }
            labels = textToDisplaySymbols(labels);

            tlInit.set(segSubtitle, {
                color: this._imageTextColor,
                right: "0%",
                top: this.getTop(index),
                height: this._subtitleHtPx + "px",
                lineHeight: this._subtitleHtPx + "px",
                autoAlpha: dimTextOpacity(),
                filter: textHighlightFilter(),
                transform: "translateZ(0)",
                text: labels,
                zIndex: 2 * index,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                fontSize: this._titleSubtitlefontSize,
            });
        }
        return tlInit;
    }

    //show segment opened. segTitle and segSubtitle are shown
    doHighlight(highlights) {
        highlights = checkInfographics(highlights);
        let tlSegment = gsap.timeline();
        let tlSegmentBg = gsap.timeline();
        let tlTitleSubTitle = gsap.timeline();

        for (let index = 0; index < this._segments.length; index++) {
            if (Array.isArray(highlights) && highlights.length === 0) highlights = null;
            const hilite = !highlights || highlights.includes(index);

            //title
            tlTitleSubTitle.to(
                this._segTitleDivs[index],
                {
                    autoAlpha: hilite ? 1 : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                },
                0
            );

            //segment
            let wF = (100 * (segmentFloatVal(this._segments, index) - this._lowestSeg - this._leftStartingValue)) / (this._highestSeg - this._lowestSeg);

            //if too small show.5%
            if (wF < 0.5) wF = 0.5;
            tlSegment.to(
                this._SegmentDivs[index],
                {
                    autoAlpha: hilite ? 1 : dimGraphicsOpacity(),
                    filter: graphicsHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    width: this._boolJustInitialized[index] ? "0%" : wF + "%",
                },
                0
            );

            if (this._boolJustInitialized[index]) {
                tlSegment.to(
                    this._SegmentDivs[index],
                    {
                        autoAlpha: hilite ? 1 : dimGraphicsOpacity(),
                        filter: graphicsHighlightFilter(hilite),
                        transform: "translateZ(0)",
                        width: wF + "%",
                    },
                    0
                );
                this._boolJustInitialized[index] = false;
            }

            if (index === this._segments.length - 1) {
                for (let j = 0; j < 3; j++) {
                    tlSegment.to(
                        this._SegmentTicks[j],
                        {
                            autoAlpha: 1, //hilite ? markerTextOpacity() : dimTextOpacity(), //always show
                            top: `${this.getTop(index) + this._segHt + this._titleHtPx + this._marginIntraSegmentPx / 2.5}px`,
                            // filter: textHighlightFilter(hilite), //always show
                        },
                        0
                    );
                }
            }

            //background
            let wB = (100 * parseFloat(segmentFloatCompareVal(this._segments, index) - this._lowestSeg - this._leftStartingValue)) / (this._highestSeg - this._lowestSeg);
            //if too small show.5%
            if (wB < 0.5) wB = 0.5;
            tlSegmentBg.to(
                this._SegmentBackgrounds[index],
                {
                    autoAlpha: hilite ? 1 : dimGraphicsOpacity(),
                    filter: graphicsHighlightFilter(hilite),
                    transform: "translateZ(0)",
                    width: wB + "%",
                },
                0
            );

            //subtitle
            tlTitleSubTitle.to(
                this._segSubtitleDivs[index],
                {
                    autoAlpha: hilite ? 1 : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
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

        return gsap.timeline().add([tlSegmentBg, tlTitleSubTitle]).add(tlSegment);
    }

    calcBarHeight() {
        // USE THIS FOR TUNING - do not delete
        if (window.location.href.includes("localhost:5001")) {
            // this._segments = this._segments.slice(6, 9) //remove segments
            // or
            // this._segments.push(this._segments[0]) //add a segment
            // this._segments.push(this._segments[1]) //add a segment
        }

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
        // console.log(this._segments.length, this._marginIntraSegmentPx, this._segHt)
    }
}

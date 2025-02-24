/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

/* eslint-disable */
"use strict";

import BaseChart from "./BaseChart";

export default class Checklist extends BaseChart {
    constructor(story, chartID, source = null) {
        if (!story) throw new ErrorEvent("Invalid story");
        super(story, chartID, source, "checklist");

        this._originalSegHt = 10;
        this._segHt = this._originalSegHt;
        this._topPx = chartTop();
        this._titleHtPx = 20;
        this._subtitleHtPx = 20;
        this._marginIntraSegmentPx = 13;
        this._borderRadius = 4;
        this._segmentMargin = 0;
        this._spaced = 15;
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

    animationSet() {
        this._segTitleDivs = [];
        this._mainContainerDiv = chartContainer(this._base64uuid4, "checklistContainer responsiveHeight");

        const chartTitle = chartContainer(this._base64uuid4 + "-chartTitle", "chartTitle");
        this._mainContainerDiv.appendChild(chartTitle);

        let tlInit = gsap.timeline();
        this.setupSceneTheme(tlInit);

        tlInit.set(chartTitle, {
            autoAlpha: 1,
            text: chartHeadingTitle(gStory, this._chartIdentifier, "Categorization"),
            color: this._imageTextColor,
        });

        this._optionsInlineImageContainer = elementOfTypeAndClass("div", "options_inline_image_container");
        this._mainContainerDiv.appendChild(this._optionsInlineImageContainer);

        const options_buttons_container = elementOfTypeAndClass("div", "agenda_buttons_container");
        this._mainContainerDiv.appendChild(options_buttons_container);
        if (this._inlineImg && this._segments.length > 8) {
            options_buttons_container.classList.add("small");
        }

        this._narrationBox = setupNarrationBox();

        for (let index = 0; index < this._segments.length; index++) {
            const segTitle = chartContainer(this._base64uuid4 + this._dashSeg + index + "-title", "agenda_button");
            this._segTitleDivs.push(segTitle);

            options_buttons_container.appendChild(segTitle);

            //segment Title
            tlInit.set(
                segTitle,
                {
                    color: this._imageTextColor,
                    autoAlpha: 0,
                    text: "",
                },
                this.stagger(index)
            );
        }
        return tlInit;
    }

    getTop(index) {
        return (
            this._topPx +
            this._inlineImageHeight +
            this._inlineImageHeightLowerMargin +
            this._segmentMargin +
            index * (this._segmentMargin + Math.max(this._titleHtPx, this._subtitleHtPx) + this._segHt + this._marginIntraSegmentPx)
        );
    }

    //show segment opened. segTitle is shown
    doHighlight(highlights) {
        highlights = checkInfographics(highlights);
        const theme = getThemeName();

        const tlSegment = gsap.timeline();
        const tlNarration = gsap.timeline();

        let checkMarkMode = sceneLevelStrVal(this._chartIdentifier, "checkMarkMode", "");
        let checkmark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#10B981">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                        </svg>`;
        if (Array.isArray(highlights) && highlights.length === 0) highlights = null;
        const svgMapping = {
            x: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#EF4444">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                </svg>`,
            i: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#00A2FF">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />
                </svg>`,
            w: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#FBC22C">
                    <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                </svg>`,
            t: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M13 4H7C5.34315 4 4 5.34315 4 7V13C4 14.6569 5.34315 16 7 16H13C14.6569 16 16 14.6569 16 13V7C16 5.34315 14.6569 4 13 4ZM7 2C4.23858 2 2 4.23858 2 7V13C2 15.7614 4.23858 18 7 18H13C15.7614 18 18 15.7614 18 13V7C18 4.23858 15.7614 2 13 2H7Z" fill="#F78441"/>
                </svg>`,
            d: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 4H13C13.7416 4 14.4204 4.26909 14.9439 4.71495L16.1606 3.12542C15.2992 2.42194 14.1989 2 13 2H7C4.23858 2 2 4.23858 2 7V13C2 15.7614 4.23858 18 7 18H13C15.7614 18 18 15.7614 18 13V7C18 6.7481 17.9814 6.50055 17.9454 6.25865L16 8.80035V13C16 14.6569 14.6569 16 13 16H7C5.34315 16 4 14.6569 4 13V7C4 5.34315 5.34315 4 7 4Z" fill="#0F9D58"/>
                    <path d="M10.7147 14.4376C10.7148 14.4375 10.7146 14.4377 10.7147 14.4376C10.3293 14.8333 9.69596 14.8419 9.30031 14.4566L5.30231 10.563C4.90665 10.1777 4.89828 9.54458 5.2836 9.14892C5.66893 8.75326 6.30203 8.74489 6.69769 9.13021L9.91987 12.2682L16.7485 3.39037C17.0852 2.9526 17.713 2.87069 18.1508 3.2074C18.5885 3.54412 18.6705 4.17196 18.3337 4.60973L10.9382 14.2247C10.8734 14.309 10.7977 14.3801 10.7147 14.4376Z" fill="#0F9D58"/>
                </svg>`,
        };
        for (let index = 0; index < this._segments.length; index++) {
            let hilite = highlights && highlights.includes(index);
            if (!highlights) hilite = false;

            if (checkMarkMode === "number") {
                checkmark = this._getNumberSVG(index + 1);
                if (theme !== "dark") checkmark = checkmark.replace('fill="#4A4642"', 'fill="' + this._imageTextColor + '"');
            }
            if (checkMarkMode === "alpha") checkmark = textToDisplaySymbols("--" + String.fromCodePoint("a".codePointAt(0) + index) + "-- ");

            let checkMarkOverride = segmentLevelStrVal(this._segments, index, "checkMarkOverride", "");
            if (checkMarkOverride === "") checkMarkOverride = checkmark;
            else checkMarkOverride = String.fromCodePoint(checkMarkOverride.codePointAt(0));

            checkMarkOverride = svgMapping[checkMarkOverride.trim()] || checkMarkOverride;

            checkMarkOverride = "<span class=svgContainer>" + checkMarkOverride + "</span>";

            // let defaultSvgContent = '';
            // NOTE any SVG sent in json should have all " converted to '
            //"svgSuffix" : "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'><circle cx='119.24' cy='121.93' r='88.04' style='fill:none;stroke:#f9f5f1;stroke-miterlimit:10;stroke-width:30px'/><path d='M117.93,73.77c12.5.1,23.12,3.8,32.2,11.51a45.69,45.69,0,0,1,8.41,61,4.4,4.4,0,0,0-.77,3.81c1.22,5.09,2.35,10.21,3.6,15.29.47,1.94.26,3.62-1.29,4.94s-3.35,1.26-5.19.47c-5.25-2.27-10.52-4.49-15.78-6.75a4.08,4.08,0,0,0-3.3,0c-23.34,8.81-49.71-1.3-60.61-23.17A42.87,42.87,0,0,1,70.59,117c2-19.66,12.69-32.95,30.93-40.22A43.23,43.23,0,0,1,117.93,73.77Zm.51,55a7.43,7.43,0,0,0,7.58-7.65,7.56,7.56,0,0,0-15.12.07A7.41,7.41,0,0,0,118.44,128.73Zm-14.38-7.59a7.41,7.41,0,1,0-7.47,7.59A7.3,7.3,0,0,0,104.06,121.14Zm43.57-.06a7.39,7.39,0,1,0-14.78-.18v.25a7.39,7.39,0,1,0,14.78-.07Z' style='fill:#f9f5f1'/></svg>"
            const checkText = checkMarkOverride + "<span class='agenda_button_title'>" + segmentLevelStrVal(this._segments, index, "title").replace("Stacck", "Stack") + "</span>";
            ////// TODO REMOVE THIS .replace("Stacck", "Stack") in 10 days -- this is because a demo to ControlUp had a typo @Jon

            let boxShadow = "rgba(0, 0, 0, 0.4)";
            if (theme !== "dark") boxShadow = "rgba(255, 255, 255, 0.6)";
            //*
            tlSegment.add(
                gsap.to(this._segTitleDivs[index], {
                    autoAlpha: 1,
                    // filter: textHighlightFilter(hilite),
                    boxShadow: hilite ? "0 2px 6px " + boxShadow : "unset",
                    text: checkText,
                    color: this._imageTextColor,
                }),
                this.stagger(index)
            );
            //*/
        }

        addNarrationTween(tlNarration, this._narrationBox);

        return gsap.timeline().add([tlSegment, tlNarration]);
    }

    _getNumberSVG(index) {
        const svg = SVG["checklistNumberSVG" + index];
        if (svg) {
            return svg();
        }
        return "";
    }
}

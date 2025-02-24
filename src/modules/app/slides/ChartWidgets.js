/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

/* eslint-disable */
import BaseChart from "./BaseChart";

export default class ChartWidgets extends BaseChart {
    constructor(story, chartID, source = null) {
        if (!story) throw new ErrorEvent("Invalid story");
        super(story, chartID, source, "widgets");

        this._widgets_container = null;
        this._widgets = [];
    }

    sunset(forward = 1, waitForUser = false, chartID = null) {
        if (!this._mainContainerDiv) return;
        if (this._sunsetCalled) {
            return;
        }
        this._sunsetCalled = true;

        this._widgets.forEach((widget) => widget.destroy());
        this.unsetSceneTheme(chartID, forward);
    }

    animationSetAndInlineImage(tl) {
        if (!this._animationSet) {
            tl.add(this.animationSet());
        }
    }

    animationSet() {
        const set = gsap.set;
        const tlInit = gsap.timeline();
        const widgetBackgroundColor = sceneLevelStrVal(this._chartIdentifier, "widgetBackgroundColor", "");
        const widgetTextColor = sceneLevelStrVal(this._chartIdentifier, "widgetTextColor", "");

        this._mainContainerDiv = chartContainer(this._base64uuid4, "metricsContainer responsiveHeight");

        this.setupSceneTheme(tlInit);

        const chartTitle = chartContainer(this._base64uuid4 + "-chartTitle", "chartTitle");
        this._mainContainerDiv.appendChild(chartTitle);
        set(chartTitle, {
            text: chartHeadingTitle(gStory, this._chartIdentifier, "Horizontal Bar"),
            color: this._imageTextColor,
        });

        this._widgets_container = elementOfTypeAndClass("div", "widgets_container");
        this._mainContainerDiv.appendChild(this._widgets_container);

        this._optionsInlineImageContainer = elementOfTypeAndClass("div");
        this._widgets_container.appendChild(this._optionsInlineImageContainer);

        this._narrationBox = setupNarrationBox();

        const factory = new WidgetFactory();

        for (let index = 0; index < this._segments.length; index++) {
            const widget = factory.create(this._segments, index, this._chartIdentifier, {
                widgetBackgroundColor,
                widgetTextColor,
                imageTextColor: this._imageTextColor,
                dashboardBackgroundColor: this._backgroundColor,
            });

            if (!widget.hasData()) continue;

            widget.segmentIndex = index;
            this._widgets.push(widget);
            widget.colorIndex = this._widgets.length - 1;
            const element = widget.init();

            set(widget.getIndicatorElement(), { background: castColor(widget.colorIndex) });

            this._widgets_container.appendChild(element);
        }

        const extraClassNames = this._getDynamicSizeExtraClass(this._widgets.length);

        if (this._inlineImg) {
            const imageElement = this._createMetricsImage(this._inlineImg);
            this._optionsInlineImageContainer.appendChild(imageElement);

            this._inlineImgContainer = imageElement;
            if (extraClassNames.length) this._inlineImgContainer.classList.add(...extraClassNames);
        }

        this._widgets.forEach((widget) => {
            if (extraClassNames.length) {
                widget.getElement().classList.add(...extraClassNames);
                widget.getTitleElement().classList.add(...extraClassNames);
            }
        });
        return tlInit;
    }

    doHighlight(highlights) {
        highlights = checkInfographics(highlights);
        const tlSegment = gsap.timeline();

        for (let index = 0; index < this._widgets.length; index++) {
            const widget = this._widgets[index];

            if (Array.isArray(highlights) && highlights.length === 0) highlights = null;
            const hilite = !highlights || highlights.includes(widget.segmentIndex);

            widget.doHighLight(index, hilite, tlSegment);
        }

        addNarrationTween(tlSegment, this._narrationBox);

        return gsap.timeline().add([tlSegment]);
    }

    _createMetricsImage(source) {
        const inlineImgElement = elementOfTypeAndClass("img");
        const inlineImgContainer = elementOfTypeAndClass("div", "widgetInlineImage");
        inlineImgContainer.appendChild(inlineImgElement);

        let borderWidth = "0";
        const contrastColor = contrastDiff(sceneLevelStrVal(this._chartIdentifier, "widgetBackgroundColor", ""), this._backgroundColor);
        if (contrastColor < 25) {
            borderWidth = "1px";
        }

        gsap.set(inlineImgElement, { attr: { src: source } });
        gsap.set(inlineImgContainer, {
            autoAlpha: 0,
            borderWidth,
            borderColor: this._getPanelBorderColor(),
            borderStyle: "solid",
            background: this._getPanelBackgroundColor(),
        });
        return inlineImgContainer;
    }

    _getPanelBackgroundColor() {
        return sceneLevelStrVal(this._chartIdentifier, "widgetBackgroundColor", "");
        //lets not recalculate everytime
        if (this._cachedPanelBackgroundColor) return this._cachedPanelBackgroundColor;

        //IF a panel Text Color Override is provided use that otherwise default to the text color of slide
        const panelTextColor = sceneLevelStrVal(this._chartIdentifier, "panelTextColor", this._imageTextColor);

        //Use the slide background color to determine whihc dark color to use unless it is transparetn
        const slideBackgroundColor = this._backgroundColor === "transparent" ? "white" : this._backgroundColor;

        // following fixes bugs for custom background colors set in designer project settings
        // TESTED with #000, #191511, #393531, #292521, #a9a5a1
        const darkColorOverride = colorWithHigherContrast(slideBackgroundColor, "#191511", "#393531");
        this._cachedPanelBackgroundColor = colorWithHigherContrast(panelTextColor, darkColorOverride, "#ffffff"); // auto select panel color from text color
        return this._cachedPanelBackgroundColor;
    }

    _getPanelBorderColor() {
        // return border w/ opacity
        const slideBackgroundColor = this._backgroundColor === "transparent" ? "white" : this._backgroundColor;
        return hexWithOpacity(colorWithHigherContrast(slideBackgroundColor, "#000", "#ffffff"), 0.33);
    }

    doHighlightAndInlineImage(tl, nextStep) {
        tl.add(this.doHighlight(nextStep.highlight));
        if (this._inlineImg !== "") {
            gsap.set(this._inlineImgContainer, {
                autoAlpha: 1,
                scale: 1,
            });
        }
    }

    _getDynamicSizeExtraClass(length) {
        let extraClassNames = [];
        if (length === 1) {
            extraClassNames.push(this._inlineImg ? "oneColumnDesktopInline" : "oneColumnDesktop");
            extraClassNames.push("oneColumnMobile");
        }
        if (length === 2) {
            extraClassNames.push("twoColumnsDesktop");
            extraClassNames.push("oneColumnMobile");
        }

        if (length === 3) {
            if (!this._inlineImg) extraClassNames.push("twoColumnsDesktop");
            extraClassNames.push(this._inlineImg ? "twoColumnsMobile" : "oneColumnMobile");
        }

        if (length === 4) {
            if (!this._inlineImg) extraClassNames.push("twoColumnsDesktop");
            extraClassNames.push("twoColumnsMobile");
        }

        return extraClassNames;
    }
}

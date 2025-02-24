/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

/* eslint-disable */
import BaseChart from "./BaseChart";

export default class ChartMetrics extends BaseChart {
    constructor(story, chartID, source = null) {
        if (!story) throw new ErrorEvent("Invalid story");
        super(story, chartID, source, "metrics");

        this._metricsSegmentHeight = 24;
        this._borderRadius = 5;
        this._topPx = chartTop();
        this._titleHeadingMargin = 0;
        this._titleHtPx = this._subtitleHtPx = 25;
        this._currentTopHighlightAdd = 0;
        this._panelMargin = 18;
        this._panelTopPadding = 20;
        this._panelBottomPadding = 20;
        this._metrics_widget_container = null;
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
            this._panelMargin +
            index * (this._panelMargin + this._panelTopPadding + Math.max(this._titleHtPx, this._subtitleHtPx) + this._metricsSegmentHeight + this._panelBottomPadding)
        );
    }

    animationSetAndInlineImage(tl) {
        if (!this._animationSet) {
            tl.add(this.animationSet());
            if (this._inlineImg) {
                const imageElement = this._createMetricsImage(this._inlineImg);
                this._optionsInlineImageContainer.appendChild(imageElement);

                this._inlineImgContainer = imageElement;
            }
        }
    }

    animationSet() {
        const set = gsap.set;
        const tlInit = gsap.timeline();

        this._mainContainerDiv = chartContainer(this._base64uuid4, "metricsContainer responsiveHeight");

        this._metricsSegmentPanels = [];
        this._metricssegmentMetricValues = [];
        this._metricssegTitleDivs = [];
        this._metricssegmentMetricIndicator = [];

        this.setupSceneTheme(tlInit);

        const chartTitle = chartContainer(this._base64uuid4 + "-chartTitle", "chartTitle");
        this._mainContainerDiv.appendChild(chartTitle);
        set(chartTitle, {
            text: chartHeadingTitle(gStory, this._chartIdentifier, "Horizontal Bar"),
            color: this._imageTextColor,
        });

        this._metrics_widget_container = elementOfTypeAndClass("div", "metrics_widget_container");
        this._mainContainerDiv.appendChild(this._metrics_widget_container);

        this._optionsInlineImageContainer = elementOfTypeAndClass("div");
        this._metrics_widget_container.appendChild(this._optionsInlineImageContainer);

        this._narrationBox = setupNarrationBox();

        for (let index = 0; index < this._segments.length; index++) {
            const segmentPanel = this._createMetricsWidget(index);

            this._metrics_widget_container.appendChild(segmentPanel);

            this._metricsSegmentPanels.push(segmentPanel);
            this._metricssegTitleDivs.push(segmentPanel.querySelector(".metricsWidget_title_container"));
            this._metricssegmentMetricValues.push(segmentPanel.querySelector(".metricsWidget_metric"));
            this._metricssegmentMetricIndicator.push(segmentPanel.querySelector(".metricsWidget_indicator"));
        }
        return tlInit;
    }

    doHighlight(highlights) {
        highlights = checkInfographics(highlights);
        const tlSegment = gsap.timeline();
        const tlSubtitle = gsap.timeline();

        for (let index = 0; index < this._segments.length; index++) {
            if (Array.isArray(highlights) && highlights.length === 0) highlights = null;
            const hilite = !highlights || highlights.includes(index);

            const segmentPanel = this._metricsSegmentPanels[index];
            tlSegment.to(
                segmentPanel,
                {
                    autoAlpha: 1, //hilite ?1 : dimGraphicsOpacity(),
                    filter: graphicsHighlightFilter(true),
                    transform: "translateZ(0)",
                    scale: hilite ? 1 : 0.925,
                },
                0
            );

            tlSubtitle.to(
                [this._metricssegTitleDivs[index], this._metricssegmentMetricValues[index], segmentPanel.querySelector(".metricsWidget_subtitle")],
                {
                    autoAlpha: 1, //hilite ? 1 : dimTextOpacity(),
                    filter: textHighlightFilter(hilite),
                    transform: "translateZ(0)",
                },
                0
            );

            tlSegment.to(this._metricssegmentMetricIndicator[index], { width: hilite ? "3.5%" : 0 }, 0);
        }

        //TODO: @JO THIS INTRODUCEA A BUG
        addNarrationTween(tlSegment, this._narrationBox);

        return gsap.timeline().add([tlSegment, tlSubtitle]);
    }

    _getFormattedFooterText(index) {
        const footerValue = textToDisplaySymbols(segmentLevelStrVal(this._segments, index, "footer"));
        const footerTextDiv = document.createElement("div");
        footerTextDiv.innerHTML = footerValue;
        let footerText = footerTextDiv.textContent;

        if (footerText.charCodeAt(0) === 9650) {
            //▲
            footerText = footerText.replace(footerText.charAt(0), `<span style="color:${customCssVariable("--cast-green")}">${footerText.charAt(0)}</span>`);
        }
        if (footerText.charCodeAt(0) === 9660) {
            //▼
            footerText = footerText.replace(footerText.charAt(0), `<span style="color:${customCssVariable("--cast-red")}">${footerText.charAt(0)}</span>`);
        }
        return footerText;
    }
    _getFormattedMetricValue(index) {
        let metricVal = segmentFloatVal(this._segments, index);
        const decimalPlaces = parseInt(segmentLevelStrVal(this._segments, index, "decimals", "0"));
        metricVal = Cast.locale.zeroConvert(metricVal, gStory._language, decimalPlaces);
        const prefix = segmentLevelStrVal(this._segments, index, "prefix");
        const suffix = segmentLevelStrVal(this._segments, index, "suffix");
        const numberGrouping = segmentLevelBool(this._segments, index, "numberGrouping", true);
        let formattedMetricVal = metricVal;
        if (!isNaN(metricVal)) {
            formattedMetricVal = prefix + (prefix.length > 0 ? " " : "") + formatted(metricVal, decimalPlaces, numberGrouping) + (suffix.length > 0 ? " " : "") + suffix;
        }
        return formattedMetricVal;
    }

    _createMetricsWidget(index) {
        const textOverrideForTesting = ""; //"test test really really really really really really long string";
        const titleText = textOverrideForTesting || segmentLevelStrVal(this._segments, index, "title");
        const subtitleText = textOverrideForTesting || this._getFormattedFooterText(index);
        const formattedMetricVal = textOverrideForTesting || this._getFormattedMetricValue(index);

        const segmentPanel = chartContainer(this._base64uuid4 + this._dashSeg + index + "-metricsPanel", "metricsWidget");
        segmentPanel.innerHTML = `
                <div class="metricsWidget_indicator"></div>
                <div class="metricsWidget_title_container">
                    <div class="metricsWidget_title"></div>                              
                </div>
                <div class="metricsWidget_metric"></div>
                <div class="metricsWidget_subtitle"></div>   
            `;

        const segTitle = segmentPanel.querySelector(".metricsWidget_title");
        const segSubtitle = segmentPanel.querySelector(".metricsWidget_subtitle");
        const segmentMetricValue = segmentPanel.querySelector(".metricsWidget_metric");
        const segmentIndicator = segmentPanel.querySelector(".metricsWidget_indicator");

        //segment panel
        gsap.set(segmentPanel, {
            scale: 0.85,
            borderColor: castColor(index),
            background: this._getPanelBackgroundColor(), // backdropFilter: "blur(10px)" instead of bg on woman.jpg bgImgDesktop,
        });

        //segment Title
        gsap.set(segTitle, { color: this._getPanelTextColor(), text: titleText });
        gsap.set(segSubtitle, { color: this._getPanelTextColor(), text: subtitleText });
        gsap.set(segmentMetricValue, { color: this._getPanelTextColor(), text: formattedMetricVal });
        gsap.set(segmentIndicator, { backgroundColor: castColor(index) });

        return segmentPanel;
    }

    _createMetricsImage(source) {
        const inlineImgElement = elementOfTypeAndClass("img");
        const inlineImgContainer = elementOfTypeAndClass("div", "metricsWidgetImage");
        inlineImgContainer.appendChild(inlineImgElement);

        gsap.set(inlineImgElement, { attr: { src: source } });
        gsap.set(inlineImgContainer, {
            autoAlpha: 0,
            borderWidth: "1px",
            borderColor: this._getPanelBorderColor(),
            borderStyle: "solid",
            background: this._getPanelBackgroundColor(),
        });
        return inlineImgContainer;
    }

    _getPanelBackgroundColor() {
        //lets not recalculate everytime
        if (typeof this._cachedPanelBackgroundColor !== "undefined") return this._cachedPanelBackgroundColor;

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

    _getPanelTextColor() {
        //panel text color shadow depends on panel background color if not specified as panelTextColor
        return sceneLevelStrVal(this._chartIdentifier, "panelTextColor", colorWithHigherContrast(this._getPanelBackgroundColor(), "#393531", "#ffffff")); // auto select panel color from text color
    }
}

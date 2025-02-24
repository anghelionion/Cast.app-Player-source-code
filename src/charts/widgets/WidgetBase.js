class WidgetBase {
    constructor(segments, index, chartId, config) {
        this._segments = segments;
        this._index = index;

        this._config = config;

        this._element = null;
        this._borderWidth = "0";
        this._borderColor = null;
    }

    init() {
        const segmentPanel = chartContainer(newBase64uuid4("widgets") + "-seg" + this._index + "-widgetsPanel", "widgetPanel");
        segmentPanel.innerHTML = `Not recognized`;

        gsap.set(segmentPanel, {
            scale: 0.85,
            background: "white",
        });

        this._element = segmentPanel;

        return this._element;
    }

    _getPanelBackgroundColor() {
        return this._config.widgetBackgroundColor || "white";
    }

    _getPanelTextColor() {
        return this._config.widgetTextColor || "#595551";
    }

    getElement() {
        return this._element;
    }

    getTitleElement() {
        return this._element.querySelector(".widgetPanel_title_container");
    }

    getMetricElement() {
        return this._element.querySelector(".widgetPanel_metric");
    }

    getIndicatorElement() {
        return this._element.querySelector(".widgetPanel_indicator");
    }

    _setPanel(segmentPanel, titleText) {
        this._setupBaseSvg(segmentPanel);
        const set = gsap.set;

        const segmentTitle = segmentPanel.querySelector(".widgetPanel_title");

        let borderWidth = "0";
        const contrastColor = contrastDiff(this._getPanelBackgroundColor(), this._config.dashboardBackgroundColor);
        if (contrastColor < 25) {
            borderWidth = "1px";
            this._borderWidth = "1px";
        }
        this._borderColor = hexWithOpacity(this._getPanelTextColor(), 0.3);
        //segment panel
        set(segmentPanel, {
            scale: 0.85,
            background: this._getPanelBackgroundColor(),
            borderColor: this._borderColor,
            borderWidth,
        });

        set(segmentTitle, { color: this._getPanelTextColor(), text: titleText });
    }

    _setupBaseSvg(segmentPanel) {
        const segmentSvgContainer = segmentPanel.querySelector(".widgetPanel_svg_container");
        if (segmentSvgContainer) segmentSvgContainer.innerHTML = SVG.decorativeBackgroundSVG(this._getPanelTextColor(), this._index);
    }

    _getFormattedFooterText(value) {
        const footerValue = textToDisplaySymbols(value);
        const footerTextDiv = document.createElement("div");
        footerTextDiv.innerHTML = footerValue;
        let footerText = footerTextDiv.textContent;

        if (footerText.charCodeAt(0) === 9650) {
            //▲
            footerText = footerText.replace(footerText.charAt(0), `<span style="color:${this._getPanelTextColor()}">${footerText.charAt(0)}</span>`);
        }
        if (footerText.charCodeAt(0) === 9660) {
            //▼
            footerText = footerText.replace(footerText.charAt(0), `<span style="color:${this._getPanelTextColor()}">${footerText.charAt(0)}</span>`);
        }
        return footerText;
    }

    _getDecimals(value) {
        const segment = this._segments[this._index];

        let decimals = segment.decimals;

        if ((!decimals && decimals !== 0) || decimals === "auto") decimals = autoDecimalplaces(value);
        if (decimals === "none" || decimals === 0) decimals = 0;

        return formatted(value, decimals);
    }

    _checkIndicator(value) {
        const colorCoding = this._segments[this._index].colorCoding;

        if (!colorCoding) return;

        let fillColor = "#CB3B43";
        if (value >= colorCoding[0].value && value < colorCoding[1].value) fillColor = "#F59E0B";
        if (value >= colorCoding[1].value) fillColor = "#10B981";

        const divElem = elementOfTypeAndClass("div");
        addClasses(divElem, "widgetPanel_changeIcon");
        divElem.innerHTML = SVG.widgetsChangeIcon(this._getPanelTextColor(), fillColor);
        this._element.append(divElem);
    }

    destroy() {}

    _getTrimmedText(t, fontSize, targetWidth, targetHeight) {
        const w = targetWidth;
        const set = gsap.set;
        const svg = document.createElementNS(gSvgNS, "svg");
        set(svg, { attr: { viewBox: [0, 0, targetWidth, targetHeight].join(" "), width: "100%", height: "100%", preserveAspectRatio: "xMidYMid" } });

        const text = document.createElementNS(gSvgNS, "text");
        set(text, {
            textContent: t,
            attr: {
                fill: "#494541",
                "font-size": fontSize,
                "text-anchor": "start",
                "alignment-baseline": "middle",
                y: 500,
            },
        });
        svg.appendChild(text);
        document.body.appendChild(svg);

        let trimmed = false;
        while (text.getBBox().width > w) {
            trimmed = true;
            t = t.slice(0, t.length - 1);
            set(text, { textContent: t + "..." });
        }

        document.body.removeChild(svg);

        return trimmed ? t + "..." : t;
    }

    doHighLight(index, hilite, tlSegment) {
        tlSegment.to(
            this._element,
            {
                autoAlpha: 1,
                scale: hilite ? 1 : 0.875,
                borderColor: hilite ? castColor(index) : this._borderColor,
                borderWidth: hilite ? "3px" : this._borderWidth,
            },
            0
        );

        tlSegment.to(
            [this.getTitleElement()],
            {
                autoAlpha: 1,
                filter: textHighlightFilter(hilite),
                transform: "translateZ(0)",
            },
            0
        );

        tlSegment.to(
            [this.getMetricElement()],
            {
                filter: hilite ? "grayscale(0)  brightness(1)" : `grayscale(0.5) brightness(.8)`,
                transform: "translateZ(0)",
            },
            0
        );

        tlSegment.to(this.getIndicatorElement(), { height: hilite ? "0px" : 0, top: hilite ? "-10px" : 0 }, 0);
    }

    hasData() {
        const segment = this._segments[this._index];
        const data = segment.data;
        if (data && data.length) return true;
        return false;
    }
}

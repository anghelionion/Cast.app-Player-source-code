class LabelWidget extends WidgetBase {
    constructor(segments, index, chartId, config) {
        super(segments, index, chartId, config);
    }

    init() {
        const set = gsap.set;
        const segment = this._segments[this._index];
        const titleText = segment.title;

        const segmentPanel = chartContainer(newBase64uuid4("widgets") + "-seg" + this._index + "-widgetsPanel", "widgetPanel");
        segmentPanel.innerHTML = `
                <div class="widgetPanel_indicator"></div> 
                <div class="widgetPanel_svg_container">
                </div>
                <div class="widgetPanel_metric widgetPanel_label"></div>
                <div class="widgetPanel_title_container">
                    <div class="widgetPanel_title"></div>  
                </div>
                
            `;

        this._element = segmentPanel;
        this._setPanel(segmentPanel, titleText);
        if (!this.hasData()) return this._element;

        const labels = this._getFormattedLabels();
        const getSvg = this._drawSVGLabel(labels);
        this._element.querySelector(".widgetPanel_metric").innerHTML = getSvg.outerHTML;

        return this._element;
    }

    _drawSVGLabel(labels) {
        const set = gsap.set;
        const svgWidth = 600;
        const svgHeight = 400;

        const svg = document.createElementNS(gSvgNS, "svg");
        svg.setAttribute("viewBox", [0, 0, svgWidth, svgHeight].join(" "));
        svg.setAttribute("style", "width:auto; display:block; margin:auto");
        svg.setAttribute("height", "100%");

        document.body.appendChild(svg);

        let fontSize = 18 * 3;
        const { fontScale, textHeight } = this._getScaleFactor(labels, fontSize, svgWidth, svgHeight);
        fontSize = Math.min(fontSize * fontScale, 220);

        const text = document.createElementNS(gSvgNS, "text");

        set(text, {
            // textContent: label,
            attr: {
                // y: fontSize,
                y: 10,
                x: "50%",
                fill: this._getPanelTextColor(),
                "font-size": fontSize.toString() + "px",
                "text-anchor": "middle",
                "alignment-baseline": "middle",
                // "dominant-baseline": "middle",
                //style: "transform: translate(0px, " + ((svgHeight - fontSize) / 2).toString() + "px)",
            },
        });

        for (let i = 0; i < labels.length; i++) {
            const l = labels[i];
            const fontScale = l.fontScale || 1;
            const opacity = l.opacity || 1;
            const isBold = l.isBold || "normal";

            const tspan = document.createElementNS(gSvgNS, "tspan");
            set(tspan, {
                textContent: l.value,
                attr: {
                    // y: this._getTextY(),
                    "font-weight": isBold,
                    // "text-anchor": "middle",
                    // "alignment-baseline": "bottom",
                    // "dominant-baseline": "bottom",
                    opacity,
                    "font-size": (fontSize * fontScale).toString() + "px",
                },
            });
            text.append(tspan);
        }

        svg.appendChild(text);

        set(text, {
            attr: {
                y: svgHeight / 2 + text.getBBox().height / 2,
            },
        });
        document.body.removeChild(svg);
        return svg;
    }

    _getScaleFactor(labels, fontSize, targetWidth, targetHeight) {
        const set = gsap.set;
        const svg = document.createElementNS(gSvgNS, "svg");
        set(svg, { attr: { viewBox: [0, 0, targetWidth, targetHeight].join(" "), width: "100%", height: "100%", preserveAspectRatio: "xMidYMid" } });

        const text = document.createElementNS(gSvgNS, "text");
        set(text, {
            attr: {
                y: "50%",
                x: "50%",
                fill: "#494541",
                "font-size": fontSize.toString() + "px",
                "text-anchor": "middle",
                "alignment-baseline": "middle",
            },
        });

        for (let i = 0; i < labels.length; i++) {
            const l = labels[i];

            const tspan = document.createElementNS(gSvgNS, "tspan");
            set(tspan, {
                textContent: l.value,
                attr: {
                    "font-weight": l.isBold ? "bold" : "normal",
                },
            });
            text.append(tspan);
        }

        svg.appendChild(text);
        document.body.appendChild(svg);

        const bBox = text.getBBox();
        const scaleX = targetWidth / bBox.width;
        const scaleY = targetHeight / bBox.height;
        const scale = Math.min(scaleX, scaleY) - 0.1;

        document.body.removeChild(svg);
        return { fontScale: scale, textHeight: bBox.height };
    }

    _getFormattedLabels() {
        const segment = this._segments[this._index];
        return [{ value: segment.data[0].value }];
    }
}

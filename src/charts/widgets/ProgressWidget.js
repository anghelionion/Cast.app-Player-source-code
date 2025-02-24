class ProgressWidget extends WidgetBase {
    constructor(segments, index, chartId, config) {
        super(segments, index, chartId, config);
    }

    _getWidgetData(data) {
        const o = {
            min: 0,
            max: 0,
            progress: 0,
        };

        if (data) {
            if (data.length == 1) {
                o.progress = data[0].value;
                o.min = (0.9 * parseFloat(o.progress)).toFixed(0);
                o.max = (1.1 * parseFloat(o.progress)).toFixed(0);
            }

            if (data.length == 2) {
                o.progress = data[1].value;
                o.min = data[0].value;
                o.max = (1.1 * parseFloat(o.progress)).toFixed(0);
                if (parseFloat(o.min) > parseFloat(o.progress)) {
                    o.max = o.min;
                    o.min = (0.9 * parseFloat(o.progress)).toFixed(0);
                }
            }

            if (data.length > 2) {
                o.progress = data[1].value;
                o.min = data[0].value;
                o.max = data[2].value;
            }
        }

        return o;
    }

    init() {
        const set = gsap.set;
        const segment = this._segments[this._index];
        const titleText = segment.title;

        const segmentPanel = chartContainer(newBase64uuid4("widgets") + "-seg" + this._index + "-widgetsPanel", "widgetPanel");
        segmentPanel.innerHTML = `               
                <div class="widgetPanel_indicator"></div>        
                <div class="widgetPanel_metric widgetPanel_doughnut">                 
                </div>
                <div class="widgetPanel_title_container">
                    <div class="widgetPanel_title"></div>                                              
                </div>                
            `;

        this._element = segmentPanel;
        this._setPanel(segmentPanel, titleText);
        if (!this.hasData()) return this._element;

        const data = this._getWidgetData(segment.data);
        const displayValue = this._getDecimals(data.progress);

        const getSvg = this._drawSVG(data);
        this._element.querySelector(".widgetPanel_metric").innerHTML = getSvg.outerHTML;

        this._checkIndicator(displayValue);

        //Remove arrow if displayValue is clamped
        const p = (displayValue - data.min) / (data.max - data.min);
        if (p > 1 || p < 0) {
            set(segmentPanel.querySelector(".metricArrow"), { autoAlpha: 0 });
        }

        this._positionProgressBar(data.progress, data.min, data.max, true);

        let fontHint = extractMetadataProperty(gStory.getUntranslatedStory(), "fontHint");
        if (fontHint.toLowerCase() === "default") fontHint = "";

        if (fontHint !== "") {
            document.fonts.onloadingdone = () => {
                //Redraw
                this._element.querySelector(".widgetPanel_metric").innerHTML = this._drawSVG(data).outerHTML;
                this._positionProgressBar(data.progress, data.min, data.max, true);
            };
        }

        return this._element;
    }

    _positionProgressBar(progressValue, minValue, maxValue, animate = false) {
        const segmentPanel = this._element;
        const metric_box = segmentPanel.querySelector(".metricContainer");
        const metric_arrow = segmentPanel.querySelector(".metricArrow");
        const progressWidth = 2400;
        const metricBoxWidth = metric_box.getBBox().width;
        const metricArrowWidth = metric_arrow.getBBox().width;

        const percent = gsap.utils.clamp(0, 1, (progressValue - minValue) / (maxValue - minValue));

        const metric_boxX = (progressWidth - metricBoxWidth) * percent;
        const metric_arrowX = gsap.utils.clamp(metric_boxX + 60, metric_boxX + metricBoxWidth - metricArrowWidth - 60, (progressWidth - metricArrowWidth) * percent);

        const tl = gsap.timeline();
        tl.to(metric_box, animate ? 0.6 : 0, { x: metric_boxX });
        tl.to(metric_arrow, animate ? 0.6 : 0, { x: metric_arrowX }, 0);
    }

    _drawSVG(data, redraw = false) {
        const set = gsap.set;
        const svgWidth = 2400;
        const svgHeight = 1000;
        const segment = this._segments[this._index];
        const displayValue = this._getDecimals(data.progress);

        const svg = document.createElementNS(gSvgNS, "svg");
        set(svg, {
            attr: {
                viewBox: [0, 0, svgWidth, svgHeight].join(" "),
                //style: "background:red",
            },
        });

        const minMaxFontSize = 160;
        const minMaxY = svgHeight - 20;
        let text = document.createElementNS(gSvgNS, "text");
        set(text, {
            textContent: [segment.prefix, data.min, segment.suffix].join(""),
            attr: {
                y: minMaxY,
                x: 0,
                fill: this._getPanelTextColor(),
                "font-size": minMaxFontSize,
                "text-anchor": "start",
                //"alignment-baseline": "middle",
            },
        });
        svg.appendChild(text);

        text = document.createElementNS(gSvgNS, "text");
        set(text, {
            textContent: [segment.prefix, data.max, segment.suffix].join(""),
            attr: {
                y: minMaxY,
                x: svgWidth,
                fill: this._getPanelTextColor(),
                "font-size": minMaxFontSize,
                "text-anchor": "end",
                //"alignment-baseline": "middle",
            },
        });
        svg.appendChild(text);

        const progressBarHeight = 160;
        const rect = document.createElementNS(gSvgNS, "rect");
        set(rect, {
            attr: {
                rx: progressBarHeight / 4,
                fill: this._getPanelTextColor(),
                width: svgWidth,
                height: progressBarHeight,
                x: 0,
                y: minMaxY - minMaxFontSize - progressBarHeight,
            },
        });

        svg.appendChild(rect);

        const path = document.createElementNS(gSvgNS, "polygon");
        const w = 20 * 3,
            h = 10 * 3;

        const points = [[0, 0].join(","), [w / 2, h].join(","), [w, 0].join(",")].join(" ");
        set(path, {
            x: 60,
            y: minMaxY - minMaxFontSize - progressBarHeight - h - 24,
            attr: {
                points,
                fill: this._getPanelTextColor(),
                class: "metricArrow",
            },
        });

        svg.appendChild(path);

        const labels = [
            { value: segment.prefix, isBold: false, opacity: 0.7, fontScale: 0.8 },
            { value: displayValue, isBold: false },
            { value: segment.suffix, isBold: false, opacity: 0.7, fontScale: 0.8 },
        ];

        const fontSize = 360;
        text = document.createElementNS(gSvgNS, "text");
        set(text, {
            attr: {
                fill: this._getPanelBackgroundColor(),
                "font-size": fontSize,
                "text-anchor": "start",
                "alignment-baseline": "middle",
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
                    "font-weight": isBold,
                    opacity,
                    "font-size": fontSize * fontScale,
                },
            });
            text.append(tspan);
        }

        svg.appendChild(text);
        document.body.appendChild(svg);

        const bBox = text.getBBox();

        const metricContainer = document.createElementNS(gSvgNS, "g");
        const metricBox = document.createElementNS(gSvgNS, "rect");
        const metricBoxPaddingX = 40;
        set(metricBox, {
            attr: {
                rx: bBox.height / 6,
                fill: this._getPanelTextColor(),
                width: bBox.width + metricBoxPaddingX * 2,
                height: bBox.height,
            },
        });

        set(text, {
            attr: {
                y: bBox.height / 2 + fontSize / 2 - 50,
                x: metricBoxPaddingX,
            },
        });
        svg.appendChild(metricContainer);
        metricContainer.appendChild(metricBox);
        metricContainer.appendChild(text);

        set(metricContainer, { x: 0, y: minMaxY - minMaxFontSize - progressBarHeight - bBox.height - h - 20, attr: { class: "metricContainer" } });

        document.body.removeChild(svg);

        return svg;
    }
}

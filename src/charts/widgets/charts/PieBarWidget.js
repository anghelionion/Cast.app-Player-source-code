class PieBarWidget extends WidgetBase {
    constructor(segments, index, chartId, config) {
        super(segments, index, chartId, config);

        this._CLUB_INDEX = 5;
    }

    _getWidgetData(data) {
        if (data.length - this._CLUB_INDEX > 1) {
            const firstItems = data.slice(0, this._CLUB_INDEX);
            const lastItems = data.slice(this._CLUB_INDEX);

            const lastItemsTotal = lastItems.reduce((acc, val) => ({ value: acc.value + val.value })).value;

            firstItems.push({ name: "Other " + [this._CLUB_INDEX + 1, data.length].join(" - "), value: lastItemsTotal });
            return firstItems;
        }
        return data;
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
        const getSvg = this._drawSVG(data);
        this._element.querySelector(".widgetPanel_metric").innerHTML = getSvg.outerHTML;

        this._checkIndicator(data[data.length - 1].value);

        return this._element;
    }

    _drawSVG(data) {
        const set = gsap.set;
        const svgWidth = 2400;
        const svgHeight = 1000;

        const svg = document.createElementNS(gSvgNS, "svg");
        set(svg, {
            attr: {
                viewBox: [0, 0, svgWidth, svgHeight].join(" "),
            },
        });

        const dataTotal = data.reduce((acc, val) => ({ value: acc.value + val.value })).value;

        const container = document.createElementNS(gSvgNS, "g");

        const barX = 20;

        const borderRadius = 50;
        const barHeight = svgHeight / 6;
        let lastBarX = 0;

        const legendRowGap = 40;
        const legendRowHeight = 80 * 2;
        const legendColorHeight = 50 * 2;
        const startY = 400;
        let currentLegendY = startY;

        set(container, {
            y: (startY - barHeight) / 2,
        });

        for (let i = 0; i < data.length; i++) {
            const p = data[i].value;
            const label = data[i].name;

            const barWidth = (p / dataTotal) * (svgWidth - 2 * barX);

            let path = null;
            if (data.length === 1) {
                //draw rounded
                path = document.createElementNS(gSvgNS, "rect");
                set(path, {
                    attr: {
                        rx: borderRadius,
                        width: barWidth,
                        height: barHeight,
                        fill: castColor(i),
                    },
                });
            } else {
                if (i === 0) {
                    path = this._getSVGRectRoundedLeft(castColor(i), barWidth, barHeight, borderRadius);
                } else if (i === data.length - 1) {
                    path = this._getSVGRectRoundedRight(castColor(i), barWidth, barHeight, borderRadius);
                } else {
                    path = document.createElementNS(gSvgNS, "rect");
                    set(path, {
                        attr: {
                            width: barWidth,
                            height: barHeight,
                            fill: castColor(i),
                        },
                    });
                }
            }

            set(path, {
                x: barX + lastBarX,
            });
            container.appendChild(path);

            lastBarX += barWidth;

            const legendStartX = i % 2 == 0 ? barX + 20 : svgWidth / 2 + 20;

            const pathLegend = document.createElementNS(gSvgNS, "rect");
            set(pathLegend, {
                attr: {
                    rx: legendColorHeight / 5,
                    y: currentLegendY + (legendRowHeight - legendColorHeight) / 2,
                    x: legendStartX,
                    height: legendColorHeight,
                    width: legendColorHeight,
                    fill: castColor(i),
                },
            });

            svg.appendChild(pathLegend);

            const textGap = 20 * 2;

            const textWidth = data.length === 1 ? svgWidth - (legendColorHeight + textGap) : svgWidth / 2 - (legendColorHeight + textGap);
            const t = this._getTrimmedText(label, legendRowHeight, textWidth - 60, svgHeight);

            const text = document.createElementNS(gSvgNS, "text");
            set(text, {
                textContent: t,
                attr: {
                    y: currentLegendY + legendRowHeight / 2 + 16,
                    x: legendStartX + legendColorHeight + textGap,
                    fill: this._getPanelTextColor(),
                    "font-size": legendRowHeight,
                    "text-anchor": "start",
                    "alignment-baseline": "middle",
                },
            });

            svg.appendChild(text);

            if (i % 2 == 1) {
                currentLegendY += legendRowHeight + legendRowGap;
            }
        }

        svg.appendChild(container);

        return svg;
    }

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

    _getSVGRectRoundedRight(fill, barWidth, barHeight, borderRadius) {
        const container = document.createElementNS(gSvgNS, "g");

        const pathStr =
            `M 0,0 ` +
            "h " +
            (barWidth - borderRadius) +
            " " +
            `q${borderRadius},0 ${borderRadius},${borderRadius} ` +
            " " +
            "v" +
            (barHeight - 2 * borderRadius) +
            `q0,${borderRadius} -${borderRadius},${borderRadius} ` +
            "h-" +
            (barWidth - borderRadius) +
            " " +
            "Z";

        const path = document.createElementNS(gSvgNS, "path");
        gsap.set(path, {
            attr: {
                d: pathStr,
                fill,
            },
        });

        container.appendChild(path);

        return container;
    }
    _getSVGRectRoundedLeft(fill, barWidth, barHeight, borderRadius) {
        const container = document.createElementNS(gSvgNS, "g");

        const pathStr =
            `M ${barWidth},${barHeight} ` +
            "h-" +
            (barWidth - borderRadius) +
            " " +
            `q-${borderRadius},0 -${borderRadius},-${borderRadius} ` +
            "v-" +
            (barHeight - 2 * borderRadius) +
            ` q0,-${borderRadius} ${borderRadius},-${borderRadius} ` +
            "h " +
            (barWidth - borderRadius) +
            " Z";

        const path = document.createElementNS(gSvgNS, "path");
        gsap.set(path, {
            attr: {
                d: pathStr,
                fill,
            },
        });

        container.appendChild(path);

        return container;
    }
}

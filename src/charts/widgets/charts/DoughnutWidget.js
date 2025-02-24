class DoughnutWidget extends WidgetBase {
    constructor(segments, index, chartId, config) {
        super(segments, index, chartId, config);

        this._CLUB_INDEX = 6;
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
        const getSvg = this._drawSVGCircle(data);
        this._element.querySelector(".widgetPanel_metric").innerHTML = getSvg.outerHTML;

        this._checkIndicator(data[data.length - 1].value);

        return this._element;
    }

    _drawSVGCircle(data) {
        const set = gsap.set;
        const svgWidth = 2400;
        const svgHeight = 1000;

        const svg = document.createElementNS(gSvgNS, "svg");
        set(svg, {
            attr: {
                viewBox: [0, 0, svgWidth, svgHeight].join(" "),
            },
        });

        const circleContainer = document.createElementNS(gSvgNS, "g");
        set(circleContainer, { x: svgWidth / 4, y: svgHeight / 2 });

        const legendContainer = document.createElementNS(gSvgNS, "g");
        set(legendContainer, { x: svgWidth / 2, y: svgHeight / 2 });

        const dataTotal = data.reduce((acc, val) => ({ value: acc.value + val.value })).value;

        const cx = 0;
        const cy = 0;
        const { strokeWidth, radius, circumference, circumferenceWithGap } = this._getCircleFormat(svgHeight * 0.8);

        let angleOffset = -90;

        const legendRowGap = 10;

        const legendRowHeight = (svgHeight - legendRowGap * 6) / 6;
        const legendColorHeight = legendRowHeight * 0.6;

        let startY = -((legendRowHeight + legendRowGap) * data.length - legendRowGap) / 2;

        for (let i = 0; i < data.length; i++) {
            const o = data[i].value;
            const label = data[i].name;
            const circle = document.createElementNS(gSvgNS, "circle");

            set(circle, {
                attr: {
                    cy,
                    cx,
                    r: radius,
                    "stroke-width": strokeWidth,
                    stroke: castColor(i),
                    fill: "transparent",

                    "stroke-dasharray": circumferenceWithGap,
                    "stroke-dashoffset": circumference - (o / dataTotal) * circumference,
                    transform: `rotate(${angleOffset},${cx},${cy})`,
                },
            });

            angleOffset = (o / dataTotal) * 360 + angleOffset;

            circleContainer.appendChild(circle);

            //legend
            const path = document.createElementNS(gSvgNS, "rect");
            set(path, {
                attr: {
                    rx: legendColorHeight / 5,
                    y: startY + (legendRowHeight + legendRowGap) * i + (legendRowHeight - legendColorHeight) / 2,
                    x: 0,
                    height: legendColorHeight,
                    width: legendColorHeight,
                    fill: castColor(i),
                },
            });

            const textGap = 20 * 2;
            const t = this._getTrimmedText(label, legendRowHeight, svgWidth / 2 - (legendColorHeight + textGap), svgHeight);

            const text = document.createElementNS(gSvgNS, "text");
            set(text, {
                textContent: t,
                attr: {
                    y: startY + (legendRowHeight + legendRowGap) * i + legendRowHeight / 2 + 16,
                    x: legendColorHeight + textGap,
                    fill: this._getPanelTextColor(),
                    "font-size": legendRowHeight,
                    "text-anchor": "start",
                    "alignment-baseline": "middle",
                },
            });
            legendContainer.appendChild(text);
            legendContainer.appendChild(path);
        }

        if (-startY > svgHeight / 2) {
            const scale = svgHeight / (-startY * 2);
            set(legendContainer, { scale });
        }

        svg.appendChild(circleContainer);
        svg.appendChild(legendContainer);
        return svg;
    }

    _getCircleFormat(circleHeight) {
        const circleDiameter = circleHeight;
        const strokeWidth = 60 * 2;

        const radius = (circleDiameter - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const circumferenceWithGap = circumference;

        return { strokeWidth, radius, circumference, circumferenceWithGap };
    }
}

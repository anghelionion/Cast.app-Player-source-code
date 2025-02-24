class BarWidget extends WidgetBase {
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
                <div class="widgetPanel_metric widgetPanel_bar">                        
                </div>
                <div class="widgetPanel_title_container">
                    <div class="widgetPanel_title"></div>                                                  
                </div>                
            `;

        this._element = segmentPanel;
        this._setPanel(segmentPanel, titleText);
        if (!this.hasData()) return this._element;

        const data = this._getWidgetData(segment.data);
        const getSvg = this._drawSVGBars(data);
        this._element.querySelector(".widgetPanel_metric").innerHTML = getSvg.outerHTML;

        this._checkIndicator(data[data.length - 1].value);

        return this._element;
    }

    _drawSVGBars(points) {
        const set = gsap.set;
        const svgWidth = 1000;
        const svgHeight = 400;

        const svg = document.createElementNS(gSvgNS, "svg");
        set(svg, {
            attr: {
                viewBox: [0, 0, svgWidth, svgHeight].join(" "),
            },
        });

        const maxValue = Math.max(...points.map((o) => o.value));

        const fontSize = svgHeight / 7;
        const rowGap = 10;
        const rowHeight = (svgHeight - rowGap * 6) / 6;

        let barPointsLength = points.length - 1;
        if (barPointsLength < 2) barPointsLength = 2;

        const barHeight = Math.max(rowHeight / 3, rowHeight * (2 / barPointsLength));

        const startY = svgHeight / 2 - ((rowHeight + rowGap) * points.length - rowGap) / 2;

        const container = document.createElementNS(gSvgNS, "g");

        for (let i = 0; i < points.length; i++) {
            const p = points[i].value;

            const barWidth = (p / maxValue) * (svgWidth / 2);

            const path = document.createElementNS(gSvgNS, "rect");
            set(path, {
                attr: {
                    rx: barHeight / 3,
                    y: startY + (rowHeight + rowGap) * i + (rowHeight - barHeight) / 2,
                    x: svgWidth / 2,
                    height: barHeight,
                    width: barWidth,
                    fill: this._getPanelTextColor(),
                },
            });
            container.appendChild(path);

            let t = points[i].name;
            t = this._getTrimmedText(t, fontSize, svgWidth / 2 - 32, svgHeight);

            const text = document.createElementNS(gSvgNS, "text");
            set(text, {
                textContent: t,
                attr: {
                    y: startY + (rowHeight + rowGap) * i + rowHeight / 2,
                    x: svgWidth / 2 - 20,
                    fill: this._getPanelTextColor(),
                    "font-size": fontSize,
                    "text-anchor": "end",
                    "alignment-baseline": "middle",
                },
            });
            container.appendChild(text);
        }

        if (startY < 0) {
            const scale = svgHeight / (-startY * 2 + svgHeight);
            set(container, { scale, transformOrigin: "50% 50%" });
        }

        svg.appendChild(container);

        return svg;
    }
}

class FunnelWidget extends WidgetBase {
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
        const segment = this._segments[this._index];
        const titleText = segment.title;

        const segmentPanel = chartContainer(newBase64uuid4("widgets") + "-seg" + this._index + "-widgetsPanel", "widgetPanel");
        segmentPanel.innerHTML = `
                <div class="widgetPanel_indicator"></div>                
                <div class="widgetPanel_metric widgetPanel_funnel">                          
                </div>
                <div class="widgetPanel_title_container">
                    <div class="widgetPanel_title"></div>   
                </div>                
            `;

        this._element = segmentPanel;
        this._setPanel(segmentPanel, titleText);

        if (!this.hasData()) return this._element;

        const data = this._getWidgetData(segment.data);

        let funnelMode = true;

        for (let index = 0; index < data.length; index++) {
            const idx = gsap.utils.clamp(0, data.length - 1, index);
            if (data[this._clampValue(index)].value > data[this._clampValue(index - 1)].value) funnelMode = false;
        }

        const getSvg = funnelMode ? this._drawSVG(data) : this._drawSVGHannoi(data);
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

        const maxValue = Math.max(...data.map((o) => o.value));
        const maxBarWidth = svgWidth * 0.6 - 2 * 20;

        const rowGap = 10;
        const rowHeight = (svgHeight - rowGap * 6) / 6;
        const barHeight = rowHeight;
        const fontSize = rowHeight;

        const startY = svgHeight - (rowHeight + rowGap) * data.length;
        // const startY = 0;

        for (let i = 0; i < data.length; i++) {
            const p = data[i].value;
            let t = data[i].name;

            let barWidth = (p / maxValue) * maxBarWidth;
            let nextBarWidth = barWidth / 2;

            if (i < data.length - 1) {
                nextBarWidth = (data[i + 1].value / maxValue) * maxBarWidth;
            }
            let difference = (barWidth - nextBarWidth) / 2;

            const pathX = (svgWidth * 0.6 - barWidth) / 2;
            const pathY = startY + (rowHeight + rowGap) * i;

            const path = document.createElementNS(gSvgNS, "polygon");
            let rightBottomCornerY = pathY + barHeight;
            if (data.length > 1 && i === data.length - 1) rightBottomCornerY -= barHeight / 6;
            const points = [
                [pathX, pathY].join(","),
                [pathX + barWidth, pathY].join(","),
                [pathX + barWidth - difference, rightBottomCornerY].join(","),
                [pathX + difference, pathY + barHeight].join(","),
            ].join(" ");
            set(path, {
                attr: {
                    points,
                    fill: castColor(i),
                },
            });

            svg.appendChild(path);

            barWidth = Math.max(barWidth, nextBarWidth);

            t = this._getTrimmedText(t, fontSize, svgWidth - ((svgWidth * 0.6 - barWidth) / 2 + barWidth + 40), svgHeight);
            const text = document.createElementNS(gSvgNS, "text");
            set(text, {
                textContent: t,
                attr: {
                    y: startY + (rowHeight + rowGap) * i + rowHeight - 20,
                    x: (svgWidth * 0.6 - barWidth) / 2 + barWidth + 40,
                    fill: this._getPanelTextColor(),
                    "font-size": fontSize,
                    "text-anchor": "start",
                },
            });
            svg.appendChild(text);
        }

        return svg;
    }

    _drawSVGHannoi(data) {
        const set = gsap.set;

        const svgWidth = 2400;
        const svgHeight = 1000;

        const svg = document.createElementNS(gSvgNS, "svg");
        set(svg, {
            attr: {
                viewBox: [0, 0, svgWidth, svgHeight].join(" "),
            },
        });

        const maxValue = Math.max(...data.map((o) => o.value));
        const maxBarWidth = svgWidth * 0.6 - 2 * 20;

        const rowGap = 10;
        const rowHeight = (svgHeight - rowGap * 6) / 6;
        const barHeight = rowHeight;
        const fontSize = rowHeight;

        const startY = svgHeight - (rowHeight + rowGap) * data.length;
        // const startY = 0;

        for (let i = 0; i < data.length; i++) {
            const p = data[i].value;
            let t = data[i].name;

            const barWidth = (p / maxValue) * maxBarWidth;

            const path = document.createElementNS(gSvgNS, "rect");
            set(path, {
                attr: {
                    rx: barHeight / 3,
                    y: startY + (rowHeight + rowGap) * i,
                    x: (svgWidth * 0.6 - barWidth) / 2,
                    height: barHeight,
                    width: barWidth,
                    fill: castColor(i),
                },
            });

            svg.appendChild(path);

            t = this._getTrimmedText(t, fontSize, svgWidth - ((svgWidth * 0.6 - barWidth) / 2 + barWidth + 40), svgHeight);
            const text = document.createElementNS(gSvgNS, "text");
            set(text, {
                textContent: t,
                attr: {
                    y: startY + (rowHeight + rowGap) * i + rowHeight - 20,
                    x: (svgWidth * 0.6 - barWidth) / 2 + barWidth + 40,
                    fill: this._getPanelTextColor(),
                    "font-size": fontSize,
                    "text-anchor": "start",
                },
            });
            svg.appendChild(text);
        }

        return svg;
    }

    _clampValue(value, max) {
        return gsap.utils.clamp(0, max, value);
    }
}

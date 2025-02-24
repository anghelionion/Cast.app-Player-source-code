class SparkBarWidget extends WidgetBase {
    constructor(segments, index, chartId, config) {
        super(segments, index, chartId, config);

        this._MAX_ITEMS = 50;
    }

    _getWidgetData(data) {
        const values = data.map((o) => parseFloat(o.value));
        return values.slice(0, this._MAX_ITEMS);
    }

    init() {
        const set = gsap.set;
        const segment = this._segments[this._index];
        const titleText = segment.title;
        const data = this._getWidgetData(segment.data);
        const getSvg = this._getSvgBars(data);

        const segmentPanel = chartContainer(newBase64uuid4("widgets") + "-seg" + this._index + "-widgetsPanel", "widgetPanel");
        segmentPanel.innerHTML = `
                <div class="widgetPanel_indicator"></div>                
                <div class="widgetPanel_metric widgetPanel_sparkLine">

                 ${getSvg.outerHTML}
                 <div class="widgetPanel_sparkLine_minMax">
                     <div class="widgetPanel_sparkLine_minMax_max">1</div>
                     <div class="widgetPanel_sparkLine_minMax_half">0.5</div>
                     <div class="widgetPanel_sparkLine_minMax_min">0</div>                 
                 </div>
                </div>
                <div class="widgetPanel_title_container">
                    <div class="widgetPanel_title"></div>  
                </div>
                
            `;

        this._element = segmentPanel;
        this._setPanel(segmentPanel, titleText);
        if (!this.hasData()) return this._element;

        set(segmentPanel.querySelector(".widgetPanel_sparkLine_minMax"), { color: this._getPanelTextColor() });

        const maxValue = Math.max(...data);
        set(segmentPanel.querySelector(".widgetPanel_sparkLine_minMax_max"), { text: [segment.prefix, this._getDecimals(maxValue), segment.suffix].join("") });
        set(segmentPanel.querySelector(".widgetPanel_sparkLine_minMax_half"), { text: [segment.prefix, this._getDecimals(maxValue / 2), segment.suffix].join("") });

        this._checkIndicator(data[data.length - 1]);

        return this._element;
    }

    _getSvgBars(points) {
        const set = gsap.set;

        const svgWidth = 2400;
        const svgHeight = 1000;

        const svg = document.createElementNS(gSvgNS, "svg");
        set(svg, {
            attr: {
                viewBox: [0, 0, svgWidth, svgHeight].join(" "),
                width: "100%",
                height: "100%",
                preserveAspectRatio: "none",
            },
        });

        if (!this.hasData()) return svg;

        const maxValue = Math.max(...points);

        let startX = 10;
        const barGap = 10;
        const centerBars = false;
        let w = (svgWidth - startX * 2 - points.length * barGap) / points.length;
        if (w > svgWidth / 6) {
            w = svgWidth / 6;
            startX = svgWidth - (w * points.length + (points.length - 1) * barGap);
        }

        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const barHeight = (p / maxValue) * svgHeight;

            const path = document.createElementNS(gSvgNS, "rect");
            set(path, {
                attr: {
                    rx: w / 5,
                    y: svgHeight - barHeight,
                    x: startX + (w + barGap) * i,
                    height: barHeight,
                    width: w,
                    fill: this._getPanelTextColor(),
                },
            });

            svg.appendChild(path);
        }

        return svg;
    }
}

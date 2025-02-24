class SparkLineWidget extends WidgetBase {
    constructor(segments, index, chartId, config) {
        super(segments, index, chartId, config);

        this._MAX_ITEMS = 100;
    }

    _getWidgetData(data) {
        const values = data.map((o, index) => [index.toString(), parseFloat(o.value).toString()]);

        return values.slice(0, this._MAX_ITEMS);
    }

    init() {
        const set = gsap.set;
        const segment = this._segments[this._index];
        const titleText = segment.title;
        const areaPoints = this._getWidgetData(segment.data);
        const maxValue = Math.max(...areaPoints.map((o) => o[1]));

        const areaColor = this._getPanelTextColor();

        const getSvg = this._getSvgAreaLine_2(
            areaPoints,
            [],
            [],
            [],
            [],
            0.03,
            2400,
            1000,
            350,
            areaColor,
            areaColor,
            "sparkline-svg",
            "",
            "",
            0.5,
            areaColor,
            areaColor,
            areaColor,
            areaColor,
            areaColor,
            "#10B981"
        );

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
        set(segmentPanel.querySelector(".widgetPanel_sparkLine svg path"), { attr: { stroke: this._getPanelTextColor() } });

        set(segmentPanel.querySelector(".widgetPanel_sparkLine_minMax_max"), { text: [segment.prefix, this._getDecimals(maxValue), segment.suffix].join("") });
        set(segmentPanel.querySelector(".widgetPanel_sparkLine_minMax_half"), { text: [segment.prefix, this._getDecimals(maxValue / 2), segment.suffix].join("") });

        this._checkIndicator(areaPoints[areaPoints.length - 1][1]);

        return this._element;
    }

    _getSvgAreaLine_2(
        areaPoints,
        area2Points,
        lineLowPoints,
        linePoints,
        lineHighPoints,
        smoothing,
        width,
        height,
        segmentHeight,
        topStopColor,
        bottomStopColor,
        idSvg,
        maxXPoint,
        maxYPoint,
        strokeWidthPercent,
        markerColor,
        lineLowColor,
        lineColor,
        lineHighColor,
        areaDataColor,
        area2DataColor
    ) {
        if (areaPoints.length === 0 && area2Points.length === 0 && lineLowPoints.length === 0 && linePoints.length === 0 && lineHighPoints.length === 0) return "";

        const { ap, a2p, llp, lp, lhp, z, afm, lfm } = fixAreaLine(areaPoints, area2Points, lineLowPoints, linePoints, lineHighPoints, width, height, maxXPoint, maxYPoint);

        areaPoints = ap;

        areaPoints.pop();

        const svg = document.createElementNS(gSvgNS, "svg");
        setSvg(svg, width, height, idSvg);

        this._addSparkLine(svg, idSvg, areaPoints, smoothing, areaDataColor, areaDataColor, "1");

        return svg;
    }

    _addSparkLine(svg, idSvg, points, smoothing, topStopColor, bottomStopColor, uniqueAreaID) {
        if (points.length < 0) return;
        const path = document.createElementNS(gSvgNS, "path");
        path.setAttribute("d", this._getD(points, this._lineCommand, smoothing));
        path.setAttribute("id", idSvg + "-area");
        svg.appendChild(path);
        svg.appendChild(gdefs("lg" + uniqueAreaID + idSvg, topStopColor, bottomStopColor));
    }

    _lineCommand(point) {
        return `L ${point[0]},${point[1]}`;
    }

    _getD(points, command, smoothing) {
        return points.reduce((acc, point, i, a) => (i === 0 ? `M ${point[0]},${points[1][1]}` : `${acc} ${command(point, i, a, smoothing)}`), "");
    }

    hasData() {
        const segment = this._segments[this._index];
        const data = segment.data;
        if (data && data.length && data.length > 1) return true;
        return false;
    }
}

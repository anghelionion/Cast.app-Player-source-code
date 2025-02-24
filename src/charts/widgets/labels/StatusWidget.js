class StatusWidget extends WidgetBase {
    _icons = {
        ok: SVG.widgetsStatusOK,
        warning: SVG.widgetsStatusWarning,
        problem: SVG.widgetsStatusProblem,
    };

    constructor(segments, index, chartId, config) {
        super(segments, index, chartId, config);
    }

    init() {
        const set = gsap.set;
        const segment = this._segments[this._index];
        const titleText = segment.title;
        const data = segment.data;

        const colorCoding = segment.colorCoding;
        const value = data[data.length - 1].value;

        let icon = "problem";
        if (colorCoding) {
            if (value >= colorCoding[0].value && value < colorCoding[1].value) icon = "warning";
            if (value >= colorCoding[1].value) icon = "ok";
        }

        const svgIcon = this._icons[icon] || function () {};

        const segmentPanel = chartContainer(newBase64uuid4("widgets") + "-seg" + this._index + "-widgetsPanel", "widgetPanel");
        segmentPanel.innerHTML = `               
                <div class="widgetPanel_indicator"></div>
                <div class="widgetPanel_metric widgetPanel_status">
                    ${svgIcon(this._getPanelTextColor())}                
                </div>
                <div class="widgetPanel_title_container">
                    <div class="widgetPanel_title"></div>                              
                </div>
                
            `;

        this._element = segmentPanel;
        this._setPanel(segmentPanel, titleText);
        if (!this.hasData()) return this._element;

        this._checkIndicator(data[data.length - 1].value);

        return this._element;
    }
}

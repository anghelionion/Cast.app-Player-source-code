class PercentageWidget extends WidgetBase {
    constructor(segments, index, chartId, config) {
        super(segments, index, chartId, config);
    }

    _getWidgetData(data) {
        const o = {
            p: 0,
            subtitleText: null,
        };

        if (data) {
            if (data.length == 1) {
                o.p = parseFloat(data[0].value);
            }
            if (data.length > 1) {
                const value = parseFloat(data[data.length - 1].value);
                const compareValue = parseFloat(data[0].value);

                let changeText = value > compareValue ? "'up' " : "'down'";
                changeText += (Math.abs((value - compareValue) / compareValue) * 100).toFixed(0) + "%";

                o.p = value;
                o.subtitleText = this._getFormattedFooterText(changeText);
            }

            o.p = parseFloat(o.p) * 100;
        }

        return o;
    }

    init() {
        const set = gsap.set;
        const segment = this._segments[this._index];
        const titleText = segmentLevelStrVal(this._segments, this._index, "title");

        const { p, subtitleText } = this._getWidgetData(segment.data);

        const segmentPanel = chartContainer(newBase64uuid4("widgets") + "-seg" + this._index + "-widgetsPanel", "widgetPanel");
        segmentPanel.innerHTML = `
                <div class="widgetPanel_indicator"></div>             
                <div class="widgetPanel_metric widgetPanel_percentage">
                  <svg viewBox="0 0 36 36" class="widget-percentage">
                      <path class="widget-percentage-bg"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path class="widget-percentage-circle"                       
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <text x="18" y="21.35" class="widget-percentage-percentage"><tspan class="widget-percentage-percentage-value">0</tspan><tspan class="widget-percentage-percentage-value-suffix">%</tspan></text>
                   </svg>
                </div>
                   <div class="widgetPanel_title_container">
                    <div class="widgetPanel_title"></div> 
                </div>
                  
            `;

        const segmentPercentageCircle = segmentPanel.querySelector(".widget-percentage-circle");

        this._setPanel(segmentPanel, titleText);

        set(segmentPercentageCircle, { stroke: castColor(this._index) });

        gsap.to(segmentPercentageCircle, 2, {
            strokeDasharray: p + ", 100",
        });

        set(segmentPanel.querySelector(".widget-percentage-percentage"), { attr: { fill: this._getPanelTextColor() } });
        set(segmentPanel.querySelector(".widget-percentage-percentage-value"), { textContent: this._getDecimals(p) });
        set(segmentPanel.querySelector(".widget-percentage-percentage-value-suffix"), { opacity: 0.7 });

        document.body.appendChild(segmentPanel);

        const w = segmentPanel.querySelector(".widget-percentage-percentage").getBBox().width;
        if (w > 26) {
            set(segmentPanel.querySelector(".widget-percentage-percentage"), { scale: 26 / w, transformOrigin: "50% 50%" });
        }

        document.body.removeChild(segmentPanel);

        this._element = segmentPanel;
        this._checkIndicator(p);

        return this._element;
    }

    hasData() {
        return true;
    }
}

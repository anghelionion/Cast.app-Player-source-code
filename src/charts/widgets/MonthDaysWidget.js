class MonthDaysWidget extends WidgetBase {
    WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

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
                <div class="widgetPanel_metric widgetPanel_doughnut">                
                </div>
                <div class="widgetPanel_title_container">
                    <div class="widgetPanel_title"></div>                                                  
                </div>                
            `;

        this._element = segmentPanel;
        this._setPanel(segmentPanel, titleText);
        if (!this.hasData()) return this._element;

        const data = segment.data;
        const getSvg = this._drawSVG(data);
        this._element.querySelector(".widgetPanel_metric").innerHTML = getSvg.outerHTML;

        if (super.hasData()) this._checkIndicator(data[data.length - 1].value);

        return this._element;
    }

    _drawSVG(data) {
        data = data || [];

        const set = gsap.set;
        const svgWidth = 2400;
        const svgHeight = 1000;

        const svg = document.createElementNS(gSvgNS, "svg");
        set(svg, {
            attr: {
                viewBox: [0, 0, svgWidth, svgHeight].join(" "),
            },
        });

        const paddingLeft = 50;
        const paddingTop = 20;
        const gapX = 20;
        const gapY = 30;

        let date;
        if (super.hasData()) date = new Date(data[0].name);
        else date = new Date();

        const month = date.getMonth();
        const year = date.getFullYear();
        const numDays = new Date(year, month + 1, 0).getDate();
        const startIndex = new Date(year, month, 1).getDay() - 1;
        const numLines = Math.max(5, Math.ceil((startIndex + numDays) / 7));

        const rectW = (svgWidth - 2 * paddingLeft - 6 * gapX) / 7;
        const rectH = (svgHeight - 2 * paddingTop - 4 * gapY) / numLines;

        let currentLineY = paddingTop;

        const dataByDays = {};
        const monthData = data.filter((o) => {
            const d = new Date(o.name);
            if (d.getMonth() === month) {
                const dayData = dataByDays[d.getDate() - 1];
                if (dayData) {
                    dayData.value += o.value;
                } else {
                    dataByDays[d.getDate() - 1] = o;
                }

                return true;
            }
            return false;
        });

        const valuesArray = [];
        Object.keys(dataByDays).forEach((key) => {
            valuesArray.push(dataByDays[key].value);
        });

        const maxValue = Math.max(...valuesArray);

        for (let i = 0; i < numLines * 7; i++) {
            if (i >= startIndex && i < startIndex + numDays) {
                const rect = document.createElementNS(gSvgNS, "rect");
                set(rect, {
                    attr: {
                        rx: rectH / 6,
                        y: currentLineY,
                        x: (i % 7) * (rectW + gapX),
                        height: rectH,
                        width: rectW,
                        fill: castColor(this.colorIndex),
                        opacity: 0.2,
                    },
                });

                const dayData = dataByDays[i - startIndex];
                if (dayData) {
                    set(rect, {
                        attr: {
                            opacity: gsap.utils.clamp(0.3, 1, dayData.value / maxValue),
                        },
                    });
                }

                svg.appendChild(rect);
            } else {
                const text = document.createElementNS(gSvgNS, "text");
                set(text, {
                    textContent: this.WEEK_DAYS[i % 7],
                    attr: {
                        y: currentLineY + rectH / 2,
                        x: (i % 7) * (rectW + gapX) + (rectW - rectH) / 2 + rectH / 4,
                        fill: this._getPanelTextColor(),
                        "font-size": rectH,
                        "text-anchor": "start",
                        "alignment-baseline": "middle",
                    },
                });

                svg.appendChild(text);
            }

            if (i !== 0 && i % 7 === 6) {
                currentLineY += rectH + gapY;
            }
        }

        return svg;
    }

    hasData() {
        return true;
    }
}

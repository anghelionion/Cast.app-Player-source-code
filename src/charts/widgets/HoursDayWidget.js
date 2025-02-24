class HoursDayWidget extends WidgetBase {
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
        const getSvg = this._drawSVGCircle(data);
        this._element.querySelector(".widgetPanel_metric").innerHTML = getSvg.outerHTML;

        if (super.hasData()) this._checkIndicator(data[data.length - 1].value);

        return this._element;
    }

    _drawSVGCircle(data) {
        data = data || [];
        const dataByHours = {};
        data.forEach((o) => {
            const d = new Date(o.name);

            const hourData = dataByHours[d.getHours()];
            if (hourData) {
                hourData.value += o.value;
            } else {
                dataByHours[d.getHours()] = o;
            }
        });

        data.sort((a, b) => {
            return new Date(a.name) - new Date(b.name);
        });

        const hourDaysOccurrences = this._getHoursDaysOccurrences(new Date(data[0].name), new Date(data[data.length - 1].name));
        const valuesArray = [];

        Object.keys(dataByHours).forEach((key) => {
            dataByHours[key].value = dataByHours[key].value / hourDaysOccurrences[key];
            valuesArray.push(dataByHours[key].value);
        });

        const maxValue = Math.max(...valuesArray);

        const set = gsap.set;
        const svgWidth = 2400;
        const svgHeight = 1000;

        const svg = document.createElementNS(gSvgNS, "svg");
        set(svg, {
            attr: {
                viewBox: [0, 0, svgWidth, svgHeight].join(" "),
            },
        });

        const graphContainer = document.createElementNS(gSvgNS, "g");
        const rect = document.createElementNS(gSvgNS, "rect");

        set(rect, {
            width: svgWidth,
            height: svgHeight,
            attr: {
                fill: "none",
            },
        });
        graphContainer.appendChild(rect);
        svg.appendChild(graphContainer);

        const smallRadius = 100;
        const minimumRadius = 10;
        const maxRadius = 470;
        const labelsRadius = 500;
        const labelsFontSize = 60;
        const numItems = 24;
        const angleStep = 360 / numItems;
        const angleGap = angleStep / 5;
        const angleStart = -(angleStep - angleGap) / 2;

        const radius = maxRadius - (smallRadius + minimumRadius);

        let circle = this._createCircle(svgWidth / 2, svgHeight / 2, smallRadius + minimumRadius + radius);
        graphContainer.appendChild(circle);

        circle = this._createCircle(svgWidth / 2, svgHeight / 2, smallRadius + minimumRadius + (radius / 4) * 3, 5);
        graphContainer.appendChild(circle);

        circle = this._createCircle(svgWidth / 2, svgHeight / 2, smallRadius + minimumRadius + radius / 2, 5);
        graphContainer.appendChild(circle);

        circle = this._createCircle(svgWidth / 2, svgHeight / 2, smallRadius + minimumRadius + radius / 4, 5);
        graphContainer.appendChild(circle);

        for (let i = 0; i < numItems; i++) {
            const angle = (360 / numItems) * i - 90 + angleStart;
            const radians = (angle / 180) * Math.PI;

            let maximumRadius = smallRadius + minimumRadius;
            const hourData = dataByHours[i];
            if (hourData) {
                maximumRadius = gsap.utils.clamp(smallRadius + minimumRadius, maxRadius, (hourData.value / maxValue) * (maxRadius - smallRadius) + smallRadius);
            }
            //maximumRadius = maxRadius;

            const x0 = svgWidth / 2 + smallRadius * Math.cos(radians);
            const y0 = svgHeight / 2 + smallRadius * Math.sin(radians);

            const x1 = svgWidth / 2 + maximumRadius * Math.cos(radians);
            const y1 = svgHeight / 2 + maximumRadius * Math.sin(radians);

            const secondRadians = ((angle + angleStep - angleGap) / 180) * Math.PI;
            const x2 = svgWidth / 2 + smallRadius * Math.cos(secondRadians);
            const y2 = svgHeight / 2 + smallRadius * Math.sin(secondRadians);

            const x3 = svgWidth / 2 + maximumRadius * Math.cos(secondRadians);
            const y3 = svgHeight / 2 + maximumRadius * Math.sin(secondRadians);

            const path = document.createElementNS(gSvgNS, "path");
            let d = this._getSlicePathRoundedQ(
                x0,
                y0,
                x1,
                y1,
                x2,
                y2,
                x3,
                y3,
                smallRadius,
                maximumRadius,
                svgWidth,
                svgHeight,
                radians,
                secondRadians,
                angle,
                angle + angleStep - angleGap
            );

            set(path, {
                attr: {
                    d,
                    fill: castColor(this.colorIndex),
                },
            });

            graphContainer.appendChild(path);
        }
        set(graphContainer, { scale: 0.9, transformOrigin: "50% 50%" });

        // const labels = ["12AM", "3AM", "6AM", "9AM", "12PM", "3PM", "6PM", "9PM"];
        /*  const labels = [
            "12AM",
            "1AM",
            "2AM",
            "3AM",
            "4AM",
            "5AM",
            "6AM",
            "7AM",
            "8AM",
            "9AM",
            "10AM",
            "11AM",
            "12PM",
            "1PM",
            "2PM",
            "3PM",
            "4PM",
            "5PM",
            "6PM",
            "7PM",
            "8PM",
            "9PM",
            "10PM",
            "11PM",
        ];*/
        // const labels = ["12am", "1", "2", "3am", "4", "5", "6am", "7", "8", "9am", "10", "11", "12pm", "1", "2", "3pm", "4", "5", "6pm", "7", "8", "9pm", "10", "11"];
        const labels = ["12am", "1", "2", "3a", "4", "5", "6a", "7", "8", "9a", "10", "11", "12pm", "1", "2", "3p", "4", "5", "6p", "7", "8", "9p", "10", "11"];

        for (let i = 0; i < labels.length; i++) {
            const labelEl = document.createElementNS(gSvgNS, "text");
            svg.appendChild(labelEl);

            const angle = (360 / labels.length) * i - 90 + (angleStep - angleGap) / 2 + angleStart;
            const radians = (angle / 180) * Math.PI;

            const x = svgWidth / 2 + labelsRadius * Math.cos(radians);
            const y = svgHeight / 2 + labelsRadius * Math.sin(radians);

            set(labelEl, {
                textContent: labels[i],
                x,
                y,
                opacity: i % 3 == 0 ? 1 : 0.2,
                attr: {
                    fill: this._getPanelTextColor(),
                    "font-size": i % 3 == 0 ? labelsFontSize : labelsFontSize * 1,
                    "text-anchor": "middle",
                    "alignment-baseline": "hanging",
                },
            });

            set(labelEl, {
                rotation: angle + 90,
                //transformOrigin:"50% 100%",
            });
        }

        return svg;
    }

    hasData() {
        return true;
    }

    _getSlicePath(x0, y0, x1, y1, x2, y2, x3, y3, smallRadius, maximumRadius) {
        let d = "M" + [x0, y0].join(" ") + " L" + [x1, y1].join(" ");
        d += " A " + [maximumRadius, maximumRadius].join(" ") + " 0 0 1 " + [x3, y3].join(" ") + " L" + [x2, y2].join(" ");
        d += " A " + [smallRadius / 2, smallRadius / 2].join(" ") + " 0 0 1 " + [x0, y0].join(" ");
        return d;
    }

    _getSlicePathRounded(x0, y0, x1, y1, x2, y2, x3, y3, smallRadius, maximumRadius, svgWidth, svgHeight, firstRadians, secondRadians, firstAngle, secondAngle) {
        const borderRadius = 20 * 2;
        const maximumRadiusDelta = 20 * 2;
        const angleDelta = 2 * 3;

        const x10 = svgWidth / 2 + (maximumRadius - maximumRadiusDelta) * Math.cos(firstRadians);
        const y10 = svgHeight / 2 + (maximumRadius - maximumRadiusDelta) * Math.sin(firstRadians);

        firstRadians = ((firstAngle + angleDelta) / 180) * Math.PI;
        const x11 = svgWidth / 2 + maximumRadius * Math.cos(firstRadians);
        const y11 = svgHeight / 2 + maximumRadius * Math.sin(firstRadians);

        firstRadians = ((secondAngle - angleDelta) / 180) * Math.PI;
        const x31 = svgWidth / 2 + maximumRadius * Math.cos(firstRadians);
        const y31 = svgHeight / 2 + maximumRadius * Math.sin(firstRadians);

        const x30 = svgWidth / 2 + (maximumRadius - maximumRadiusDelta) * Math.cos(secondRadians);
        const y30 = svgHeight / 2 + (maximumRadius - maximumRadiusDelta) * Math.sin(secondRadians);

        let d = "M" + [x0, y0].join(" ") + " L" + [x10, y10].join(" ");
        d += " A " + [borderRadius, borderRadius].join(" ") + " 0 0 1 " + [x11, y11].join(" ");
        d += " A " + [maximumRadius, maximumRadius].join(" ") + " 0 0 1 " + [x31, y31].join(" ");
        d += " A " + [borderRadius, borderRadius].join(" ") + " 0 0 1 " + [x30, y30].join(" ");

        d += " L" + [x2, y2].join(" ");
        d += " A " + [smallRadius / 2, smallRadius / 2].join(" ") + " 0 0 1 " + [x0, y0].join(" ");
        return d;
    }

    _getSlicePathRoundedQ(x0, y0, x1, y1, x2, y2, x3, y3, smallRadius, maximumRadius, svgWidth, svgHeight, firstRadians, secondRadians, firstAngle, secondAngle) {
        const maximumRadiusDelta = 20;
        const angleDelta = 2 * 4;

        const x10 = svgWidth / 2 + (maximumRadius - maximumRadiusDelta) * Math.cos(firstRadians);
        const y10 = svgHeight / 2 + (maximumRadius - maximumRadiusDelta) * Math.sin(firstRadians);

        firstRadians = ((firstAngle + angleDelta) / 180) * Math.PI;
        const x11 = svgWidth / 2 + maximumRadius * Math.cos(firstRadians);
        const y11 = svgHeight / 2 + maximumRadius * Math.sin(firstRadians);

        firstRadians = ((secondAngle - angleDelta) / 180) * Math.PI;
        const x31 = svgWidth / 2 + maximumRadius * Math.cos(firstRadians);
        const y31 = svgHeight / 2 + maximumRadius * Math.sin(firstRadians);

        const x30 = svgWidth / 2 + (maximumRadius - maximumRadiusDelta) * Math.cos(secondRadians);
        const y30 = svgHeight / 2 + (maximumRadius - maximumRadiusDelta) * Math.sin(secondRadians);

        let d = "M" + [x0, y0].join(" ") + " L" + [x10, y10].join(" ");
        d += " Q " + [x1, y1].join(" ") + " " + [x11, y11].join(" ");
        d += " A " + [maximumRadius, maximumRadius].join(" ") + " 0 0 1 " + [x31, y31].join(" ");
        d += " Q " + [x3, y3].join(" ") + " " + [x30, y30].join(" ");

        d += " L" + [x2, y2].join(" ");
        d += " A " + [smallRadius / 6, smallRadius / 6].join(" ") + " 0 0 1 " + [x0, y0].join(" ");
        return d;
    }

    _getHoursDaysOccurrences(firstDate, lastDate) {
        const startDate = new Date(firstDate);
        const endDate = new Date(lastDate);

        startDate.setMinutes(0, 0, 0);
        endDate.setMinutes(0, 0, 0);

        let startHour = startDate.getHours();
        const endHour = endDate.getHours();

        const numHours = (endDate.valueOf() - startDate.valueOf()) / (1000 * 3600) - 1;

        const occurrences = {};
        occurrences[startHour] = 1;
        if (endDate < startDate) return occurrences;

        occurrences[endHour] = 1;

        for (let i = 0; i < numHours; i++) {
            const nextHour = (startHour + 1) % 24;
            if (occurrences[nextHour]) {
                occurrences[nextHour]++;
            } else {
                occurrences[nextHour] = 1;
            }
            startHour = (startHour + 1) % 24;
        }

        return occurrences;
    }

    _createCircle(cx, cy, r, stroke = 10) {
        const outerCircle = document.createElementNS(gSvgNS, "circle");

        gsap.set(outerCircle, {
            opacity: 0.25,
            attr: {
                cx,
                cy,
                r: r - stroke / 2,
                stroke: this._getPanelTextColor(),
                "stroke-width": stroke,
                fill: "none",
            },
        });
        return outerCircle;
    }
}

class WeekDaysWidget extends HoursDayWidget {
    constructor(segments, index, chartId, config) {
        super(segments, index, chartId, config);
    }

    _drawSVGCircle(data) {
        data = data || [];

        const dataByWeekDays = {};
        data.forEach((o) => {
            const d = new Date(o.name);

            const weekDay = (d.getDay() + 6) % 7;
            const dayData = dataByWeekDays[weekDay];
            if (dayData) {
                dayData.value += o.value;
            } else {
                dataByWeekDays[weekDay] = o;
            }
        });

        data.sort((a, b) => {
            return new Date(a.name) - new Date(b.name);
        });

        const weekDaysOccurrences = this._getWeekDaysOccurrences(new Date(data[0].name), new Date(data[data.length - 1].name));
        const valuesArray = [];

        Object.keys(dataByWeekDays).forEach((key) => {
            dataByWeekDays[key].value = dataByWeekDays[key].value / weekDaysOccurrences[key];
            valuesArray.push(dataByWeekDays[key].value);
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

        const smallRadius = 50;
        const minimumRadius = 10;
        const maxRadius = 470;
        const labelsRadius = 500;
        const labelsFontSize = 70;
        const numItems = 7;
        const angleStep = 360 / numItems;
        const angleGap = angleStep / 6;
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

            const weekDaysData = dataByWeekDays[i];
            if (weekDaysData) {
                maximumRadius = gsap.utils.clamp(smallRadius + minimumRadius, maxRadius, (weekDaysData.value / maxValue) * (maxRadius - smallRadius) + smallRadius);
            }
            //maximumRadius = maxRadius;

            let barOpacity = 1;
            if (i > 4) barOpacity = 0.7;

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
                    opacity: barOpacity,
                },
            });

            graphContainer.appendChild(path);
        }

        set(graphContainer, { scale: 0.9, transformOrigin: "50% 50%" });

        const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        // const labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

        for (let i = 0; i < labels.length; i++) {
            const labelEl = document.createElementNS(gSvgNS, "text");
            svg.appendChild(labelEl);

            const angle = (360 / labels.length) * i - 90 + (angleStep - angleGap) / 2 + angleStart;
            const radians = (angle / 180) * Math.PI;

            const x = svgWidth / 2 + labelsRadius * Math.cos(radians);
            const y = svgHeight / 2 + labelsRadius * Math.sin(radians);

            set(labelEl, {
                textContent: labels[i],
                x: x,
                y: y,
                opacity: i > 4 ? 0.7 : 1,
                attr: {
                    fill: this._getPanelTextColor(),
                    "font-size": labelsFontSize,
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
        d += " A " + [smallRadius / 2, smallRadius / 2].join(" ") + " 0 0 1 " + [x0, y0].join(" ");
        return d;
    }

    _getWeekDaysOccurrences(firstDate, lastDate) {
        const startDate = new Date(firstDate);
        const endDate = new Date(lastDate);

        startDate.setHours(0, 0, 0);
        endDate.setHours(0, 0, 0);

        let weekDayStart = (startDate.getDay() + 6) % 7;
        const weekDayEnd = (endDate.getDay() + 6) % 7;

        const numDays = (endDate.valueOf() - startDate.valueOf()) / (1000 * 3600 * 24) - 1;

        const occurrences = {};
        occurrences[weekDayStart] = 1;
        if (endDate < startDate) return occurrences;

        occurrences[weekDayEnd] = 1;

        for (let i = 0; i < numDays; i++) {
            const nextWeekday = (weekDayStart + 1) % 7;
            if (occurrences[nextWeekday]) {
                occurrences[nextWeekday]++;
            } else {
                occurrences[nextWeekday] = 1;
            }
            weekDayStart = (weekDayStart + 1) % 7;
        }

        return occurrences;
    }
}

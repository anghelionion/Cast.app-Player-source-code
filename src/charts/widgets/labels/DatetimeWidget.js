class DatetimeWidget extends LabelWidget {
    DATE_FORMATS = {
        "%d/%m/%Y %I:%M %p": this._format_date_dmY_IM_p,
        "%m/%d/%Y %I:%M %p": this._format_date_mdY_IM_p,
        "%B %d, %Y %I:%M %p": this._format_date_Bd_Y_IM_p,
        "%A, %B %d, %Y %I:%M %p": this._format_date_A_B_d_Y_IM_p,
        "%d/%m/%Y": this._format_date_dmY,
        "%m/%d/%Y": this._format_date_mdY,
        "%A, %B %d, %Y": this._format_date_A_B_d_Y,
        "%B %d, %Y": this._format_date_Bd_Y,
        "%B %d": this._format_date_Bd,
        "%B %Y": this._format_date_BY,
        "%Y": this._format_date_Y,
        "%B": this._format_date_B,
        "%H:%M": this._format_date_HM,
        "%I:%M %p": this._format_date_IM_p,
        "%H": this._format_date_H,
        "%I %p": this._format_date_IP,
    };

    DIM_OPACITY = 0.7;
    INLINE_GMT_FONT_SCALE = 1;
    ONE_LINE_GMT_FONT_SCALE = 0.8;

    constructor(segments, index, chartId, config) {
        super(segments, index, chartId, config);
    }

    _getFormattedLabels() {
        const segment = this._segments[this._index];

        const localDate = new Date();
        const timestamp = segment.data[0].value;
        const date = new Date(timestamp * 1000 - localDate.getTimezoneOffset() * 1000 * 60);

        const formatFunction = this.DATE_FORMATS[segment.format].bind(this) || this._formatDefault;
        return formatFunction(date);
    }

    init() {
        const segmentPanel = super.init();
        if (!this.hasData()) return this._element;

        this._checkIndicator(this._segments[this._index].value);

        return segmentPanel;
    }

    _getGMTSuffix() {
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
        //Note: Timezone display may fall back to another format if a required string is unavailable.
        // For example, the non-location formats should display the timezone without a specific country/city location like "Pacific Time",
        // but may fall back to a timezone like "Los Angeles Time".

        const localDate = new Date();
        const formatter = new Intl.DateTimeFormat("default", { timeZoneName: "short" });
        const timeZoneName = formatter.formatToParts(localDate).find((x) => x.type === "timeZoneName");
        if (timeZoneName) return timeZoneName.value;
        else return "";
    }

    _formatDefault(date) {
        const month = date.toLocaleString("default", { month: "long" });
        const day = date.getDate();
        const year = "'" + date.getFullYear().toString().substring(2);

        return [{ value: month + " " + day }, { value: year, opacity: 0.7 }];
    }

    _format_date_dmY_IM_p(date) {
        const day = date.toLocaleString("default", { day: "2-digit" });
        const month = date.toLocaleString("default", { month: "2-digit" });
        const year = date.toLocaleString("default", { year: "numeric" });

        const time = date.toLocaleString("default", { hour: "2-digit", minute: "2-digit", hour12: "true" });

        return [
            [{ value: [day, month, year].join("/") }],
            [{ value: time }, { value: " " + this._getGMTSuffix(), opacity: this.DIM_OPACITY, fontScale: this.INLINE_GMT_FONT_SCALE }],
        ];
    }

    _format_date_mdY_IM_p(date) {
        const day = date.toLocaleString("default", { day: "2-digit" });
        const month = date.toLocaleString("default", { month: "2-digit" });
        const year = date.toLocaleString("default", { year: "numeric" });

        const time = date.toLocaleString("default", { hour: "2-digit", minute: "2-digit", hour12: "true" });

        return [
            [{ value: [month, day, year].join("/") }],
            [{ value: time }, { value: " " + this._getGMTSuffix(), opacity: this.DIM_OPACITY, fontScale: this.INLINE_GMT_FONT_SCALE }],
        ];
    }

    _format_date_Bd_Y_IM_p(date) {
        const day = date.toLocaleString("default", { day: "2-digit" });
        const month = date.toLocaleString("default", { month: "long" });
        const year = date.toLocaleString("default", { year: "numeric" });

        const time = date.toLocaleString("default", { hour: "2-digit", minute: "2-digit", hour12: "true" });

        return [
            [{ value: [month, day].join(" ") + ", " + year }],
            [{ value: time }, { value: " " + this._getGMTSuffix(), opacity: this.DIM_OPACITY, fontScale: this.INLINE_GMT_FONT_SCALE }],
        ];
    }

    _format_date_A_B_d_Y_IM_p(date) {
        const weekday = date.toLocaleString("default", { weekday: "long" });
        const day = date.toLocaleString("default", { day: "2-digit" });
        const month = date.toLocaleString("default", { month: "long" });
        const year = date.toLocaleString("default", { year: "numeric" });

        let time = date.toLocaleString("default", { hour: "2-digit", minute: "2-digit", hour12: "true" });

        return [
            [{ value: weekday + ", " + [month, day].join(" ") + ", " + year }],
            [{ value: time }, { value: " " + this._getGMTSuffix(), opacity: this.DIM_OPACITY, fontScale: this.INLINE_GMT_FONT_SCALE }],
        ];
    }

    _format_date_dmY(date) {
        const day = date.toLocaleString("default", { day: "2-digit" });
        const month = date.toLocaleString("default", { month: "2-digit" });
        const year = date.toLocaleString("default", { year: "numeric" });

        return [[{ value: [day, month, year].join("/") }], [{ value: this._getGMTSuffix(), opacity: this.DIM_OPACITY, fontScale: this.INLINE_GMT_FONT_SCALE }]];
    }

    _format_date_mdY(date) {
        const day = date.toLocaleString("default", { day: "2-digit" });
        const month = date.toLocaleString("default", { month: "2-digit" });
        const year = date.toLocaleString("default", { year: "numeric" });

        return [[{ value: [month, day, year].join("/") }], [{ value: this._getGMTSuffix(), opacity: this.DIM_OPACITY, fontScale: this.INLINE_GMT_FONT_SCALE }]];
    }

    _format_date_A_B_d_Y(date) {
        const weekday = date.toLocaleString("default", { weekday: "long" });
        const day = date.toLocaleString("default", { day: "2-digit" });
        const month = date.toLocaleString("default", { month: "long" });
        const year = date.toLocaleString("default", { year: "numeric" });

        return [
            [{ value: weekday + ", " + [month, day].join(" ") }],
            [{ value: year }, { value: " " + this._getGMTSuffix(), opacity: this.DIM_OPACITY, fontScale: this.INLINE_GMT_FONT_SCALE }],
        ];
    }

    _format_date_Bd_Y(date) {
        const day = date.toLocaleString("default", { day: "2-digit" });
        const month = date.toLocaleString("default", { month: "long" });
        const year = date.toLocaleString("default", { year: "numeric" });

        return [[{ value: [month, day].join(" ") }], [{ value: year }, { value: " " + this._getGMTSuffix(), opacity: this.DIM_OPACITY, fontScale: this.INLINE_GMT_FONT_SCALE }]];
    }

    _format_date_Bd(date) {
        const day = date.toLocaleString("default", { day: "2-digit" });
        const month = date.toLocaleString("default", { month: "long" });

        return [[{ value: [month, day].join(" ") }], [{ value: this._getGMTSuffix(), opacity: this.DIM_OPACITY, fontScale: this.ONE_LINE_GMT_FONT_SCALE }]];
    }

    _format_date_BY(date) {
        const month = date.toLocaleString("default", { month: "long" });
        const year = date.toLocaleString("default", { year: "numeric" });

        return [[{ value: [month, year].join(" ") }], [{ value: this._getGMTSuffix(), opacity: this.DIM_OPACITY, fontScale: this.ONE_LINE_GMT_FONT_SCALE }]];
    }

    _format_date_Y(date) {
        const year = date.toLocaleString("default", { year: "numeric" });

        return [{ value: year }];
    }

    _format_date_B(date) {
        const month = date.toLocaleString("default", { month: "long" });

        return [{ value: month }];
    }

    _format_date_HM(date) {
        let hour = date.getHours();
        if (hour < 10) hour = "0" + hour.toString();

        let minute = date.toLocaleString("default", { minute: "2-digit" });
        if (minute < 10) minute = "0" + minute.toString();

        const time = [hour, minute].join(":");

        return [{ value: time }, { value: " " + this._getGMTSuffix(), opacity: this.DIM_OPACITY, fontScale: this.INLINE_GMT_FONT_SCALE }];
    }

    _format_date_IM_p(date) {
        let time = date.toLocaleString("default", { hour: "2-digit", minute: "2-digit", hour12: "true" });

        return [{ value: time }, { value: " " + this._getGMTSuffix(), opacity: this.DIM_OPACITY, fontScale: this.INLINE_GMT_FONT_SCALE }];
    }

    _format_date_H(date) {
        let hour = date.getHours();
        if (hour < 10) hour = ["0" + hour].join("");

        return [{ value: hour }, { value: " " + this._getGMTSuffix(), opacity: this.DIM_OPACITY, fontScale: this.INLINE_GMT_FONT_SCALE }];
    }

    _format_date_IP(date) {
        const time = date.toLocaleString("default", { hour: "2-digit", hour12: "true" });

        return [{ value: time }, { value: " " + this._getGMTSuffix(), opacity: this.DIM_OPACITY, fontScale: this.INLINE_GMT_FONT_SCALE }];
    }

    _drawSVGLabel(labels) {
        if (!Array.isArray(labels[0])) return super._drawSVGLabel(labels);

        const set = gsap.set;
        const svgWidth = 600;
        const svgHeight = 400;

        const svg = document.createElementNS(gSvgNS, "svg");
        svg.setAttribute("viewBox", [0, 0, svgWidth, svgHeight].join(" "));
        svg.setAttribute("style", "width:auto; display:block; margin:auto");
        svg.setAttribute("height", "100%");

        document.body.appendChild(svg);

        const textContainer = document.createElementNS(gSvgNS, "g");
        svg.appendChild(textContainer);

        let fontSize = 18 * 60;

        let fontScale = 1;
        fontSize = Math.min(fontSize * fontScale, 220);

        const text = document.createElementNS(gSvgNS, "text");

        textContainer.appendChild(text);
        set(text, {
            attr: {
                y: 0,
                x: "50%",
                fill: this._getPanelTextColor(),
                //"font-size": fontSize,
                "text-anchor": "middle",
                "alignment-baseline": "middle",
            },
        });

        for (let i = 0; i < labels.length; i++) {
            for (let j = 0; j < labels[i].length; j++) {
                const l = labels[i][j];

                const fontScale = l.fontScale || 1;
                const opacity = l.opacity || 1;
                const isBold = l.isBold || "normal";

                let tspan = null;

                if (j < 1) {
                    tspan = document.createElementNS(gSvgNS, "tspan");
                    set(tspan, {
                        textContent: l.value,
                        attr: {
                            "font-weight": isBold,
                            dy: fontSize * fontScale * i * 1.2,
                            "text-anchor": "middle",
                            x: svgWidth / 2,
                            opacity,
                            "font-size": fontSize * fontScale,
                        },
                    });
                    text.append(tspan);
                } else {
                    tspan = document.createElementNS(gSvgNS, "tspan");
                    set(tspan, {
                        textContent: l.value,
                        attr: {
                            "font-weight": isBold,
                            "text-anchor": "middle",
                            opacity,
                            "font-size": fontSize * fontScale,
                        },
                    });
                    text.append(tspan);
                }
            }
        }

        const bBox = textContainer.getBBox();

        const scaleX = svgWidth / bBox.width;
        const scaleY = svgHeight / bBox.height;
        const scale = Math.min(scaleX, scaleY) - 0.1;

        set(textContainer, {
            scale: scale,
            //x: svgWidth / 2,
            transformOrigin: "50% 50%",
            y: svgHeight / 2,
            attr: {},
        });

        document.body.removeChild(svg);
        return svg;
    }
}

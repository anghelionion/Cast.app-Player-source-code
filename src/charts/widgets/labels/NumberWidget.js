class NumberWidget extends LabelWidget {
    constructor(segments, index, chartId, config) {
        super(segments, index, chartId, config);
    }

    init() {
        const segmentPanel = super.init();
        if (!this.hasData()) return this._element;

        this._checkIndicator(this._getNumber(this._segments[this._index].data));

        return segmentPanel;
    }

    _getNumber(data) {
        let number = 0;
        if (data && data.length) number = data[data.length - 1].value;
        if (!number) number = 0;
        return number;
    }

    _getFormattedLabels() {
        const segment = this._segments[this._index];
        const prefix = segment.prefix || "";
        const suffix = segment.suffix || "";

        let number = this._getNumber(segment.data);
        number = this._getDecimals(number);

        return [
            { value: prefix, isBold: false, opacity: 0.7, fontScale: 0.8 },
            { value: number, isBold: prefix !== "" || suffix !== "" ? true : false },
            { value: suffix, isBold: false, opacity: 0.7, fontScale: 0.8 },
        ];
    }

    hasData() {
        return true;
    }
}

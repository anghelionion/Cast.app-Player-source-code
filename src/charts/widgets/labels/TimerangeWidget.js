class TimerangeWidget extends LabelWidget {
    constructor(segments, index, chartId, config) {
        super(segments, index, chartId, config);
    }

    _getFormattedLabels() {
        const segment = this._segments[this._index];

        let formattedSeconds;
        if (super.hasData()) formattedSeconds = autoseconds(segment.data[0].value);
        else formattedSeconds = autoseconds(0);
        const labels = [];

        const numbers = formattedSeconds.split(/[a-zA-Z]/g);
        if (numbers[numbers.length - 1] === "") numbers.pop();

        const letters = formattedSeconds.split(/\d+/g);
        if (letters[0] === "") letters.shift();
        if (letters[0] === ".") letters.shift();

        for (let i = 0; i < letters.length; i++) {
            labels.push({ value: numbers[i], fontScale: 0.8, isBold: true });
            labels.push({ value: letters[i], fontScale: 0.7, opacity: 0.7 });
        }

        return labels;
    }

    hasData() {
        return true;
    }
}

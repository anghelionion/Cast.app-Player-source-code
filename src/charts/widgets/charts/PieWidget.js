class PieWidget extends DoughnutWidget {
    constructor(segments, index, chartId, config) {
        super(segments, index, chartId, config);
    }

    _getCircleFormat(circleHeight) {
        const circleDiameter = circleHeight / 2;
        const strokeWidth = circleDiameter;
        const radius = circleDiameter / 2;
        const circumference = 2 * Math.PI * radius;
        const circumferenceWithGap = circumference;

        return { strokeWidth, radius, circumference, circumferenceWithGap };
    }
}

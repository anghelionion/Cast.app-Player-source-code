class WidgetFactory {
    WIDGETS = {
        piebar: PieBarWidget,
        pie2: Pie2Widget,
        pie: PieWidget,
        doughnut: DoughnutWidget,
        status: StatusWidget,
        timerange: TimerangeWidget,
        datetime: DatetimeWidget,
        number: NumberWidget,
        label: LabelWidget,
        bar: BarWidget,
        progress: ProgressWidget,
        sparkbar: SparkBarWidget,
        sparkline: SparkLineWidget,
        percent: PercentageWidget,
        sparkarea: SparkAreaWidget,
        "funnel-hanoi": FunnelWidget,
        "month-days": MonthDaysWidget,
        "day-hours": HoursDayWidget,
        "week-days": WeekDaysWidget,
    };

    create(segments, index, chartId, config) {
        const widgetType = segments[index].type;
        let element;

        const Widget = this.WIDGETS[widgetType] || WidgetBase;
        element = new Widget(segments, index, chartId, config);

        return element;
    }
}

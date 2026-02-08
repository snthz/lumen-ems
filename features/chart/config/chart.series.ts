import * as am4charts from "@amcharts/amcharts4/charts"

export function createLineSeries(
    chart: am4charts.XYChart
) {
    const series = chart.series.push(
        new am4charts.LineSeries()
    )
    series.name = "Series"
    series.dataFields.dateX = "date"
    series.dataFields.valueY = "value"
    series.strokeWidth = 2
    series.tooltipText = "{valueY}"

    if (series.tooltip) {
        series.tooltip.fontSize = 12
        series.tooltip.animationDuration = 2000
    }

    series.connect = false
    return series
}

export function createBarSeries(
    chart: am4charts.XYChart
) {
    const series = chart.series.push(
        new am4charts.ColumnSeries()
    )



    series.name = "Series"
    series.dataFields.dateX = "date"
    series.dataFields.valueY = "value"
    series.tooltipText = "{valueY}"
    series.stacked = true

    return series
}

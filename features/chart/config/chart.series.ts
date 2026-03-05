import * as am4charts from "@amcharts/amcharts4/charts"
import * as am4core from "@amcharts/amcharts4/core"

export function createLineSeries(
    chart: am4charts.XYChart,
    resolution?: number
) {
    const series = chart.series.push(
        new am4charts.LineSeries()
    )
    series.name = "Series"
    series.dataFields.dateX = "date"
    series.dataFields.valueY = "value"
    series.strokeWidth = 1
    series.tooltipText = "{valueY}"

    if (series.tooltip) {
        series.tooltip.fontSize = 12
        series.tooltip.animationDuration = 1000
        series.tooltip.animationEasing = am4core.ease.cubicOut
        series.tooltip.pointerOrientation = "vertical"
    }

    if (resolution && resolution >= 3600) {
        const bullet = series.bullets.push(new am4charts.CircleBullet())
        bullet.circle.radius = 2
        bullet.circle.strokeWidth = 1
        series.connect = true
    } else {
        series.connect = false
    }

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
    if(series.tooltip) {
        series.tooltip.fontSize = 12
        series.tooltip.animationDuration = 1000
        series.tooltip.animationEasing = am4core.ease.cubicOut
        series.tooltip.pointerOrientation = "vertical"
    }

    return series
}

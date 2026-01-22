import * as am4charts from "@amcharts/amcharts4/charts"

export function configureDateAxis(
    chart: am4charts.XYChart
): am4charts.DateAxis {
    const axis = chart.xAxes.push(
        new am4charts.DateAxis()
    )

    axis.renderer.minGridDistance = 50
    axis.tooltipDateFormat = "MMM dd"
    return axis
}

export function configureValueAxis(
    chart: am4charts.XYChart
): am4charts.ValueAxis {
    return chart.yAxes.push(
        new am4charts.ValueAxis()
    )
}

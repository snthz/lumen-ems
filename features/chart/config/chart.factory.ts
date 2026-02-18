import * as am4core from "@amcharts/amcharts4/core"
import * as am4charts from "@amcharts/amcharts4/charts"

export function createXYChart(
    containerId: string
): am4charts.XYChart {
    const chart = am4core.create(
        containerId,
        am4charts.XYChart
    )

    chart.logo.dispose()
    return chart
}

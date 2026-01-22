import * as am4core from "@amcharts/amcharts4/core"
import * as am4charts from "@amcharts/amcharts4/charts"
import am4themes_animated from "@amcharts/amcharts4/themes/animated"

export function createXYChart(
    containerId: string
): am4charts.XYChart {
    am4core.useTheme(am4themes_animated)

    const chart = am4core.create(
        containerId,
        am4charts.XYChart
    )

    chart.logo.dispose()
    return chart
}

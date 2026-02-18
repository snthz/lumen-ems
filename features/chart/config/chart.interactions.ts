import * as am4charts from "@amcharts/amcharts4/charts"

export function configureInteractions(
    chart: am4charts.XYChart
) {
    chart.cursor = new am4charts.XYCursor()
    chart.cursor.behavior = "zoomX"
    chart.cursor.lineY.disabled = true

    chart.scrollbarX = new am4charts.XYChartScrollbar()
    chart.scrollbarX.parent = chart.topAxesContainer
    chart.scrollbarX.minHeight = 30
}

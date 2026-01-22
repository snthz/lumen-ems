// features/chart/config/chart.axes.ts
import * as am4charts from "@amcharts/amcharts4/charts"
import * as am4core from "@amcharts/amcharts4/core"

export function configureDateAxis(chart: am4charts.XYChart) {
    const axis = chart.xAxes.push(new am4charts.DateAxis())

    axis.renderer.labels.template.fontSize = 11
    axis.renderer.labels.template.fill = am4core.color("#9ca3af")
    axis.renderer.minGridDistance = 60

    return axis
}

export function buildValueAxesByUnit(
    chart: am4charts.XYChart,
    units: string[]
) {
    const axisMap = new Map<string, am4charts.ValueAxis>()

    units.forEach((unit, index) => {
        const axis = chart.yAxes.push(new am4charts.ValueAxis())

        axis.renderer.opposite = index % 2 === 1

        axis.renderer.labels.template.fontSize = 11
        axis.renderer.labels.template.fillOpacity = 0.6


        axis.numberFormatter.numberFormat = `#,###.## '${unit}'`

        axis.extraMin = 0
        axis.extraMax = 0
        axis.strictMinMax = false

        axis.renderer.grid.template.strokeOpacity =
            index === 0 ? 0.15 : 0

        axisMap.set(unit, axis)
    })

    return axisMap
}

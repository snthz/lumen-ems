// features/chart/config/chart.axes.ts
import * as am4charts from "@amcharts/amcharts4/charts"
import * as am4core from "@amcharts/amcharts4/core"

export function configureDateAxis(chart: am4charts.XYChart) {
    const axis = chart.xAxes.push(new am4charts.DateAxis())

    axis.renderer.labels.template.fontSize = 11
    axis.renderer.labels.template.fill = am4core.color("#9ca3af")
    axis.renderer.minGridDistance = 60
    axis.tooltipDateFormat = "MMM d, HH:mm"
    return axis
}

export function buildValueAxesByAxisKey(
    chart: am4charts.XYChart,
    axes: { axisKey: string; unit: string; factor: number }[],
    series: any[]
) {
    const axisMap = new Map<string, am4charts.ValueAxis>()

    const anyBars = series.some(s => s.chartType === 'bar')

    axes.forEach((def, index) => {
        const axis = chart.yAxes.push(new am4charts.ValueAxis())
        axis.renderer.opposite = index % 2 === 1
        axis.renderer.labels.template.fontSize = 11
        axis.renderer.labels.template.fillOpacity = 0.6
        axis.cursorTooltipEnabled = false
        axis.numberFormatter.numberFormat = `#,###.##`

        axis.renderer.labels.template.adapter.add("text", (text) => {
            if (text) {
                const value = text.replace(/[^\d.,\-]/g, '')
                return `${value} ${def.unit}`
            }
            return text
        })

        const seriesForThisAxis = series.filter(s => s._resolvedAxisKey === def.axisKey)
        const hasNegatives = seriesForThisAxis.some(s =>
            s.data.some((p: any) => Number(p.value) < 0)
        )
        if (!hasNegatives && anyBars) {
            axis.min = 0
            axis.extraMax = 0.05
        }

        axis.renderer.grid.template.strokeOpacity = index === 0 ? 0.15 : 0
        axisMap.set(def.axisKey, axis)
    })

    return axisMap
}
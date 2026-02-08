"use client"

import { useLayoutEffect, useEffect, useRef, useState } from "react"
import * as am4charts from "@amcharts/amcharts4/charts"
import * as am4core from "@amcharts/amcharts4/core"
import { startOfDay, endOfDay } from "date-fns"
import { createXYChart } from "@/features/chart/config/chart.factory"
import { configureDateAxis, buildValueAxesByAxisKey } from "@/features/chart/config/chart.axes"
import { configureInteractions } from "@/features/chart/config/chart.interactions"
import { createLineSeries, createBarSeries } from "@/features/chart/config/chart.series"
import { useChartStore } from "@/features/chart/store/chart.store"
import { useTelemetryQueryStore } from "@/features/telemetry/store/telemetry-query.store"
import { useTelemetryFetcher } from "@/features/telemetry/hooks/use-telemetry-fetcher"
import { resolveTimeRange } from "@/features/telemetry/utils/resolve-time-range"
import { getKeyLabel } from "@/features/telemetry/utils/telemetry-labels"
import { getSeriesColor } from "@/features/chart/utils/series-color.utils"
import {
    sortSeries,
    splitByChartType,
    buildAxisDefinitions,
} from "@/features/chart/helpers/chart.helpers"
import { TelemetrySeriesResult } from "@/features/telemetry/telemetry.types"
import { toast } from "sonner"

function addPrimarySeries(
    chart: am4charts.XYChart,
    axisMap: Map<string, am4charts.ValueAxis>,
    s: any
) {
    const axis = axisMap.get(s._resolvedAxisKey)
    if (!axis) return

    const amSeries = s.chartType === "bar"
        ? createBarSeries(chart)
        : createLineSeries(chart)

    amSeries.yAxis = axis
    amSeries.zIndex = s.chartType === "line" ? 10 : 1

    const name = `${s.deviceName} | ${getKeyLabel(s.key)}`
    const color = getSeriesColor(name)
    amSeries.name = name
    amSeries.stroke = color
    amSeries.fill = color

    if ("columns" in amSeries) {
        (amSeries as am4charts.ColumnSeries).columns.template.fill = color;
        (amSeries as am4charts.ColumnSeries).columns.template.stroke = color
    }

    amSeries.data = s.data.map((p: any) => ({
        date: new Date(p.ts),
        value: p.value != null ? Number(p.value) / s._scaleFactor : undefined,
    }))

    amSeries.tooltipText = `[bold]{name}[/]\n{valueY.formatNumber("#,###.##")} ${s._scaledUnit}`
    if (amSeries.tooltip) {
        amSeries.tooltip.fontSize = 12
        amSeries.tooltip.animationDuration = 500
    }
}

function addComparisonSeries(
    chart: am4charts.XYChart,
    axisMap: Map<string, am4charts.ValueAxis>,
    s: any,
    shiftOffset: number
) {
    const axis = axisMap.get(s._resolvedAxisKey)
    if (!axis) return

    const amSeries = s.chartType === "bar"
        ? createBarSeries(chart)
        : createLineSeries(chart)

    amSeries.yAxis = axis
    amSeries.zIndex = s.chartType === "line" ? 5 : 0

    const primaryName = `${s.deviceName} | ${getKeyLabel(s.key)}`
    const compName = `${s.deviceName} | ${getKeyLabel(s.key)} (comp.)`
    const color = getSeriesColor(primaryName)

    amSeries.name = compName
    amSeries.stroke = color
    amSeries.fill = color
    amSeries.strokeOpacity = 0.5

    if (amSeries instanceof am4charts.LineSeries) {
        amSeries.strokeDasharray = "6,3"
        amSeries.fillOpacity = 0
        amSeries.bullets.each(b => { b.disabled = true })
    }

    if (amSeries instanceof am4charts.ColumnSeries) {
        amSeries.columns.template.fillOpacity = 0.25
        amSeries.columns.template.strokeOpacity = 0.5
        amSeries.columns.template.fill = color
        amSeries.columns.template.stroke = color
        amSeries.stacked = false
    }

    amSeries.data = s.data.map((p: any) => ({
        date: new Date(p.ts + shiftOffset),
        value: p.value != null ? Number(p.value) / s._scaleFactor : undefined,
    }))

    amSeries.tooltipText = `[bold]{name}[/]\n{valueY.formatNumber("#,###.##")} ${s._scaledUnit}`
    if (amSeries.tooltip) {
        amSeries.tooltip.fontSize = 12
        amSeries.tooltip.animationDuration = 500
            
    }
}

export function ComparisonChart() {
    const chartRef = useRef<am4charts.XYChart | null>(null)

    const series = useChartStore(s => s.series)
    const updateKey = useChartStore(s => s.updateKey)
    const comparisonDate = useChartStore(s => s.comparisonDate)
    const comparisonEndDate = useChartStore(s => s.comparisonEndDate)
    const setComparisonLoading = useChartStore(s => s.setComparisonLoading)

    const timeRange = useTelemetryQueryStore(s => s.timeRange)
    const customStart = useTelemetryQueryStore(s => s.customStart)
    const customEnd = useTelemetryQueryStore(s => s.customEnd)

    const { run } = useTelemetryFetcher()

    const primaryRange = customStart && customEnd
        ? { start: customStart, end: customEnd }
        : resolveTimeRange(timeRange)

    const primaryStartMs = primaryRange.start.getTime()
    const primaryEndMs = primaryRange.end.getTime()

    // Local state for comparison data to batch rendering
    const [compData, setCompData] = useState<TelemetrySeriesResult[]>([])
    const compDateMs = comparisonDate?.getTime() ?? null
    const compEndDateMs = comparisonEndDate?.getTime() ?? null

    // Fetch comparison data when comparison range or primary data changes
    useEffect(() => {
        if (!compDateMs || !compEndDateMs) {
            setCompData([])
            return
        }

        const compStart = startOfDay(new Date(compDateMs))
        const compEnd = endOfDay(new Date(compEndDateMs))

        let cancelled = false
        setComparisonLoading(true)

        run(compStart, compEnd)
            .then(result => {
                if (!cancelled) setCompData(result)
            })
            .catch(err => {
                if (!cancelled) {
                    console.error("Error fetching comparison data:", err)
                    toast.error("Error al cargar datos de comparación")
                }
            })
            .finally(() => {
                if (!cancelled) setComparisonLoading(false)
            })

        return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [compDateMs, compEndDateMs, primaryStartMs, primaryEndMs, updateKey])

    // Sync local compData to store for summary
    useEffect(() => {
        useChartStore.getState().setComparisonSeries(compData)
    }, [compData])

    // Create chart on mount
    useLayoutEffect(() => {
        const chart = createXYChart("chartdiv-comparison")
        configureDateAxis(chart)
        configureInteractions(chart)

        chart.legend = new am4charts.Legend()
        chart.legend.position = "bottom"
        chart.legend.scrollable = true
        chart.legend.fontSize = 11
        chart.legend.marginTop = 10
        chart.legend.labels.template.fill = am4core.color("#6b7280")
        chart.legend.valueLabels.template.disabled = true

        const dateAxis = chart.xAxes.getIndex(0)
        if (dateAxis?.tooltip) {
            dateAxis.tooltip.animationDuration = 500
        }

        chartRef.current = chart
        return () => {
            chart.dispose()
            chartRef.current = null
        }
    }, [])

    // Render series - uses local compData so it renders once when both are ready
    useEffect(() => {
        const chart = chartRef.current
        if (!chart) return

        chart.series.clear()
        chart.yAxes.clear()
        while (chart.xAxes.length > 1) {
            chart.xAxes.removeIndex(chart.xAxes.length - 1).dispose()
        }

        if (series.length === 0) return

        // Merge both datasets for consistent axis scaling
        const allSeries = [...series, ...compData]
        const sorted = sortSeries(allSeries)
        const axisDefs = buildAxisDefinitions(sorted)
        const axisMap = buildValueAxesByAxisKey(chart, axisDefs, sorted)

        // Render primary series
        const primarySorted = sorted.filter(s =>
            series.some(ps => ps.deviceId === s.deviceId && ps.key === s.key && ps.data === s.data)
        )
        const { bars: primaryBars, lines: primaryLines } = splitByChartType(primarySorted)
        primaryBars.forEach(s => addPrimarySeries(chart, axisMap, s))
        primaryLines.forEach(s => addPrimarySeries(chart, axisMap, s))

        // Render comparison series (shifted)
        if (compData.length > 0 && compDateMs && compEndDateMs) {
            const compStart = startOfDay(new Date(compDateMs))
            const compEnd = endOfDay(new Date(compEndDateMs))
            const shiftOffset = primaryStartMs - compStart.getTime()

            const compSorted = sorted.filter(s =>
                compData.some(cs => cs.deviceId === s.deviceId && cs.key === s.key && cs.data === s.data)
            )
            const { bars: compBars, lines: compLines } = splitByChartType(compSorted)
            compBars.forEach(s => addComparisonSeries(chart, axisMap, s, shiftOffset))
            compLines.forEach(s => addComparisonSeries(chart, axisMap, s, shiftOffset))

            // Add secondary date axis at top showing comparison dates
            const compAxis = chart.xAxes.push(new am4charts.DateAxis())
            compAxis.renderer.opposite = true
            compAxis.renderer.labels.template.fill = am4core.color("#9ca3af")
            compAxis.renderer.labels.template.fontSize = 10
            compAxis.renderer.grid.template.disabled = true
            compAxis.renderer.line.strokeOpacity = 0.2
            compAxis.min = compStart.getTime()
            compAxis.max = compEnd.getTime()
            compAxis.renderer.minGridDistance = 60
            compAxis.title.text = "Comparación"
            compAxis.title.fill = am4core.color("#9ca3af")
            compAxis.title.fontSize = 10
            if (compAxis.tooltip) {
                compAxis.tooltip.disabled = true
            }
        }

        // Scrollbar - only primary series
        const scrollbar = chart.scrollbarX as am4charts.XYChartScrollbar
        if (scrollbar) {
            scrollbar.series.clear()

            let hasBar = false
            let hasLine = false
            const primaryCount = series.length

            chart.series.each((s, i) => {
                if (i >= primaryCount) return
                if (s instanceof am4charts.ColumnSeries && !hasBar) {
                    scrollbar.series.push(s)
                    hasBar = true
                }
                if (s instanceof am4charts.LineSeries && !hasLine) {
                    scrollbar.series.push(s)
                    hasLine = true
                }
            })

            scrollbar.background.fill = am4core.color("#f3f4f6")
            scrollbar.background.fillOpacity = 1

            scrollbar.scrollbarChart.series.each(s => {
                s.fillOpacity = 0.15
                s.strokeOpacity = 0.3
                if (s instanceof am4charts.LineSeries) {
                    s.bullets.each(b => { b.disabled = true })
                }
                if (s instanceof am4charts.ColumnSeries) {
                    s.columns.template.strokeOpacity = 0
                }
            })

            scrollbar.scrollbarChart.xAxes.each(axis => {
                axis.renderer.grid.template.disabled = true
                axis.renderer.labels.template.disabled = true
            })
            scrollbar.scrollbarChart.yAxes.each(axis => {
                axis.renderer.grid.template.disabled = true
                axis.renderer.labels.template.disabled = true
            })
        }

        chart.invalidateData()
    }, [series, compData, updateKey, compDateMs, compEndDateMs, primaryStartMs, primaryEndMs])

    return (
        <div
            id="chartdiv-comparison"
            style={{ width: "100%", minHeight: "600px" }}
        />
    )
}

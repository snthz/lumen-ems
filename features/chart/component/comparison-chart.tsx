"use client"

import { useLayoutEffect, useEffect, useRef, useState } from "react"
import * as am4charts from "@amcharts/amcharts4/charts"
import * as am4core from "@amcharts/amcharts4/core"
import { createXYChart } from "@/features/chart/config/chart.factory"
import { configureDateAxis, buildValueAxesByAxisKey } from "@/features/chart/config/chart.axes"
import { configureInteractions } from "@/features/chart/config/chart.interactions"
import { createLineSeries, createBarSeries } from "@/features/chart/config/chart.series"
import { useChartStore } from "@/features/chart/store/chart.store"
import { useTelemetryQueryStore } from "@/features/telemetry/store/telemetry-query.store"
import { useTelemetryFetcher } from "@/features/telemetry/hooks/use-telemetry-fetcher"
import { resolveTimeRange } from "@/features/telemetry/utils/resolve-time-range"
import { getKeyLabel } from "@/features/telemetry/utils/telemetry-labels"
import { getSeriesColor, getComparisonColor } from "@/features/chart/utils/series-color.utils"
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
    s: any,
    splitBars: boolean,
    resolution?: number
) {
    const axis = axisMap.get(s._resolvedAxisKey)
    if (!axis) return

    const amSeries = s.chartType === "bar"
        ? createBarSeries(chart)
        : createLineSeries(chart, resolution)

    amSeries.yAxis = axis
    amSeries.zIndex = s.chartType === "line" ? 10 : 1

    const name = `${s.deviceName} | ${getKeyLabel(s.key)}`
    const color = am4core.color(getSeriesColor(name, s.chartType))
    amSeries.name = name
    amSeries.stroke = color
    amSeries.fill = color

    if (amSeries instanceof am4charts.ColumnSeries) {
        amSeries.columns.template.fill = color
        amSeries.columns.template.stroke = color
        if (splitBars) {
            amSeries.columns.template.width = am4core.percent(45)
            amSeries.columns.template.adapter.add("dx", (_dx, target) => {
                return -(target.pixelWidth / 2) - 1
            })
        }
    }

    amSeries.data = s.data.map((p: any) => ({
        date: new Date(p.ts),
        value: p.value != null ? Number(p.value) / s._scaleFactor : undefined,
    }))

    amSeries.tooltipText = `[bold]{name}[/]\n{valueY.formatNumber("#,###.##")} ${s._scaledUnit}`
    if (amSeries.tooltip) {
        amSeries.tooltip.fontSize = 12
        amSeries.tooltip.animationDuration = 1000
        amSeries.tooltip.animationEasing = am4core.ease.cubicOut
        amSeries.tooltip.pointerOrientation = "vertical"
    }
}

function addComparisonSeries(
    chart: am4charts.XYChart,
    axisMap: Map<string, am4charts.ValueAxis>,
    s: any,
    shiftOffset: number,
    resolution?: number,
    isFirstBar?: boolean
) {
    const axis = axisMap.get(s._resolvedAxisKey)
    if (!axis) return

    const amSeries = s.chartType === "bar"
        ? createBarSeries(chart)
        : createLineSeries(chart, resolution)

    amSeries.yAxis = axis
    amSeries.zIndex = s.chartType === "line" ? 5 : 0

    const primaryName = `${s.deviceName} | ${getKeyLabel(s.key)}`
    const compName = `${s.deviceName} | ${getKeyLabel(s.key)} (comp.)`
    const color = am4core.color(getComparisonColor(primaryName, s.chartType))

    amSeries.name = compName
    amSeries.stroke = color
    amSeries.fill = color
    amSeries.strokeOpacity = 0.8
    amSeries.fillOpacity = 0.35

    if (amSeries instanceof am4charts.LineSeries) {
        amSeries.strokeDasharray = "8,4"
        amSeries.strokeWidth = 2
        amSeries.fillOpacity = 0
    }

    if (amSeries instanceof am4charts.ColumnSeries) {
        // First comparison bar breaks the stacking chain from primary bars
        if (isFirstBar) amSeries.stacked = false
        amSeries.clustered = false
        amSeries.columns.template.width = am4core.percent(45)
        amSeries.columns.template.fillOpacity = 0.35
        amSeries.columns.template.strokeOpacity = 0.5
        amSeries.columns.template.fill = color
        amSeries.columns.template.stroke = color
        amSeries.columns.template.adapter.add("dx", (_dx, target) => {
            return (target.pixelWidth / 2) + 1
        })
    }

    amSeries.data = s.data.map((p: any) => ({
        date: new Date(p.ts + shiftOffset),
        value: p.value != null ? Number(p.value) / s._scaleFactor : undefined,
    }))

    amSeries.tooltipText = `[bold]{name}[/]\n{valueY.formatNumber("#,###.##")} ${s._scaledUnit}`
    if (amSeries.tooltip) {
        amSeries.tooltip.fontSize = 12
        amSeries.tooltip.animationDuration = 1000
        amSeries.tooltip.animationEasing = am4core.ease.cubicOut
        amSeries.tooltip.pointerOrientation = "vertical"
    }
}

export function ComparisonChart() {
    const chartRef = useRef<am4charts.XYChart | null>(null)

    const series = useChartStore(s => s.series)
    const updateKey = useChartStore(s => s.updateKey)
    const energyUnit = useChartStore(s => s.energyUnit)
    const comparisonDate = useChartStore(s => s.comparisonDate)
    const comparisonEndDate = useChartStore(s => s.comparisonEndDate)
    const comparisonLoading = useChartStore(s => s.comparisonLoading)
    const setComparisonLoading = useChartStore(s => s.setComparisonLoading)
    const setVisibleRange = useChartStore(s => s.setVisibleRange)

    const timeRange = useTelemetryQueryStore(s => s.timeRange)
    const customStart = useTelemetryQueryStore(s => s.customStart)
    const customEnd = useTelemetryQueryStore(s => s.customEnd)
    const resolution = useChartStore(s => s.committedResolution)

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
        if (!compDateMs || !compEndDateMs) return

        // Calculate the time-of-day offset from the primary range
        // so comparison fetches the same time window (e.g. 00:00-05:59)
        const primaryStartDate = new Date(primaryStartMs)
        const primaryEndDate = new Date(primaryEndMs)
        const startHours = primaryStartDate.getHours()
        const startMinutes = primaryStartDate.getMinutes()
        const endHours = primaryEndDate.getHours()
        const endMinutes = primaryEndDate.getMinutes()

        const compStart = new Date(compDateMs)
        compStart.setHours(startHours, startMinutes, 0, 0)
        const compEnd = new Date(compEndDateMs)
        compEnd.setHours(endHours, endMinutes, 59, 999)

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

    const displayCompData = compDateMs && compEndDateMs ? compData : []

    // Sync local displayCompData to store for summary
    useEffect(() => {
        useChartStore.getState().setComparisonSeries(displayCompData)
    }, [displayCompData])

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
        chart.legend.useDefaultMarker = true
        chart.legend.markers.template.width = 14
        chart.legend.markers.template.height = 14
        chart.legend.itemContainers.template.paddingLeft = 4
        chart.legend.itemContainers.template.paddingRight = 4

        const dateAxis = chart.xAxes.getIndex(0)
        if (dateAxis?.tooltip) {
            dateAxis.tooltip.animationDuration = 500
        }

        if (dateAxis) {
            const da = dateAxis as am4charts.DateAxis
            ;(da.events as any).on("selectionextremeschanged", () => {
                const min = da.minZoomed
                const max = da.maxZoomed
                if (min != null && max != null) {
                    setVisibleRange(min, max)
                }
            })
        }

        chartRef.current = chart
        return () => {
            chart.dispose()
            chartRef.current = null
        }
    }, [setVisibleRange])

    // Render series - wait for comparison data to be ready to avoid double render
    useEffect(() => {
        const chart = chartRef.current
        if (!chart) return

        // If comparison is active but still loading, skip render to avoid flash
        if (compDateMs && compEndDateMs && comparisonLoading) return

        chart.series.clear()
        chart.yAxes.clear()
        setVisibleRange(null, null)
        while (chart.xAxes.length > 1) {
            chart.xAxes.removeIndex(chart.xAxes.length - 1).dispose()
        }

        if (series.length === 0) return

        // Merge both datasets for consistent axis scaling
        const allSeries = [...series, ...displayCompData]
        const sorted = sortSeries(allSeries)
        const axisDefs = buildAxisDefinitions(sorted, energyUnit)
        const axisMap = buildValueAxesByAxisKey(chart, axisDefs, sorted)

        // Pre-compute comparison split to know if bars need side-by-side layout
        let compSorted: any[] = []
        let compBars: any[] = []
        let compLines: any[] = []
        let shiftOffset = 0

        if (displayCompData.length > 0 && compDateMs && compEndDateMs) {
            const primaryStartDate = new Date(primaryStartMs)
            const compStart = new Date(compDateMs)
            compStart.setHours(primaryStartDate.getHours(), primaryStartDate.getMinutes(), 0, 0)
            shiftOffset = primaryStartMs - compStart.getTime()

            compSorted = sorted.filter(s =>
                displayCompData.some(cs => cs.deviceId === s.deviceId && cs.key === s.key && cs.data === s.data)
            )
            const split = splitByChartType(compSorted)
            compBars = split.bars
            compLines = split.lines
        }

        const hasCompBars = compBars.length > 0

        // Render primary series
        const primarySorted = sorted.filter(s =>
            series.some(ps => ps.deviceId === s.deviceId && ps.key === s.key && ps.data === s.data)
        )
        const { bars: primaryBars, lines: primaryLines } = splitByChartType(primarySorted)
        primaryBars.forEach(s => addPrimarySeries(chart, axisMap, s, hasCompBars, resolution))
        primaryLines.forEach(s => addPrimarySeries(chart, axisMap, s, false, resolution))

        // Render comparison series (shifted)
        if (displayCompData.length > 0 && compDateMs && compEndDateMs) {
            const primaryStartDate = new Date(primaryStartMs)
            const primaryEndDate = new Date(primaryEndMs)
            const compStart = new Date(compDateMs)
            compStart.setHours(primaryStartDate.getHours(), primaryStartDate.getMinutes(), 0, 0)
            const compEnd = new Date(compEndDateMs)
            compEnd.setHours(primaryEndDate.getHours(), primaryEndDate.getMinutes(), 59, 999)

            compBars.forEach((s, i) => addComparisonSeries(chart, axisMap, s, shiftOffset, resolution, i === 0))
            compLines.forEach(s => addComparisonSeries(chart, axisMap, s, shiftOffset, resolution))

            // Add secondary date axis at top showing comparison dates
            const compAxis = chart.xAxes.push(new am4charts.DateAxis())
            const primaryDateAxis = chart.xAxes.getIndex(0) as am4charts.DateAxis
            if (primaryDateAxis) {
                compAxis.syncWithAxis = primaryDateAxis
            }
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

        // Auto-scale Y axes when toggling series via legend
        chart.series.each(s => {
            s.events.on("hidden", () => {
                chart.yAxes.each(axis => axis.invalidateDataRange())
            })
            s.events.on("shown", () => {
                chart.yAxes.each(axis => axis.invalidateDataRange())
            })
        })

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

        // Ensure cursor zooms on the primary date axis (not the comparison axis)
        const primaryDateAxis = chart.xAxes.getIndex(0) as am4charts.DateAxis
        if (chart.cursor && primaryDateAxis) {
            chart.cursor.xAxis = primaryDateAxis
        }

        chart.mouseWheelBehavior = "zoomX"

        chart.invalidateData()
    }, [series, displayCompData, updateKey, energyUnit, compDateMs, compEndDateMs, primaryStartMs, primaryEndMs, comparisonLoading, resolution, setVisibleRange])

    return (
        <div
            id="chartdiv-comparison"
            style={{ width: "100%", minHeight: "600px" }}
        />
    )
}

"use client"

import { useLayoutEffect, useEffect, useRef } from "react"
import * as am4charts from "@amcharts/amcharts4/charts"
import * as am4core from "@amcharts/amcharts4/core"
import { createXYChart } from "@/features/chart/config/chart.factory"
import { configureDateAxis, buildValueAxesByAxisKey } from "@/features/chart/config/chart.axes"
import { configureInteractions } from "@/features/chart/config/chart.interactions"
import { createLineSeries, createBarSeries } from "@/features/chart/config/chart.series"
import { useChartStore } from "@/features/chart/store/chart.store"
import { groupSeriesByKey } from "@/features/chart/utils/series-grouping.utils"
import { buildAxisDefinitions, sortSeries } from "@/features/chart/helpers/chart.helpers"
import { getSeriesColor } from "@/features/chart/utils/series-color.utils"

function toChartSeries(grouped: ReturnType<typeof groupSeriesByKey>) {
    return grouped.map(g => ({
        deviceId: '__grouped__',
        deviceName: '',
        assetId: '',
        assetName: '',
        key: g.key,
        unit: g.unit,
        chartType: g.chartType,
        axisKey: g.axisKey,
        data: g.data.map(p => ({ ts: p.ts, value: p.value })),
    }))
}

export function GroupedChartView() {
    const chartRef = useRef<am4charts.XYChart | null>(null)
    const series = useChartStore(state => state.series)
    const updateKey = useChartStore(state => state.updateKey)

    useLayoutEffect(() => {
        const chart = createXYChart("chartdiv-grouped")

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
            dateAxis.tooltip.animationDuration = 400
        }

        chartRef.current = chart

        return () => {
            chart.dispose()
            chartRef.current = null
        }
    }, [])

    useEffect(() => {
        const chart = chartRef.current
        if (!chart) return

        chart.series.clear()
        chart.yAxes.clear()

        if (series.length === 0) return

        const grouped = groupSeriesByKey(series)
        const chartSeriesData = toChartSeries(grouped)
        const sorted = sortSeries(chartSeriesData)
        const axisDefs = buildAxisDefinitions(sorted)
        const axisMap = buildValueAxesByAxisKey(chart, axisDefs, sorted)

        for (const s of sorted) {
            const resolvedAxisKey = (s as any)._resolvedAxisKey
            const scaleFactor = (s as any)._scaleFactor ?? 1
            const scaledUnit = (s as any)._scaledUnit ?? s.unit

            const axis = axisMap.get(resolvedAxisKey)
            if (!axis) continue

            const amSeries = s.chartType === 'bar'
                ? createBarSeries(chart)
                : createLineSeries(chart)

            amSeries.yAxis = axis
            amSeries.zIndex = s.chartType === 'line' ? 10 : 1

            const groupInfo = grouped.find(g => g.key === s.key)!
            const name = groupInfo.label
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
                value: p.value != null ? Number(p.value) / scaleFactor : undefined,
            }))

            amSeries.tooltipText = `[bold]{name}[/]\n{valueY.formatNumber("#,###.##")} ${scaledUnit}`
            if (amSeries.tooltip) {
                amSeries.tooltip.fontSize = 12
                amSeries.tooltip.animationDuration = 400
            }
        }

        const scrollbar = chart.scrollbarX as am4charts.XYChartScrollbar
        if (scrollbar) {
            scrollbar.series.clear()

            let hasBar = false
            let hasLine = false

            chart.series.each(s => {
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
    }, [series, updateKey])

    return (
        <div
            id="chartdiv-grouped"
            style={{ width: "100%", height: "600px" }}
        />
    )
}

"use client"

import { useLayoutEffect, useEffect, useRef } from "react"
import * as am4charts from "@amcharts/amcharts4/charts"
import * as am4core from "@amcharts/amcharts4/core"

import { createXYChart } from "@/features/chart/config/chart.factory"
import {
    configureDateAxis,
    buildValueAxesByUnit,
} from "@/features/chart/config/chart.axes"
import { configureInteractions } from "@/features/chart/config/chart.interactions"
import { createBarSeries, createLineSeries } from "@/features/chart/config/chart.series"
import { useChartStore } from "@/features/chart/store/chart.store"
import { getSeriesColor } from "@/features/chart/utils/series-color.utils"

export function Chart() {
    const chartRef = useRef<am4charts.XYChart | null>(null)
    const series = useChartStore(state => state.series)

    // ───────── INIT ─────────
    useLayoutEffect(() => {
        const chart = createXYChart("chartdiv")

        configureDateAxis(chart)
        configureInteractions(chart)

        chartRef.current = chart

        return () => {
            chart.dispose()
            chartRef.current = null
        }
    }, [])

    // ───────── DATA UPDATE ─────────
    useEffect(() => {
        if (!chartRef.current || series.length === 0) return

        const chart = chartRef.current

        chart.series.clear()
        chart.yAxes.clear()

        const sorted = [...series].sort((a, b) => {
            const u = a.unit.localeCompare(b.unit)
            if (u !== 0) return u
            const d = a.deviceName.localeCompare(b.deviceName)
            if (d !== 0) return d
            return a.key.localeCompare(b.key)
        })

        const units = Array.from(new Set(sorted.map(s => s.unit)))
        const axisMap = buildValueAxesByUnit(chart, units)

        const bars = sorted.filter(s => s.chartType === "bar")
        const lines = sorted.filter(s => s.chartType === "line")

        function addSeries(s: typeof sorted[number]) {
            const axis = axisMap.get(s.unit)!
            const values = s.data.map(p => Number(p.value))
            const hasNegative = values.some(v => v < 0)

            // min = 0 solo si no hay negativos
            if (!hasNegative) {
                axis.min = 0
            } else {
                axis.min = undefined
            }

            const chartSeries =
                s.chartType === "bar"
                    ? createBarSeries(chart)
                    : createLineSeries(chart)

            chartSeries.yAxis = axis

            const color = getSeriesColor(`${s.deviceName}-${s.key}`)
            chartSeries.name = `${s.deviceName} – ${s.key}`
            chartSeries.stroke = color
            chartSeries.zIndex = s.chartType === "line" ? 10 : 1

            if ("columns" in chartSeries) {
                chartSeries.columns.template.fill = color
                chartSeries.columns.template.width = am4core.percent(60)
            }

            chartSeries.data = s.data.map(p => ({
                date: new Date(p.ts),
                value: Number(p.value),
            }))

            chartSeries.tooltipText = `{name}: {valueY} ${s.unit}`
        }

        bars.forEach(addSeries)
        lines.forEach(addSeries)

        chart.invalidateRawData()
    }, [series])

    return (
        <div
            id="chartdiv"
            style={{ width: "100%", height: "700px" }}
        />
    )
}

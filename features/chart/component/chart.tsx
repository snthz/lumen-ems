"use client"

import { useLayoutEffect, useEffect, useRef } from "react"
import * as am4charts from "@amcharts/amcharts4/charts"

import { createXYChart } from "@/features/chart/config/chart.factory"
import { configureDateAxis } from "@/features/chart/config/chart.axes"
import { buildValueAxesByAxisKey } from "@/features/chart/config/chart.axes"
import { configureInteractions } from "@/features/chart/config/chart.interactions"
import { useChartStore } from "@/features/chart/store/chart.store"

import {
    sortSeries,
    splitByChartType,
    buildAxisDefinitions,
    addSeriesToChart,
} from "@/features/chart/helpers/chart.helpers"

export function Chart() {
    const chartRef = useRef<am4charts.XYChart | null>(null)
    const series = useChartStore(state => state.series)

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

    useEffect(() => {
        if (!chartRef.current || series.length === 0) return

        const chart = chartRef.current
        chart.series.clear()
        chart.yAxes.clear()

        const sorted = sortSeries(series)
        const axisDefs = buildAxisDefinitions(sorted)
        const axisMap = buildValueAxesByAxisKey(chart, axisDefs, sorted)
        const { bars, lines } = splitByChartType(sorted)

        bars.forEach(s => addSeriesToChart(chart, axisMap, s))
        lines.forEach(s => addSeriesToChart(chart, axisMap, s))

        chart.invalidateRawData()
    }, [series])

    return (
        <div
            id="chartdiv"
            style={{ width: "100%", height: "600px" }}
        />
    )
}
"use client"

import { useLayoutEffect } from "react"
import {createLineSeries} from "@/features/chart/config/chart.series";
import {createXYChart} from "@/features/chart/config/chart.factory";
import {configureInteractions} from "@/features/chart/config/chart.interactions";
import {configureDateAxis, configureValueAxis} from "@/features/chart/config/chart.axes";


export function Chart() {
    useLayoutEffect(() => {
        const chart = createXYChart("chartdiv")

        chart.data = [
            { date: new Date(2024, 0, 1), value: 50 },
            { date: new Date(2024, 0, 2), value: 55 },
            { date: new Date(2024, 0, 3), value: 60 },
            { date: new Date(2024, 0, 4), value: 53 },
            { date: new Date(2024, 0, 5), value: 58 },
        ]

        configureDateAxis(chart)
        configureValueAxis(chart)

        createLineSeries(chart)
        configureInteractions(chart)

        return () => {
            chart.dispose()
        }
    }, [])

    return (
        <div
            id="chartdiv"
            style={{ width: "100%", height: "500px" }}
        />
    )
}

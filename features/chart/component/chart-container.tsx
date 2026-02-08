"use client"

import { useChartStore } from "@/features/chart/store/chart.store"
import { Chart } from "./chart"
import { PieChartView } from "./pie-chart"
import { GroupedChartView } from "./grouped-chart"
import { ComparisonChart } from "./comparison-chart"

export function ChartContainer() {
    const chartView = useChartStore(state => state.chartView)

    return (
        <div>
            {chartView === 'series' && <Chart />}
            {chartView === 'pie' && <PieChartView />}
            {chartView === 'grouped' && <GroupedChartView />}
            {chartView === 'comparison' && <ComparisonChart />}
        </div>
    )
}

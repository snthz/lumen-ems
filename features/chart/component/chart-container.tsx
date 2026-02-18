"use client"

import dynamic from "next/dynamic"
import { useChartStore } from "@/features/chart/store/chart.store"
import { Skeleton } from "@/components/ui/skeleton"

function ChartSkeleton() {
    return <Skeleton className="w-full" style={{ minHeight: "600px" }} />
}

const Chart = dynamic(() => import("./chart").then(m => ({ default: m.Chart })), { ssr: false, loading: ChartSkeleton })
const PieChartView = dynamic(() => import("./pie-chart").then(m => ({ default: m.PieChartView })), { ssr: false, loading: ChartSkeleton })
const GroupedChartView = dynamic(() => import("./grouped-chart").then(m => ({ default: m.GroupedChartView })), { ssr: false, loading: ChartSkeleton })
const ComparisonChart = dynamic(() => import("./comparison-chart").then(m => ({ default: m.ComparisonChart })), { ssr: false, loading: ChartSkeleton })

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

"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useChartStore } from "@/features/chart/store/chart.store"
import { useTelemetryQueryStore } from "@/features/telemetry/store/telemetry-query.store"
import { resolveTimeRange } from "@/features/telemetry/utils/resolve-time-range"
import { exportToExcel } from "@/features/chart/utils/export-excel.utils"
import { startOfDay, endOfDay } from "date-fns"

export function ExportButton() {
    const series = useChartStore(s => s.series)
    const chartView = useChartStore(s => s.chartView)
    const energyUnit = useChartStore(s => s.energyUnit)
    const comparisonDate = useChartStore(s => s.comparisonDate)
    const comparisonEndDate = useChartStore(s => s.comparisonEndDate)
    const comparisonSeries = useChartStore(s => s.comparisonSeries)

    const timeRange = useTelemetryQueryStore(s => s.timeRange)
    const customStart = useTelemetryQueryStore(s => s.customStart)
    const customEnd = useTelemetryQueryStore(s => s.customEnd)

    const primaryRange = customStart && customEnd
        ? { start: customStart, end: customEnd }
        : resolveTimeRange(timeRange)

    function handleExport() {
        if (series.length === 0) return

        const isComparison = chartView === 'comparison' && comparisonSeries.length > 0
        const compRange = isComparison && comparisonDate && comparisonEndDate
            ? { start: startOfDay(comparisonDate), end: endOfDay(comparisonEndDate) }
            : null

        exportToExcel({
            series,
            comparisonSeries: isComparison ? comparisonSeries : undefined,
            dateRange: primaryRange,
            comparisonRange: compRange,
            energyUnit,
        })
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-neutral-400"
                    onClick={handleExport}
                    disabled={series.length === 0}
                >
                    <Download className="size-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>Exportar Excel</TooltipContent>
        </Tooltip>
    )
}

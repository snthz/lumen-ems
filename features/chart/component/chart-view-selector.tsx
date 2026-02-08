"use client"

import { LineChart, PieChart, BarChart3, ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useChartStore, type ChartView } from "@/features/chart/store/chart.store"
import { cn } from "@/lib/utils"

const VIEW_OPTIONS: { value: ChartView; icon: typeof LineChart; label: string }[] = [
    { value: 'series',  icon: LineChart,  label: 'Series' },
    { value: 'pie',     icon: PieChart,   label: 'Torta' },
    { value: 'grouped',    icon: BarChart3,       label: 'Agrupado' },
    { value: 'comparison', icon: ArrowLeftRight,  label: 'Comparar' },
]

export function ChartViewSelector() {
    const chartView = useChartStore(state => state.chartView)
    const setChartView = useChartStore(state => state.setChartView)

    return (
        <div className="flex items-center gap-1">
            {VIEW_OPTIONS.map(opt => {
                const Icon = opt.icon
                const isActive = chartView === opt.value
                return (
                    <Tooltip key={opt.value}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className={cn(
                                    "text-neutral-400",
                                    isActive && "bg-neutral-100 text-neutral-900"
                                )}
                                onClick={() => setChartView(opt.value)}
                            >
                                <Icon className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{opt.label}</TooltipContent>
                    </Tooltip>
                )
            })}
        </div>
    )
}

"use client"

import { useChartStore, EnergyUnit } from "@/features/chart/store/chart.store"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function EnergyUnitSelector() {
    const energyUnit = useChartStore(state => state.energyUnit)
    const setEnergyUnit = useChartStore(state => state.setEnergyUnit)
    const series = useChartStore(state => state.series)

    // Only show if there are energy metrics
    const hasEnergyMetrics = series.some(s => 
        s.unit === 'Wh' || s.unit === 'varh' || s.unit === 'VAh'
    )

    if (!hasEnergyMetrics) return null

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Energy unit:</span>
            <Select value={energyUnit} onValueChange={(value) => setEnergyUnit(value as EnergyUnit)}>
                <SelectTrigger className="w-30">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="kWh">kWh</SelectItem>
                    <SelectItem value="MWh">MWh</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}

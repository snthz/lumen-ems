"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useChartStore } from "@/features/chart/store/chart.store"

export function ComparisonDatePicker() {
    const [open, setOpen] = useState(false)
    const comparisonDate = useChartStore(s => s.comparisonDate)
    const setComparisonDate = useChartStore(s => s.setComparisonDate)
    const loading = useChartStore(s => s.comparisonLoading)

    function handleSelect(date: Date | undefined) {
        if (date) {
            setComparisonDate(date)
            setOpen(false)
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" disabled={loading} className="text-xs gap-1.5 h-7">
                    {loading
                        ? <Loader2 className="size-3 animate-spin" />
                        : <CalendarIcon className="size-3.5" />
                    }
                    {comparisonDate
                        ? `Comparar: ${format(comparisonDate, "dd MMM yyyy", { locale: es })}`
                        : "Fecha de comparación"
                    }
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                    mode="single"
                    selected={comparisonDate ?? undefined}
                    onSelect={handleSelect}
                    locale={es}
                    disabled={{ after: new Date() }}
                />
            </PopoverContent>
        </Popover>
    )
}

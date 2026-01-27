import { Button } from '@/components/ui/button'
import { Calendar, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format, startOfDay, endOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { TimeRangeKey } from '@/features/telemetry/telemetry.types'
import {TIME_RANGE_OPTIONS} from "@/features/telemetry/constants/telemetry.intervals";

interface CustomDatePickerProps {
    customRange: { from: Date | undefined; to: Date | undefined }
    onRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void
    onApply: (start: Date, end: Date) => void
    onQuickSelect: (value: TimeRangeKey) => void
    popoverOpen: boolean
    onPopoverChange: (open: boolean) => void
    loading: boolean
}

export function CustomDatePicker({
                                     customRange,
                                     onRangeChange,
                                     onApply,
                                     onQuickSelect,
                                     popoverOpen,
                                     onPopoverChange,
                                     loading,
                                 }: CustomDatePickerProps) {
    function handleCalendarSelect(range: any) {
        onRangeChange({
            from: range?.from,
            to: range?.to,
        })
    }

    function handleApply() {
        if (!customRange.from || !customRange.to) {
            toast.error('Selecciona un rango completo', {
                description: 'Debes seleccionar fecha de inicio y fin',
            })
            return
        }

        const start = startOfDay(customRange.from)
        const end = endOfDay(customRange.to)

        onApply(start, end)
    }

    function handleClear() {
        onRangeChange({ from: undefined, to: undefined })
    }

    return (
        <Popover open={popoverOpen} onOpenChange={onPopoverChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex-1 justify-start text-left font-normal"
                    disabled={loading}
                >
                    <Calendar className="mr-2 h-4 w-4" />
                    {customRange.from ? (
                        customRange.to ? (
                            <>
                                {format(customRange.from, 'dd/MM/yyyy', { locale: es })} -{' '}
                                {format(customRange.to, 'dd/MM/yyyy', { locale: es })}
                            </>
                        ) : (
                            format(customRange.from, 'dd/MM/yyyy', { locale: es })
                        )
                    ) : (
                        <span>Seleccionar fechas</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
                <div className="flex">
                    <ScrollArea className="h-100 w-40 border-r">
                        <div className="p-2">
                            {TIME_RANGE_OPTIONS.filter(opt => opt.value !== 'custom').map(opt => (
                                <Button
                                    key={opt.value}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onQuickSelect(opt.value as TimeRangeKey)}
                                    className="w-full justify-start text-sm mb-1 rounded-xs"
                                >
                                    {opt.label}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>

                    <div>
                        <div className="p-3 border-b flex justify-between items-center">
                            <span className="text-sm font-medium">Seleccionar rango</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClear}
                                className="h-7 text-xs"
                            >
                                <X className="h-3 w-3 mr-1" />
                                Limpiar
                            </Button>
                        </div>
                        <CalendarComponent
                            mode="range"
                            selected={{
                                from: customRange.from,
                                to: customRange.to,
                            }}
                            onSelect={handleCalendarSelect}
                            numberOfMonths={2}
                            locale={es}
                        />
                        <div className="p-3 border-t">
                            <Button
                                onClick={handleApply}
                                disabled={!customRange.from || !customRange.to}
                                className="w-full rounded-xs"
                                size="sm"
                            >
                                Actualizar
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
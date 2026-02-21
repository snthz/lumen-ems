import { Button } from '@/components/ui/button'
import { Calendar, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, setHours, setMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { TimeRangeKey } from '@/features/telemetry/telemetry.types'
import { TIME_RANGE_OPTIONS } from "@/features/telemetry/constants/telemetry.intervals"
import { useState } from 'react'

interface CustomDatePickerProps {
    customRange: { from: Date | undefined; to: Date | undefined }
    onRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void
    onApply: (start: Date, end: Date) => void
    onQuickSelect: (value: TimeRangeKey) => void
    loading: boolean
    selectedLabel?: string
}

export function CustomDatePicker({
    customRange,
    onRangeChange,
    onApply,
    onQuickSelect,
    loading,
    selectedLabel,
}: CustomDatePickerProps) {
    const [open, setOpen] = useState(false)
    const [fromTime, setFromTime] = useState({ hour: '00', minute: '00' })
    const [toTime, setToTime] = useState({ hour: '23', minute: '59' })

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

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

        let start = setHours(customRange.from, parseInt(fromTime.hour))
        start = setMinutes(start, parseInt(fromTime.minute))

        let end = setHours(customRange.to, parseInt(toTime.hour))
        end = setMinutes(end, parseInt(toTime.minute))

        onApply(start, end)
        setOpen(false)
    }

    function handleQuickSelect(value: TimeRangeKey) {
        onQuickSelect(value)
        setOpen(false)
    }

    function handleClear() {
        onRangeChange({ from: undefined, to: undefined })
        setFromTime({ hour: '00', minute: '00' })
        setToTime({ hour: '23', minute: '59' })
    }

    function getDisplayText() {
        if (selectedLabel && !customRange.from) return selectedLabel
        if (customRange.from && customRange.to) {
            return `${format(customRange.from, 'dd MMM yyyy', { locale: es })} ${fromTime.hour}:${fromTime.minute} - ${format(customRange.to, 'dd MMM yyyy', { locale: es })} ${toTime.hour}:${toTime.minute}`
        }
        return selectedLabel || 'Seleccionar fechas'
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="justify-start text-left font-normal"
                    disabled={loading}
                >
                    <Calendar className="mr-2 h-4 w-4" />
                    {getDisplayText()}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[95vw] ml-1.5 md:w-auto p-0 max-h-[80vh] overflow-hidden" align="end">
                <ScrollArea className="h-[80vh] md:h-auto">
                    <div className="flex flex-col md:flex-row">
                        <div className="md:h-100 md:w-40 md:border-r border-b md:border-b-0">
                            <div className="py-4 px-2 md:p-2 grid grid-cols-3 md:grid-cols-1 gap-x-4 gap-y-1">
                                {TIME_RANGE_OPTIONS.filter(opt => opt.value !== 'custom').map(opt => (
                                    <Button
                                        key={opt.value}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleQuickSelect(opt.value as TimeRangeKey)}
                                        className="w-full justify-start text-sm rounded-xs"
                                    >
                                        {opt.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1">
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
                            
                            <div className="overflow-x-auto">
                                <CalendarComponent
                                    className="w-full md:w-auto"
                                    mode="range"
                                    selected={{
                                        from: customRange.from,
                                        to: customRange.to,
                                    }}
                                    onSelect={handleCalendarSelect}
                                    numberOfMonths={2}
                                    locale={es}
                                />
                            </div>

                            <div className="p-3 border-t flex gap-4">
                                <div className="flex-1">
                                    <label htmlFor="from-hour" className="text-xs text-muted-foreground mb-1 block">Desde</label>
                                    <div className="flex gap-1">
                                        <Select value={fromTime.hour} onValueChange={(v) => setFromTime(prev => ({ ...prev, hour: v }))}>
                                            <SelectTrigger id="from-hour" className="w-16 h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <ScrollArea className="h-48">
                                                    {hours.map(h => (
                                                        <SelectItem key={h} value={h}>{h}</SelectItem>
                                                    ))}
                                                </ScrollArea>
                                            </SelectContent>
                                        </Select>
                                        <span className="self-center text-muted-foreground">:</span>
                                        <Select value={fromTime.minute} onValueChange={(v) => setFromTime(prev => ({ ...prev, minute: v }))}>
                                            <SelectTrigger className="w-16 h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <ScrollArea className="h-48">
                                                    {minutes.map(m => (
                                                        <SelectItem key={m} value={m}>{m}</SelectItem>
                                                    ))}
                                                </ScrollArea>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                
                                <div className="flex-1">
                                    <label htmlFor="to-hour" className="text-xs text-muted-foreground mb-1 block">Hasta</label>
                                    <div className="flex gap-1">
                                        <Select value={toTime.hour} onValueChange={(v) => setToTime(prev => ({ ...prev, hour: v }))}>
                                            <SelectTrigger id="to-hour" className="w-16 h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <ScrollArea className="h-48">
                                                    {hours.map(h => (
                                                        <SelectItem key={h} value={h}>{h}</SelectItem>
                                                    ))}
                                                </ScrollArea>
                                            </SelectContent>
                                        </Select>
                                        <span className="self-center text-muted-foreground">:</span>
                                        <Select value={toTime.minute} onValueChange={(v) => setToTime(prev => ({ ...prev, minute: v }))}>
                                            <SelectTrigger className="w-16 h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <ScrollArea className="h-48">
                                                    {minutes.map(m => (
                                                        <SelectItem key={m} value={m}>{m}</SelectItem>
                                                    ))}
                                                </ScrollArea>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

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
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
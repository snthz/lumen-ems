import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {TIME_RANGE_OPTIONS} from "@/features/telemetry/constants/telemetry.intervals";


interface TimeRangeSelectorProps {
    value: string
    onChange: (value: string) => void
    disabled: boolean
}

export function TimeRangeSelector({ value, onChange, disabled }: TimeRangeSelectorProps) {
    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className="flex-1 border-0 shadow-none cursor-pointer text-center flex justify-center hover:bg-neutral-50 [&>svg]:hidden">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {TIME_RANGE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
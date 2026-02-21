import {TimeRangeKey} from "@/features/telemetry/telemetry.types";

const RESOLUTION_OPTIONS = [
    { value: 120, label: '2 min' },
    { value: 900, label: '15 min' },
    { value: 1800, label: '30 min' },
    { value: 3600, label: '1 hora' },
    { value: 21600, label: '6 horas' },
    { value: 86400, label: '1 día' },
]
export const TIME_RANGE_OPTIONS: { value: TimeRangeKey | 'custom'; label: string }[] = [
    { value: '1d', label: 'Hoy' },
    { value: '2d', label: 'Ayer' },
    { value: '1w', label: 'Esta semana' },
    { value: '2w', label: 'Semana pasada' },
    { value: '1m', label: 'Este mes' },
    { value: '2m', label: 'Mes pasado' },
    { value: '3m', label: 'Últimos 3 meses' },
    { value: '6m', label: 'Últimos 6 meses' },
    { value: '1y', label: 'Este año' },
    { value: 'custom', label: 'Personalizado' },
]
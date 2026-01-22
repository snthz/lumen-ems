import { TelemetryGroup } from '@/features/telemetry/telemetry.types'

export const TELEMETRY_GROUPS: TelemetryGroup[] = [
    // ───────── POWER ─────────
    {
        id: 'system_power',
        label: 'Potencia total',
        keys: 'P',
        unit: 'W',
        phaseScope: 'SYSTEM',
        category: 'POWER',
        chartType: 'line',
        agg: 'AVG',
        favorite: true,
    },
    {
        id: 'phase_power',
        label: 'Potencia por fase',
        keys: 'P1,P2,P3',
        unit: 'W',
        phaseScope: 'PHASE',
        category: 'POWER',
        chartType: 'line',
        agg: 'AVG',
        favorite: true,
    },

    // ───────── ENERGY ─────────
    {
        id: 'system_energy',
        label: 'Energía total',
        keys: 'Edelta',
        unit: 'Wh',
        phaseScope: 'SYSTEM',
        category: 'ENERGY',
        chartType: 'bar',
        agg: 'SUM',
        favorite: true,
    },
    {
        id: 'phase_energy',
        label: 'Energía por fase',
        keys: 'E1delta,E2delta,E3delta',
        unit: 'Wh',
        phaseScope: 'PHASE',
        category: 'ENERGY',
        chartType: 'bar',
        agg: 'SUM',
        favorite: true,
    },

    // ───────── VOLTAGE ─────────
    {
        id: 'phase_voltage',
        label: 'Voltaje por fase',
        keys: 'V1,V2,V3',
        unit: 'V',
        phaseScope: 'PHASE',
        category: 'VOLTAGE',
        chartType: 'line',
        agg: 'AVG',
        favorite: false,
    },

    // ───────── CURRENT ─────────
    {
        id: 'phase_current',
        label: 'Corriente por fase',
        keys: 'I1,I2,I3',
        unit: 'A',
        phaseScope: 'PHASE',
        category: 'CURRENT',
        chartType: 'line',
        agg: 'AVG',
        favorite: false,
    },

    // ───────── FREQUENCY ─────────
    {
        id: 'frequency',
        label: 'Frecuencia',
        keys: 'F',
        unit: 'Hz',
        phaseScope: 'SYSTEM',
        category: 'FREQUENCY',
        chartType: 'line',
        agg: 'AVG',
        favorite: false,
    },

    // ───────── POWER FACTOR ─────────
    {
        id: 'power_factor',
        label: 'Factor de potencia',
        keys: 'PF,PF1,PF2,PF3',
        unit: '',
        phaseScope: 'PHASE',
        category: 'POWER_FACTOR',
        chartType: 'line',
        agg: 'AVG',
        favorite: false,
    },
]

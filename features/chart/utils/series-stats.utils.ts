export interface SeriesStats {
    name: string
    colorKey: string
    unit: string
    total: number | null
    max: number
    min: number
    avg: number
    count: number
}

const ENERGY_UNITS = new Set(['Wh', 'kWh', 'MWh', 'varh', 'kvarh', 'Mvarh', 'VAh', 'kVAh', 'MVAh'])

export function computeSeriesStats(
    name: string,
    colorKey: string,
    unit: string,
    values: number[]
): SeriesStats {
    if (values.length === 0) {
        return { name, colorKey, unit, total: null, max: 0, min: 0, avg: 0, count: 0 }
    }

    const sum = values.reduce((a, b) => a + b, 0)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const avg = sum / values.length
    const isEnergy = ENERGY_UNITS.has(unit)

    return {
        name,
        colorKey,
        unit,
        total: isEnergy ? sum : null,
        max,
        min,
        avg,
        count: values.length,
    }
}

export function autoScaleValue(
    value: number,
    unit: string
): { value: number; unit: string } {
    const absVal = Math.abs(value)

    if (unit === 'W') {
        if (absVal >= 1_000_000) return { value: value / 1_000_000, unit: 'MW' }
        if (absVal >= 1_000) return { value: value / 1_000, unit: 'kW' }
        return { value, unit: 'W' }
    }

    if (unit === 'Wh') {
        if (absVal >= 1_000_000) return { value: value / 1_000_000, unit: 'MWh' }
        if (absVal >= 1_000) return { value: value / 1_000, unit: 'kWh' }
        return { value, unit: 'Wh' }
    }

    if (unit === 'var') {
        if (absVal >= 1_000_000) return { value: value / 1_000_000, unit: 'Mvar' }
        if (absVal >= 1_000) return { value: value / 1_000, unit: 'kvar' }
        return { value, unit: 'var' }
    }

    if (unit === 'varh') {
        if (absVal >= 1_000_000) return { value: value / 1_000_000, unit: 'Mvarh' }
        if (absVal >= 1_000) return { value: value / 1_000, unit: 'kvarh' }
        return { value, unit: 'varh' }
    }

    if (unit === 'VA') {
        if (absVal >= 1_000_000) return { value: value / 1_000_000, unit: 'MVA' }
        if (absVal >= 1_000) return { value: value / 1_000, unit: 'kVA' }
        return { value, unit: 'VA' }
    }

    if (unit === 'VAh') {
        if (absVal >= 1_000_000) return { value: value / 1_000_000, unit: 'MVAh' }
        if (absVal >= 1_000) return { value: value / 1_000, unit: 'kVAh' }
        return { value, unit: 'VAh' }
    }

    return { value, unit }
}

export function formatStatValue(value: number, unit: string): string {
    const scaled = autoScaleValue(value, unit)
    return `${scaled.value.toLocaleString('es-ES', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })} ${scaled.unit}`
}

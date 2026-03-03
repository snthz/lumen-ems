export interface SeriesStats {
    name: string
    colorKey: string
    chartType: 'bar' | 'line'
    unit: string
    total: number | null
    max: number
    min: number
    avg: number
    count: number
}

export type EnergyUnit = 'auto' | 'kWh' | 'MWh'

const ENERGY_UNITS = new Set(['Wh', 'kWh', 'MWh', 'varh', 'kvarh', 'Mvarh', 'VAh', 'kVAh', 'MVAh'])

function isEnergyUnit(unit: string): boolean {
    return unit === 'Wh' || unit === 'varh' || unit === 'VAh'
}

function getEnergyScaleFactor(energyUnit: EnergyUnit, values: number[]): { factor: number; suffix: string } {
    if (energyUnit === 'kWh') {
        return { factor: 1_000, suffix: 'k' }
    }
    if (energyUnit === 'MWh') {
        return { factor: 1_000_000, suffix: 'M' }
    }
    
    // Auto mode
    const maxValue = Math.max(...values.map(Math.abs))
    if (maxValue >= 1_000_000) {
        return { factor: 1_000_000, suffix: 'M' }
    }
    if (maxValue >= 1_000) {
        return { factor: 1_000, suffix: 'k' }
    }
    return { factor: 1, suffix: '' }
}

function scaleEnergyUnit(unit: string, suffix: string): string {
    if (suffix === '') return unit
    return suffix + unit
}

export function computeSeriesStats(
    name: string,
    colorKey: string,
    unit: string,
    values: number[],
    energyUnit: EnergyUnit = 'auto',
    chartType: 'bar' | 'line' = 'bar'
): SeriesStats {
    if (values.length === 0) {
        return { name, colorKey, chartType, unit, total: null, max: 0, min: 0, avg: 0, count: 0 }
    }

    const isEnergy = isEnergyUnit(unit)
    let scaleFactor = 1
    let scaledUnit = unit

    // Apply energy scaling if it's an energy unit
    if (isEnergy) {
        const scale = getEnergyScaleFactor(energyUnit, values)
        scaleFactor = scale.factor
        scaledUnit = scaleEnergyUnit(unit, scale.suffix)
    }

    const sum = values.reduce((a, b) => a + b, 0)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const avg = sum / values.length

    return {
        name,
        colorKey,
        chartType,
        unit: scaledUnit,
        total: isEnergy ? sum / scaleFactor : null,
        max: max / scaleFactor,
        min: min / scaleFactor,
        avg: avg / scaleFactor,
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
    // Don't auto-scale if unit already has a prefix (k or M)
    const hasPrefix = unit.startsWith('k') || unit.startsWith('M')
    
    if (hasPrefix) {
        return `${value.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })} ${unit}`
    }

    const scaled = autoScaleValue(value, unit)
    return `${scaled.value.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })} ${scaled.unit}`
}

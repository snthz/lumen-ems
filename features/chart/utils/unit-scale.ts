export type UnitScale = {
    unit: string
    factor: number
}

const POWER_SCALES: UnitScale[] = [
    { unit: "W", factor: 1 },
    { unit: "kW", factor: 1_000 },
    { unit: "MW", factor: 1_000_000 },
]

const ENERGY_SCALES: UnitScale[] = [
    { unit: "Wh", factor: 1 },
    { unit: "kWh", factor: 1_000 },
    { unit: "MWh", factor: 1_000_000 },
]

export function resolveAutoScale(
    baseUnit: string,
    values: number[]
): UnitScale {
    const max = Math.max(...values.map(v => Math.abs(v)))

    const scales =
        baseUnit === "W"
            ? POWER_SCALES
            : baseUnit === "Wh"
                ? ENERGY_SCALES
                : [{ unit: baseUnit, factor: 1 }]

    let chosen = scales[0]

    for (const scale of scales) {
        if (max / scale.factor >= 1) {
            chosen = scale
        }
    }

    return chosen
}

export function resolveAxisScale(
    unit: string,
    values: number[]
) {
    const max = Math.max(...values.map(v => Math.abs(v)))

    if (unit === "W") {
        if (max >= 1_000_000) return { axisKey: "POWER_MW", unit: "MW", factor: 1_000_000 }
        if (max >= 1_000) return { axisKey: "POWER_KW", unit: "kW", factor: 1_000 }
        return { axisKey: "POWER_W", unit: "W", factor: 1 }
    }

    if (unit === "Wh") {
        if (max >= 1_000_000) return { axisKey: "ENERGY_MWh", unit: "MWh", factor: 1_000_000 }
        if (max >= 1_000) return { axisKey: "ENERGY_kWh", unit: "kWh", factor: 1_000 }
        return { axisKey: "ENERGY_Wh", unit: "Wh", factor: 1 }
    }

    return { axisKey: unit, unit, factor: 1 }
}
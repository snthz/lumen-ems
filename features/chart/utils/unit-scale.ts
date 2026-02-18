export function resolveAxisScale(
    unit: string
) {
    if (unit === 'var') {
        return { axisKey: 'REACTIVE_POWER', unit: 'var', factor: 1 }
    }

    if (unit === 'VA') {
        return { axisKey: 'APPARENT_POWER', unit: 'VA', factor: 1 }
    }

    return { axisKey: unit, unit, factor: 1 }
}
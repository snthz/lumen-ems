/**
 * Bar palette – saturated, solid fills that work well as column backgrounds.
 */
const BAR_PALETTE = [
    "#D7476E", // vibrant red
    "#5E6FB6", // vibrant indigo
    "#4AB5A5", // vibrant teal

    "#CD88C4", // soft purple
    "#D54E35", // vibrant orange
    "#51BC7C", // vibrant green

    "#A85735", // warm brown
    "#D69B37", // warm gold
    "#AA5671", // warm pink

    "#9A82E4", // pastel indigo
    "#5EA5DB", // pastel blue
    "#5DB645", // pastel green

    "#6A59C7", // deep purple
    "#E4916F", // deep orange
    "#88722F", // deep gold

    "#D69B37", // deep yellow
    "#D7476E", // deep red
    "#487939", // deep green

    "#C3566F", // muted red
    "#5E6FAE", // muted indigo
    "#6DB3A2", // muted teal

    "#9C4F64", // darker red
    "#4F5E9E", // darker indigo
    "#4E9A89", // darker teal

    "#D07C8E", // lighter red
    "#7C8BC7", // lighter indigo
    "#8CCBBE", // lighter teal

    "#8B3E52", // deep red
    "#3E4B87", // deep indigo
    "#2F7F6E", // deep teal
]

/**
 * Line palette – bright / high-contrast colours chosen to stay visible
 * even when they overlap with bar fills from BAR_PALETTE.
 */
const LINE_PALETTE = [
    "#FFD600", // bright yellow
    "#00E5FF", // cyan
    "#FF3D00", // bright orange-red
    "#76FF03", // lime green
    "#E040FB", // magenta
    "#FFAB00", // amber
    "#00B0FF", // vivid sky-blue
    "#FF6D00", // deep orange
    "#1DE9B6", // bright mint
    "#D500F9", // vivid purple
    "#AEEA00", // yellow-green
    "#FF1744", // bright red
    "#00E676", // neon green
    "#2979FF", // strong blue
    "#F50057", // pink
    "#00BFA5", // strong teal
    "#FFC400", // golden yellow
    "#651FFF", // vivid violet
    "#64DD17", // light green
    "#304FFE", // electric indigo
]

export type ChartType = "bar" | "line"

const barColorMap  = new Map<string, string>()
const lineColorMap = new Map<string, string>()
let barColorIndex  = 0
let lineColorIndex = 0

export function getSeriesColor(key: string, chartType: ChartType = "bar"): string {
    const map     = chartType === "line" ? lineColorMap : barColorMap
    const palette = chartType === "line" ? LINE_PALETTE : BAR_PALETTE

    if (map.has(key)) {
        return map.get(key)!
    }

    const idx = chartType === "line" ? lineColorIndex : barColorIndex
    const hex = palette[idx % palette.length]
    map.set(key, hex)

    if (chartType === "line") lineColorIndex++
    else barColorIndex++

    return hex
}

export function getSeriesHex(key: string, chartType: ChartType = "bar"): string {
    if (chartType === "line" ? !lineColorMap.has(key) : !barColorMap.has(key)) {
        getSeriesColor(key, chartType)
    }
    return (chartType === "line" ? lineColorMap : barColorMap).get(key)!
}

function resetSeriesColors(): void {
    barColorMap.clear()
    lineColorMap.clear()
    barColorIndex = 0
    lineColorIndex = 0
}
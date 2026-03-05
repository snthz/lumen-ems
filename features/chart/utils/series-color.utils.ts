/**
 * Bar palette – even colour-groups from the original shared palette.
 */
const BAR_PALETTE = [
    "#D7476E", // vibrant red
    "#5E6FB6", // vibrant indigo
    "#4AB5A5", // vibrant teal

    "#A85735", // warm brown
    "#D69B37", // warm gold
    "#AA5671", // warm pink

    "#6A59C7", // deep purple
    "#E4916F", // deep orange
    "#88722F", // deep gold

    "#C3566F", // muted red
    "#5E6FAE", // muted indigo
    "#6DB3A2", // muted teal

    "#D07C8E", // lighter red
    "#7C8BC7", // lighter indigo
    "#8CCBBE", // lighter teal
]

/**
 * Line palette – odd colour-groups from the original shared palette,
 * guaranteed not to overlap with BAR_PALETTE.
 */
const LINE_PALETTE = [
    "#CD88C4", // soft purple
    "#D54E35", // vibrant orange
    "#51BC7C", // vibrant green

    "#9A82E4", // pastel indigo
    "#5EA5DB", // pastel blue
    "#5DB645", // pastel green

    "#D69B37", // deep yellow
    "#D7476E", // deep red
    "#487939", // deep green

    "#9C4F64", // darker red
    "#4F5E9E", // darker indigo
    "#4E9A89", // darker teal

    "#8B3E52", // deep red
    "#3E4B87", // deep indigo
    "#2F7F6E", // deep teal
]

/**
 * Comparison bar palette – desaturated / muted versions that contrast
 * with the primary BAR_PALETTE.
 */
const COMP_BAR_PALETTE = [
    "#F2A0B3", // soft pink (vs #D7476E)
    "#9DAAD8", // soft lavender (vs #5E6FB6)
    "#8DD8CC", // soft mint (vs #4AB5A5)

    "#D4976E", // soft tan (vs #A85735)
    "#ECC97A", // soft gold (vs #D69B37)
    "#D49BA8", // soft rose (vs #AA5671)

    "#A897E0", // soft violet (vs #6A59C7)
    "#F0BDA4", // soft peach (vs #E4916F)
    "#BDA86E", // soft khaki (vs #88722F)

    "#E09AAA", // light rose (vs #C3566F)
    "#9DAAD6", // light periwinkle (vs #5E6FAE)
    "#A3D4C4", // light sage (vs #6DB3A2)

    "#E8B5C2", // pale pink (vs #D07C8E)
    "#B0BDD8", // pale blue (vs #7C8BC7)
    "#B5DECE", // pale teal (vs #8CCBBE)
]

/**
 * Comparison line palette – lighter / different hues that contrast
 * with the primary LINE_PALETTE.
 */
const COMP_LINE_PALETTE = [
    "#E4B8DA", // light lilac (vs #CD88C4)
    "#F09A7C", // light salmon (vs #D54E35)
    "#8ADA9F", // light mint (vs #51BC7C)

    "#C0AAF0", // light lavender (vs #9A82E4)
    "#96C8E8", // light sky (vs #5EA5DB)
    "#96D47E", // light lime (vs #5DB645)

    "#ECC97A", // light gold (vs #D69B37)
    "#F2A0B3", // light pink (vs #D7476E)
    "#7FAF6E", // light forest (vs #487939)

    "#C98898", // dusty rose (vs #9C4F64)
    "#8896C8", // dusty blue (vs #4F5E9E)
    "#84C4B0", // dusty teal (vs #4E9A89)

    "#B87888", // mauve (vs #8B3E52)
    "#7484B6", // steel blue (vs #3E4B87)
    "#68B09C", // jade (vs #2F7F6E)
]

export type ChartType = "bar" | "line"

const barColorMap  = new Map<string, string>()
const lineColorMap = new Map<string, string>()
let barColorIndex  = 0
let lineColorIndex = 0

const compBarColorMap  = new Map<string, string>()
const compLineColorMap = new Map<string, string>()
let compBarColorIndex  = 0
let compLineColorIndex = 0

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

/**
 * Return a colour for a **comparison** series. Uses separate palettes that
 * contrast with the primary bar / line colours.
 */
export function getComparisonColor(key: string, chartType: ChartType = "bar"): string {
    const map     = chartType === "line" ? compLineColorMap : compBarColorMap
    const palette = chartType === "line" ? COMP_LINE_PALETTE : COMP_BAR_PALETTE

    if (map.has(key)) {
        return map.get(key)!
    }

    const idx = chartType === "line" ? compLineColorIndex : compBarColorIndex
    const hex = palette[idx % palette.length]
    map.set(key, hex)

    if (chartType === "line") compLineColorIndex++
    else compBarColorIndex++

    return hex
}

function resetSeriesColors(): void {
    barColorMap.clear()
    lineColorMap.clear()
    compBarColorMap.clear()
    compLineColorMap.clear()
    barColorIndex = 0
    lineColorIndex = 0
    compBarColorIndex = 0
    compLineColorIndex = 0
}
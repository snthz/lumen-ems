import * as am4core from "@amcharts/amcharts4/core"
const PALETTE = [
    "#2563eb", // blue-600
    "#16a34a", // green-600
    "#dc2626", // red-600
    "#9333ea", // purple-600
    "#ea580c", // orange-600
    "#0d9488", // teal-600
]

export function getSeriesColor(
    key: string
) {
    let hash = 0
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % PALETTE.length
    return am4core.color(PALETTE[index])
}

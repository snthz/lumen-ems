const PALETTE = [
    "#D7476E", // vibrant red / ct0
    "#5E6FB6", // vibrant indigo / ct1
    "#4AB5A5", // vibrant teal / ct2

    "#CD88C4", // soft purple / ct3
    "#D54E35", // vibrant orange / ct4
    "#51BC7C", // vibrant green / ct5

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

    "#C3566F", // muted red / ct1
    "#5E6FAE", // muted indigo / ct2
    "#6DB3A2", // muted teal / ct3

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


const colorMap = new Map<string, string>()
let colorIndex = 0

export function getSeriesColor(key: string): string {
    if (colorMap.has(key)) {
        return colorMap.get(key)!
    }
    
    const hex = PALETTE[colorIndex % PALETTE.length]
    colorMap.set(key, hex)
    colorIndex++
    
    return hex
}

export function getSeriesHex(key: string): string {
    if (!colorMap.has(key)) {
        getSeriesColor(key)
    }
    return colorMap.get(key)!
}

function resetSeriesColors(): void {
    colorMap.clear()
    colorIndex = 0
}
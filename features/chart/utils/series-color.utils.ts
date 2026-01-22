import * as am4core from "@amcharts/amcharts4/core"
const PALETTE = [
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

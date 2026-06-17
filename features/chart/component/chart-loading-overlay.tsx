"use client"

import { useEffect, useState } from "react"
import { useChartStore } from "@/features/chart/store/chart.store"

// Rotated while loading to make the wait feel alive.
const LOADING_MESSAGES = [
    "Preparando datos…",
    "Cargando telemetría…",
    "Procesando series…",
    "Agregando intervalos…",
    "Casi listo…",
]

/**
 * Overlay shown on top of the chart while telemetry is loading.
 *
 * The real fetch can't report granular progress, so the percentage is
 * simulated: it eases toward 90% while loading and snaps to 100% on completion
 * before fading out. The status text rotates through LOADING_MESSAGES. The bar
 * uses the brand primary color (--primary, set by the branding provider).
 */
export function ChartLoadingOverlay() {
    const loading = useChartStore(state => state.loading)
    const [progress, setProgress] = useState(0)
    const [visible, setVisible] = useState(false)
    const [messageIndex, setMessageIndex] = useState(0)

    useEffect(() => {
        if (loading) {
            setVisible(true)
            setMessageIndex(0)
            setProgress(prev => (prev > 0 && prev < 90 ? prev : 8))

            const progressTimer = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) return prev
                    // Ease out: larger steps early, slowing as it nears 90%.
                    const step = Math.max(0.5, (90 - prev) * 0.08)
                    return Math.min(90, prev + step)
                })
            }, 200)

            const messageTimer = setInterval(() => {
                setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length)
            }, 1600)

            return () => {
                clearInterval(progressTimer)
                clearInterval(messageTimer)
            }
        }

        // Finished: snap to 100%, then fade the overlay away.
        setProgress(prev => (prev > 0 ? 100 : 0))
        const hideTimeout = setTimeout(() => {
            setVisible(false)
            setProgress(0)
        }, 450)

        return () => clearTimeout(hideTimeout)
    }, [loading])

    if (!visible) return null

    return (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-white/70 backdrop-blur-[2px]">
            <div className="w-64 max-w-[70%]">
                <div className="mb-1.5 flex items-center justify-between text-xs text-neutral-500">
                    <span>{LOADING_MESSAGES[messageIndex]}</span>
                    <span className="tabular-nums font-medium text-neutral-700">
                        {Math.round(progress)}%
                    </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                    <div
                        className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    )
}

"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { DEFAULT_BRANDING, toBranding, type BrandingSettings } from "@/lib/branding/branding.defaults"

// ─── Hex → oklch helper ────────────────────────────────
function hexToOklch(hex: string): string | null {
    const m = hex.match(/^#?([0-9a-f]{6})$/i)
    if (!m) return null
    const r = parseInt(m[1].slice(0, 2), 16) / 255
    const g = parseInt(m[1].slice(2, 4), 16) / 255
    const b = parseInt(m[1].slice(4, 6), 16) / 255
    // sRGB → linear
    const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))
    const rl = lin(r), gl = lin(g), bl = lin(b)
    // linear sRGB → OKLab via LMS
    const l_ = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl
    const m_ = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl
    const s_ = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl
    const l1 = Math.cbrt(l_), m1 = Math.cbrt(m_), s1 = Math.cbrt(s_)
    const L = 0.2104542553 * l1 + 0.7936177850 * m1 - 0.0040720468 * s1
    const a = 1.9779984951 * l1 - 2.4285922050 * m1 + 0.4505937099 * s1
    const bk = 0.0259040371 * l1 + 0.7827717662 * m1 - 0.8086757660 * s1
    const C = Math.sqrt(a * a + bk * bk)
    const H = (Math.atan2(bk, a) * 180) / Math.PI
    return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H < 0 ? H + 360 : H})`
}

interface BrandingContextValue {
    branding: BrandingSettings
    loading: boolean
    refresh: () => Promise<void>
}

const BrandingContext = createContext<BrandingContextValue>({
    branding: toBranding({}),
    loading: true,
    refresh: async () => {},
})

export function useBranding() {
    return useContext(BrandingContext)
}

export function BrandingProvider({ children, initial }: { children: React.ReactNode; initial?: Record<string, string> }) {
    const [raw, setRaw] = useState<Record<string, string>>(initial ?? {})
    const [loading, setLoading] = useState(!initial)

    const refresh = useCallback(async () => {
        try {
            const res = await fetch("/api/settings")
            if (res.ok) {
                const data = await res.json()
                // Handle both old { key: val } and new { settings, envDefaults } shapes
                setRaw(data.settings ?? data)
            }
        } catch {
            // Use defaults silently
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!initial) refresh()
    }, [initial, refresh])

    const branding = toBranding(raw)

    // ─── Apply CSS variables + favicon when branding changes ───
    useEffect(() => {
        const root = document.documentElement

        // Primary color → --primary, --sidebar-primary
        if (branding.primaryColor) {
            const oklch = hexToOklch(branding.primaryColor)
            if (oklch) {
                root.style.setProperty("--primary", oklch)
                root.style.setProperty("--sidebar-primary", oklch)
            }
        }

        // Accent color → --accent
        if (branding.accentColor) {
            const oklch = hexToOklch(branding.accentColor)
            if (oklch) {
                root.style.setProperty("--accent", oklch)
            }
        }

        // Favicon
        if (branding.faviconUrl) {
            let link = document.querySelector<HTMLLinkElement>("link[rel='icon']")
            if (!link) {
                link = document.createElement("link")
                link.rel = "icon"
                document.head.appendChild(link)
            }
            link.href = branding.faviconUrl
        }
    }, [branding.primaryColor, branding.accentColor, branding.faviconUrl])

    return (
        <BrandingContext.Provider value={{ branding, loading, refresh }}>
            {children}
        </BrandingContext.Provider>
    )
}

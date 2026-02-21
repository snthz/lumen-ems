"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { DEFAULT_BRANDING, toBranding, type BrandingSettings } from "@/lib/branding/branding.defaults"

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
                setRaw(data)
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

    return (
        <BrandingContext.Provider value={{ branding, loading, refresh }}>
            {children}
        </BrandingContext.Provider>
    )
}

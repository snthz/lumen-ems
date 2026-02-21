/** Default branding values used when no DB is configured */
export const DEFAULT_BRANDING = {
    // General
    "brand.appName": "Lumen",
    "brand.appSubtitle": "EMS",
    "brand.pageTitle": "Lumen EMS",

    // Colors
    "brand.primaryColor": "#3b82f6",
    "brand.accentColor": "#f43f5e",

    // Images — relative paths to public/ defaults
    "brand.sidebarLogoUrl": "/brand/lumen-logo.svg",
    "brand.loginLogoUrl": "/images/lumen-ems.png",
    "brand.loginBgUrl": "/images/auth-page-image.jpg",
    "brand.faviconUrl": "",
} as const

export type BrandingKey = keyof typeof DEFAULT_BRANDING

export interface BrandingSettings {
    appName: string
    appSubtitle: string
    pageTitle: string
    primaryColor: string
    accentColor: string
    sidebarLogoUrl: string
    loginLogoUrl: string
    loginBgUrl: string
    faviconUrl: string
}

export function toBranding(raw: Record<string, string>): BrandingSettings {
    const g = (key: BrandingKey) => raw[key] || DEFAULT_BRANDING[key]
    return {
        appName: g("brand.appName"),
        appSubtitle: g("brand.appSubtitle"),
        pageTitle: g("brand.pageTitle"),
        primaryColor: g("brand.primaryColor"),
        accentColor: g("brand.accentColor"),
        sidebarLogoUrl: g("brand.sidebarLogoUrl"),
        loginLogoUrl: g("brand.loginLogoUrl"),
        loginBgUrl: g("brand.loginBgUrl"),
        faviconUrl: g("brand.faviconUrl"),
    }
}

"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"
import { toast } from "sonner"
import { useBranding } from "@/lib/branding/branding.provider"
import { DEFAULT_BRANDING } from "@/lib/branding/branding.defaults"
import { useSessionStore } from "@/lib/auth/store/session.store"
import { useRouter } from "next/navigation"
import {
    Save,
    Upload,
    RotateCcw,
    Database,
    FolderOpen,
    Paintbrush,
    Settings,
    ImageIcon,
    X,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────

interface BrandForm {
    "brand.appName": string
    "brand.appSubtitle": string
    "brand.pageTitle": string
    "brand.primaryColor": string
    "brand.accentColor": string
    "brand.sidebarLogoUrl": string
    "brand.loginLogoUrl": string
    "brand.loginBgUrl": string
    "brand.faviconUrl": string
}

interface GeneralForm {
    "config.tbApi": string
    "config.industriesGroupId": string
    "config.billingGroupId": string
    "config.multisiteGroupId": string
}

const DEFAULT_GENERAL: GeneralForm = {
    "config.tbApi": "",
    "config.industriesGroupId": "",
    "config.billingGroupId": "",
    "config.multisiteGroupId": "",
}

// ─── Color Picker Input ──────────────────────────────────

function ColorPickerInput({
    label,
    value,
    onChange,
}: {
    label: string
    value: string
    onChange: (v: string) => void
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
                {label}
            </Label>
            <InputGroup>
                <InputGroupAddon align="inline-start">
                    <label className="cursor-pointer relative block size-5 rounded-sm overflow-hidden border border-border">
                        <input
                            type="color"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <span
                            className="block size-full rounded-sm"
                            style={{ backgroundColor: value }}
                        />
                    </label>
                </InputGroupAddon>
                <InputGroupInput
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#000000"
                    className="font-mono text-xs"
                />
            </InputGroup>
        </div>
    )
}

// ─── Image Upload Card ───────────────────────────────────

function ImageUploadCard({
    label,
    description,
    value,
    settingKey,
    onChange,
    aspectRatio,
}: {
    label: string
    description?: string
    value: string
    settingKey: string
    onChange: (key: string, url: string) => void
    aspectRatio?: "square" | "wide" | "banner"
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)

    const previewSize = {
        square: "h-20 w-20",
        wide: "h-20 w-40",
        banner: "h-24 w-full max-w-xs",
    }[aspectRatio ?? "square"]

    async function handleFile(file: File) {
        setUploading(true)
        try {
            const form = new FormData()
            form.set("file", file)
            form.set("id", settingKey.replace(/\./g, "-"))
            const res = await fetch("/api/files", { method: "POST", body: form })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Upload failed")
            }
            const { id } = await res.json()
            onChange(settingKey, `/api/files/${id}`)
            toast.success("Imagen subida")
        } catch (err: any) {
            toast.error(err.message || "Error al subir imagen")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium">{label}</p>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {description}
                        </p>
                    )}
                </div>
                <div className="flex gap-1.5">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={uploading}
                        onClick={() => inputRef.current?.click()}
                        className="h-7 text-xs"
                    >
                        <Upload className="size-3 mr-1" />
                        {uploading ? "Subiendo…" : "Subir"}
                    </Button>
                    {value && value !== DEFAULT_BRANDING[settingKey as keyof typeof DEFAULT_BRANDING] && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-muted-foreground"
                            onClick={() =>
                                onChange(
                                    settingKey,
                                    DEFAULT_BRANDING[settingKey as keyof typeof DEFAULT_BRANDING] ?? ""
                                )
                            }
                        >
                            <X className="size-3" />
                        </Button>
                    )}
                </div>
            </div>

            {value ? (
                <div
                    className={`relative ${previewSize} rounded-md border bg-muted/50 overflow-hidden`}
                >
                    <Image
                        src={value}
                        alt={label}
                        fill
                        className="object-contain p-1.5"
                        unoptimized
                    />
                </div>
            ) : (
                <div
                    className={`${previewSize} rounded-md border border-dashed bg-muted/30 flex items-center justify-center cursor-pointer`}
                    onClick={() => inputRef.current?.click()}
                >
                    <ImageIcon className="size-5 text-muted-foreground/50" />
                </div>
            )}

            <Input
                value={value}
                onChange={(e) => onChange(settingKey, e.target.value)}
                placeholder="URL o sube una imagen"
                className="text-xs h-7"
            />

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFile(f)
                    e.target.value = ""
                }}
            />
        </div>
    )
}

// ─── Main Page ───────────────────────────────────────────

export default function SettingsPage() {
    const { refresh } = useBranding()
    const router = useRouter()
    const user = useSessionStore((s) => s.user)
    const isTenantAdmin = user?.scopes?.includes("TENANT_ADMIN")
    const [brandForm, setBrandForm] = useState<BrandForm | null>(null)
    const [generalForm, setGeneralForm] = useState<GeneralForm | null>(null)
    const [initialBrand, setInitialBrand] = useState<BrandForm | null>(null)
    const [initialGeneral, setInitialGeneral] = useState<GeneralForm | null>(null)
    const [saving, setSaving] = useState(false)
    const [hasDbState, setHasDbState] = useState<boolean | null>(null)

    // Load
    useEffect(() => {
        Promise.all([
            fetch("/api/settings").then((r) => r.json()),
            fetch("/api/health").then((r) => r.json()),
        ])
            .then(([raw, health]) => {
                const brand: BrandForm = {
                    "brand.appName":
                        raw["brand.appName"] || DEFAULT_BRANDING["brand.appName"],
                    "brand.appSubtitle":
                        raw["brand.appSubtitle"] ||
                        DEFAULT_BRANDING["brand.appSubtitle"],
                    "brand.pageTitle":
                        raw["brand.pageTitle"] || DEFAULT_BRANDING["brand.pageTitle"],
                    "brand.primaryColor":
                        raw["brand.primaryColor"] ||
                        DEFAULT_BRANDING["brand.primaryColor"],
                    "brand.accentColor":
                        raw["brand.accentColor"] ||
                        DEFAULT_BRANDING["brand.accentColor"],
                    "brand.sidebarLogoUrl":
                        raw["brand.sidebarLogoUrl"] ||
                        DEFAULT_BRANDING["brand.sidebarLogoUrl"],
                    "brand.loginLogoUrl":
                        raw["brand.loginLogoUrl"] ||
                        DEFAULT_BRANDING["brand.loginLogoUrl"],
                    "brand.loginBgUrl":
                        raw["brand.loginBgUrl"] || DEFAULT_BRANDING["brand.loginBgUrl"],
                    "brand.faviconUrl":
                        raw["brand.faviconUrl"] || DEFAULT_BRANDING["brand.faviconUrl"],
                }
                const general: GeneralForm = {
                    "config.tbApi": raw["config.tbApi"] || "",
                    "config.industriesGroupId":
                        raw["config.industriesGroupId"] || "",
                    "config.billingGroupId": raw["config.billingGroupId"] || "",
                    "config.multisiteGroupId":
                        raw["config.multisiteGroupId"] || "",
                }
                setBrandForm(brand)
                setInitialBrand(brand)
                setGeneralForm(general)
                setInitialGeneral(general)
                setHasDbState(health.database === true)
            })
            .catch(() => {
                const brand = { ...DEFAULT_BRANDING }
                setBrandForm(brand)
                setInitialBrand(brand)
                setGeneralForm({ ...DEFAULT_GENERAL })
                setInitialGeneral({ ...DEFAULT_GENERAL })
                setHasDbState(false)
            })
    }, [])

    function setBrand(key: string, value: string) {
        setBrandForm((prev) => (prev ? { ...prev, [key]: value } : prev))
    }

    function setGeneral(key: string, value: string) {
        setGeneralForm((prev) => (prev ? { ...prev, [key]: value } : prev))
    }

    // Detect changes
    const hasChanges = useMemo(() => {
        if (!brandForm || !generalForm || !initialBrand || !initialGeneral)
            return false
        return (
            JSON.stringify(brandForm) !== JSON.stringify(initialBrand) ||
            JSON.stringify(generalForm) !== JSON.stringify(initialGeneral)
        )
    }, [brandForm, generalForm, initialBrand, initialGeneral])

    async function handleSave() {
        if (!brandForm || !generalForm) return
        setSaving(true)
        try {
            const payload = { ...brandForm, ...generalForm }
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error("Failed to save")
            const updated = await res.json()
            // Snapshot new initial state
            setInitialBrand({ ...brandForm })
            setInitialGeneral({ ...generalForm })
            await refresh()
            toast.success("Configuración guardada")
        } catch {
            toast.error("Error al guardar configuración")
        } finally {
            setSaving(false)
        }
    }

    function handleReset() {
        setBrandForm(
            initialBrand ? { ...initialBrand } : { ...DEFAULT_BRANDING }
        )
        setGeneralForm(
            initialGeneral ? { ...initialGeneral } : { ...DEFAULT_GENERAL }
        )
    }

    function handleRestoreDefaults() {
        setBrandForm({ ...DEFAULT_BRANDING })
        setGeneralForm({ ...DEFAULT_GENERAL })
    }

    async function handleRunMigrations() {
        try {
            const res = await fetch("/api/setup", { method: "POST" })
            const data = await res.json()
            toast.success(data.message || "Migraciones completadas")
        } catch {
            toast.error("Error al ejecutar migraciones")
        }
    }

    if (!brandForm || !generalForm) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-48" />
                    <div className="h-4 bg-muted rounded w-96" />
                </div>
            </div>
        )
    }

    if (user && !isTenantAdmin) {
        return (
            <div className="flex flex-1 items-center justify-center p-6">
                <div className="text-center space-y-2">
                    <h2 className="text-lg font-semibold">Acceso restringido</h2>
                    <p className="text-sm text-muted-foreground">
                        Solo los administradores pueden acceder a la configuración.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative">
            {/* ── Sticky save bar ─────────────────────────────── */}
            {hasChanges && (
                <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                    <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Tienes cambios sin guardar
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                            >
                                Descartar
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                <Save className="size-3.5 mr-1.5" />
                                {saving ? "Guardando…" : "Guardar cambios"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto p-6 space-y-6 w-full">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Configuración</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Administra la configuración general y la apariencia de la
                            plataforma.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRestoreDefaults}
                        className="text-xs"
                    >
                        <RotateCcw className="size-3 mr-1.5" />
                        Valores por defecto
                    </Button>
                </div>

                {/* Storage badge */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 border">
                    {hasDbState ? (
                        <>
                            <Database className="size-3.5 text-green-600" />
                            <span>PostgreSQL conectada</span>
                        </>
                    ) : (
                        <>
                            <FolderOpen className="size-3.5 text-amber-600" />
                            <span>
                                Almacenamiento en archivos (sin base de datos)
                            </span>
                        </>
                    )}
                    {hasDbState && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto text-xs h-6"
                            onClick={handleRunMigrations}
                        >
                            Ejecutar migraciones
                        </Button>
                    )}
                </div>

                {/* ── Tabs ─────────────────────────────────────── */}
                <Tabs defaultValue="general">
                    <TabsList>
                        <TabsTrigger value="general">
                            <Settings className="size-3.5 mr-1.5" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="appearance">
                            <Paintbrush className="size-3.5 mr-1.5" />
                            Apariencia
                        </TabsTrigger>
                    </TabsList>

                    {/* ── General Tab ─────────────────────────────── */}
                    <TabsContent value="general" className="space-y-6 mt-4">
                        <section className="space-y-4">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Conexión al servidor
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Configura la URL de tu servidor ThingsBoard.
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground">
                                    ThingsBoard API URL
                                </Label>
                                <Input
                                    value={generalForm["config.tbApi"]}
                                    onChange={(e) =>
                                        setGeneral("config.tbApi", e.target.value)
                                    }
                                    placeholder="https://dashboard.example.com"
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    URL del servidor ThingsBoard (solo se usa si no hay
                                    variable de entorno TB_API)
                                </p>
                            </div>
                        </section>

                        <Separator />

                        <section className="space-y-4">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Grupos de entidades
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    IDs de los grupos de clientes de ThingsBoard. Se
                                    usarán como respaldo si no están definidos en
                                    variables de entorno.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Industries Group ID
                                    </Label>
                                    <Input
                                        value={
                                            generalForm[
                                                "config.industriesGroupId"
                                            ]
                                        }
                                        onChange={(e) =>
                                            setGeneral(
                                                "config.industriesGroupId",
                                                e.target.value
                                            )
                                        }
                                        placeholder="UUID"
                                        className="font-mono text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Billing Group ID
                                    </Label>
                                    <Input
                                        value={
                                            generalForm["config.billingGroupId"]
                                        }
                                        onChange={(e) =>
                                            setGeneral(
                                                "config.billingGroupId",
                                                e.target.value
                                            )
                                        }
                                        placeholder="UUID"
                                        className="font-mono text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Multisite Group ID
                                    </Label>
                                    <Input
                                        value={
                                            generalForm[
                                                "config.multisiteGroupId"
                                            ]
                                        }
                                        onChange={(e) =>
                                            setGeneral(
                                                "config.multisiteGroupId",
                                                e.target.value
                                            )
                                        }
                                        placeholder="UUID"
                                        className="font-mono text-xs"
                                    />
                                </div>
                            </div>
                        </section>
                    </TabsContent>

                    {/* ── Appearance Tab ──────────────────────────── */}
                    <TabsContent value="appearance" className="space-y-6 mt-4">
                        {/* Identity */}
                        <section className="space-y-4">
                            <div>
                                <h2 className="text-sm font-semibold">Identidad</h2>
                                <p className="text-xs text-muted-foreground">
                                    Nombre y título que aparece en la plataforma.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Nombre de la app
                                    </Label>
                                    <Input
                                        value={brandForm["brand.appName"]}
                                        onChange={(e) =>
                                            setBrand(
                                                "brand.appName",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Lumen"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Subtítulo
                                    </Label>
                                    <Input
                                        value={brandForm["brand.appSubtitle"]}
                                        onChange={(e) =>
                                            setBrand(
                                                "brand.appSubtitle",
                                                e.target.value
                                            )
                                        }
                                        placeholder="EMS"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground">
                                    Título de la página
                                </Label>
                                <Input
                                    value={brandForm["brand.pageTitle"]}
                                    onChange={(e) =>
                                        setBrand(
                                            "brand.pageTitle",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Lumen EMS"
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Se muestra en la pestaña del navegador
                                </p>
                            </div>
                        </section>

                        <Separator />

                        {/* Colors */}
                        <section className="space-y-4">
                            <div>
                                <h2 className="text-sm font-semibold">Colores</h2>
                                <p className="text-xs text-muted-foreground">
                                    Colores principales de la marca.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <ColorPickerInput
                                    label="Color primario"
                                    value={brandForm["brand.primaryColor"]}
                                    onChange={(v) =>
                                        setBrand("brand.primaryColor", v)
                                    }
                                />
                                <ColorPickerInput
                                    label="Color acento"
                                    value={brandForm["brand.accentColor"]}
                                    onChange={(v) =>
                                        setBrand("brand.accentColor", v)
                                    }
                                />
                            </div>
                            {/* Preview */}
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-8 rounded-md px-4 flex items-center text-white text-xs font-medium shadow-sm"
                                    style={{
                                        backgroundColor:
                                            brandForm["brand.primaryColor"],
                                    }}
                                >
                                    Primario
                                </div>
                                <div
                                    className="h-8 rounded-md px-4 flex items-center text-white text-xs font-medium shadow-sm"
                                    style={{
                                        backgroundColor:
                                            brandForm["brand.accentColor"],
                                    }}
                                >
                                    Acento
                                </div>
                            </div>
                        </section>

                        <Separator />

                        {/* Images */}
                        <section className="space-y-4">
                            <div>
                                <h2 className="text-sm font-semibold">Imágenes</h2>
                                <p className="text-xs text-muted-foreground">
                                    Logos e imágenes de la plataforma.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ImageUploadCard
                                    label="Logo del sidebar"
                                    description="Se muestra en el menú lateral"
                                    value={brandForm["brand.sidebarLogoUrl"]}
                                    settingKey="brand.sidebarLogoUrl"
                                    onChange={setBrand}
                                    aspectRatio="square"
                                />
                                <ImageUploadCard
                                    label="Logo del login"
                                    description="Logo principal en la página de inicio de sesión"
                                    value={brandForm["brand.loginLogoUrl"]}
                                    settingKey="brand.loginLogoUrl"
                                    onChange={setBrand}
                                    aspectRatio="wide"
                                />
                                <ImageUploadCard
                                    label="Fondo del login"
                                    description="Imagen decorativa de la página de inicio de sesión"
                                    value={brandForm["brand.loginBgUrl"]}
                                    settingKey="brand.loginBgUrl"
                                    onChange={setBrand}
                                    aspectRatio="banner"
                                />
                                <ImageUploadCard
                                    label="Favicon"
                                    description="Icono de la pestaña del navegador"
                                    value={brandForm["brand.faviconUrl"]}
                                    settingKey="brand.faviconUrl"
                                    onChange={setBrand}
                                    aspectRatio="square"
                                />
                            </div>
                        </section>
                    </TabsContent>
                </Tabs>

                {/* spacer for scroll past sticky bar */}
                <div className="h-8" />
            </div>
        </div>
    )
}

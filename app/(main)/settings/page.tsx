"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
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
    Activity,
    Plus,
    Trash2,
    Power,
    PowerOff,
    Pencil,
    Check,
    CircleHelp,
} from "lucide-react"
import type {
    TelemetryGroup,
    MetricGroupTag,
    MetricCategory,
    PhaseScope,
    ChartType,
    AggregationType,
} from "@/features/telemetry/telemetry.types"
import { ALL_METRIC_GROUP_TAGS } from "@/features/telemetry/telemetry.types"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"


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

const DEFAULT_HELP_MARKDOWN = `# Centro de Ayuda

## Contacto de Soporte

Para cualquier consulta o problema técnico, contacta a nuestro equipo de soporte:

- **Email:** support@lumenenergysolutions.com

## Preguntas Frecuentes

### ¿Cómo accedo a mis datos de consumo?
Desde el panel principal puedes visualizar los datos de consumo energético en tiempo real.

### ¿Cómo cambio mi contraseña?
Contacta al administrador del sistema para solicitar un cambio de contraseña.

### ¿Necesitas ayuda adicional?
No dudes en escribirnos al correo de soporte. Nuestro equipo estará encantado de ayudarte.
`


function ColorPickerInput({
    label,
    value,
    onChange,
    disabled,
}: {
    label: string
    value: string
    onChange: (v: string) => void
    disabled?: boolean
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
                {label}
            </Label>
            <InputGroup>
                <InputGroupAddon align="inline-start">
                    <label className={`${disabled ? "opacity-50 pointer-events-none" : "cursor-pointer"} relative block size-5 rounded-sm overflow-hidden border border-border`}>
                        <input
                            type="color"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            disabled={disabled}
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
                    disabled={disabled}
                    className="font-mono text-xs"
                />
            </InputGroup>
        </div>
    )
}



function ImageUploadCard({
    label,
    description,
    value,
    settingKey,
    onChange,
    aspectRatio,
    disabled,
}: {
    label: string
    description?: string
    value: string
    settingKey: string
    onChange: (key: string, url: string) => void
    aspectRatio?: "square" | "wide" | "banner"
    disabled?: boolean
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
                        disabled={uploading || disabled}
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
                            disabled={disabled}
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
                disabled={disabled}
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


const CATEGORY_OPTIONS: { value: MetricCategory; label: string }[] = [
    { value: "POWER", label: "Potencia activa" },
    { value: "REACTIVE_POWER", label: "Potencia reactiva" },
    { value: "APPARENT_POWER", label: "Potencia aparente" },
    { value: "ENERGY", label: "Energía activa" },
    { value: "REACTIVE_ENERGY", label: "Energía reactiva" },
    { value: "APPARENT_ENERGY", label: "Energía aparente" },
    { value: "ENERGY_EXPORT", label: "Energía exportada" },
    { value: "VOLTAGE", label: "Voltaje" },
    { value: "CURRENT", label: "Corriente" },
    { value: "FREQUENCY", label: "Frecuencia" },
    { value: "POWER_FACTOR", label: "Factor de potencia" },
]

const GROUP_TAG_LABELS: Record<MetricGroupTag, string> = {
    industria: "Industria",
    facturacion: "Facturación",
    multisite: "Multisitio",
}


const EMPTY_NEW_METRIC: Omit<TelemetryGroup, "id"> = {
    label: "",
    keys: "",
    unit: "",
    phaseScope: "SYSTEM",
    category: "POWER",
    chartType: "line",
    agg: "AVG",
    enabled: true,
    groups: [...ALL_METRIC_GROUP_TAGS],
    isDefault: false,
}

function NewMetricForm({
    onAdd,
    onCancel,
    defaultGroup,
}: {
    onAdd: (m: TelemetryGroup) => void
    onCancel: () => void
    defaultGroup?: MetricGroupTag
}) {
    const [form, setForm] = useState({
        ...EMPTY_NEW_METRIC,
        groups: defaultGroup ? [defaultGroup] : [...ALL_METRIC_GROUP_TAGS],
    })

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!form.label.trim() || !form.keys.trim()) {
            toast.error("El nombre y las keys son obligatorios")
            return
        }
        const id = `custom_${form.label.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`
        onAdd({ ...form, id })
    }

    return (
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Nueva métrica</h4>
                <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
                    <X className="size-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Nombre *</Label>
                    <Input
                        value={form.label}
                        onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                        placeholder="Ej: Potencia activa"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Keys (ThingsBoard) *</Label>
                    <Input
                        value={form.keys}
                        onChange={(e) => setForm((p) => ({ ...p, keys: e.target.value }))}
                        placeholder="Ej: P1,P2,P3"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Unidad</Label>
                    <Input
                        value={form.unit}
                        onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                        placeholder="Ej: W, kWh, V"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Categoría</Label>
                    <Select
                        value={form.category}
                        onValueChange={(v) => setForm((p) => ({ ...p, category: v as MetricCategory }))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORY_OPTIONS.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                    {c.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Fase</Label>
                    <Select
                        value={form.phaseScope}
                        onValueChange={(v) => setForm((p) => ({ ...p, phaseScope: v as PhaseScope }))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SYSTEM">Sistema</SelectItem>
                            <SelectItem value="PHASE">Por fase</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Tipo de gráfico</Label>
                    <Select
                        value={form.chartType}
                        onValueChange={(v) =>
                            setForm((p) => ({ ...p, chartType: v as ChartType }))
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="line">Línea</SelectItem>
                            <SelectItem value="bar">Barra</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Agregación</Label>
                    <Select
                        value={form.agg}
                        onValueChange={(v) =>
                            setForm((p) => ({
                                ...p,
                                agg: v as Exclude<AggregationType, "NONE" | "COUNT">,
                            }))
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="AVG">Promedio</SelectItem>
                            <SelectItem value="SUM">Suma</SelectItem>
                            <SelectItem value="MIN">Mínimo</SelectItem>
                            <SelectItem value="MAX">Máximo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Group checkboxes */}
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Grupos de clientes</Label>
                <div className="flex gap-4">
                    {ALL_METRIC_GROUP_TAGS.map((tag) => (
                        <label key={tag} className="flex items-center gap-2 text-sm cursor-pointer">
                            <Checkbox
                                checked={form.groups?.includes(tag) ?? false}
                                onCheckedChange={(checked) =>
                                    setForm((p) => ({
                                        ...p,
                                        groups: checked
                                            ? [...(p.groups ?? []), tag]
                                            : (p.groups ?? []).filter((g) => g !== tag),
                                    }))
                                }
                            />
                            {GROUP_TAG_LABELS[tag]}
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" size="sm">
                    <Plus className="size-3.5 mr-1.5" />
                    Agregar
                </Button>
            </div>
        </form>
    )
}



function MetricRow({
    m,
    disabled,
    onToggleEnabled,
    onEdit,
    onRemove,
}: {
    m: TelemetryGroup
    disabled: boolean
    onToggleEnabled: () => void
    onEdit: (updated: TelemetryGroup) => void
    onRemove: () => void
}) {
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState(m)

    function save() {
        onEdit(form)
        setEditing(false)
    }

    function cancel() {
        setForm(m)
        setEditing(false)
    }

    if (editing) {
        return (
            <div className="rounded-lg border px-3 py-3 space-y-3 bg-muted/30">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Nombre</Label>
                        <Input
                            className="h-8 text-xs"
                            value={form.label}
                            onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Keys</Label>
                        <Input
                            className="h-8 text-xs font-mono"
                            value={form.keys}
                            onChange={(e) => setForm((p) => ({ ...p, keys: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Unidad</Label>
                        <Input
                            className="h-8 text-xs"
                            value={form.unit}
                            onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Categoría</Label>
                        <Select
                            value={form.category}
                            onValueChange={(v) => setForm((p) => ({ ...p, category: v as MetricCategory }))}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORY_OPTIONS.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Fase</Label>
                        <Select
                            value={form.phaseScope}
                            onValueChange={(v) => setForm((p) => ({ ...p, phaseScope: v as PhaseScope }))}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SYSTEM">Sistema</SelectItem>
                                <SelectItem value="PHASE">Por fase</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Gráfico</Label>
                        <Select
                            value={form.chartType}
                            onValueChange={(v) => setForm((p) => ({ ...p, chartType: v as ChartType }))}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="line">Línea</SelectItem>
                                <SelectItem value="bar">Barra</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Agregación</Label>
                        <Select
                            value={form.agg}
                            onValueChange={(v) => setForm((p) => ({ ...p, agg: v as Exclude<AggregationType, "NONE" | "COUNT"> }))}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AVG">Promedio</SelectItem>
                                <SelectItem value="SUM">Suma</SelectItem>
                                <SelectItem value="MIN">Mínimo</SelectItem>
                                <SelectItem value="MAX">Máximo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {/* Group checkboxes */}
                <div className="flex items-center gap-4">
                    <span className="text-[10px] text-muted-foreground">Grupos:</span>
                    {ALL_METRIC_GROUP_TAGS.map((tag) => (
                        <label key={tag} className="flex items-center gap-1.5 text-xs cursor-pointer">
                            <Checkbox
                                checked={form.groups?.includes(tag) ?? false}
                                onCheckedChange={(checked) =>
                                    setForm((p) => ({
                                        ...p,
                                        groups: checked
                                            ? [...(p.groups ?? []), tag]
                                            : (p.groups ?? []).filter((g) => g !== tag),
                                    }))
                                }
                            />
                            {GROUP_TAG_LABELS[tag]}
                        </label>
                    ))}
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={cancel}>
                        Cancelar
                    </Button>
                    <Button type="button" size="sm" className="h-7 text-xs" onClick={save}>
                        <Check className="size-3 mr-1" />
                        Guardar
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors group ${
                m.enabled ? "bg-background" : "bg-muted/40 opacity-60"
            }`}
        >
            <button
                type="button"
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors disabled:pointer-events-none"
                onClick={onToggleEnabled}
                disabled={disabled}
                title={m.enabled ? "Desactivar" : "Activar"}
            >
                {m.enabled ? (
                    <Power className="size-4 text-emerald-500" />
                ) : (
                    <PowerOff className="size-4" />
                )}
            </button>

            <div className="flex-1 min-w-0">
                <span className="font-medium">{m.label}</span>
                <span className="ml-2 text-xs text-muted-foreground font-mono">{m.keys}</span>
                {m.unit && (
                    <span className="ml-1.5 text-xs text-muted-foreground">({m.unit})</span>
                )}
            </div>

            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 hidden md:inline-flex">
                {m.phaseScope === "SYSTEM" ? "SYS" : "3φ"}
            </Badge>

            {m.isDefault && (
                <span className="text-[10px] text-muted-foreground shrink-0 hidden sm:inline">default</span>
            )}

            {/* Edit */}
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={disabled}
                onClick={() => setEditing(true)}
            >
                <Pencil className="size-3.5" />
            </Button>

            {/* Delete */}
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={disabled}
                onClick={onRemove}
            >
                <Trash2 className="size-3.5" />
            </Button>
        </div>
    )
}

function MetricsTabContent({
    metrics,
    onChange,
    disabled,
    addingMetric,
    setAddingMetric,
}: {
    metrics: TelemetryGroup[]
    onChange: (m: TelemetryGroup[]) => void
    disabled: boolean
    addingMetric: boolean
    setAddingMetric: (v: boolean) => void
}) {
    const [activeGroup, setActiveGroup] = useState<MetricGroupTag>("industria")

    const toggleEnabled = useCallback(
        (id: string) => {
            onChange(
                metrics.map((m) =>
                    m.id === id ? { ...m, enabled: !m.enabled } : m
                )
            )
        },
        [metrics, onChange]
    )

    const editMetric = useCallback(
        (updated: TelemetryGroup) => {
            onChange(metrics.map((m) => (m.id === updated.id ? updated : m)))
        },
        [metrics, onChange]
    )

    const removeMetric = useCallback(
        (id: string) => {
            onChange(metrics.filter((m) => m.id !== id))
        },
        [metrics, onChange]
    )

    const addMetric = useCallback(
        (m: TelemetryGroup) => {
            onChange([...metrics, m])
            setAddingMetric(false)
        },
        [metrics, onChange, setAddingMetric]
    )

    // Filter metrics for current group tab
    const filteredMetrics = useMemo(
        () => metrics.filter((m) => m.groups?.includes(activeGroup)),
        [metrics, activeGroup]
    )

    const counts = useMemo(() => {
        const c: Record<string, number> = {}
        for (const tag of ALL_METRIC_GROUP_TAGS) {
            c[tag] = metrics.filter((m) => m.groups?.includes(tag)).length
        }
        return c
    }, [metrics])

    return (
        <div className="space-y-5">
            {/* Header */}
            <section>
                <h3 className="text-base font-semibold mb-1">Métricas de telemetría</h3>
                <p className="text-sm text-muted-foreground">
                    Configura qué métricas están disponibles y a qué grupos de clientes pertenecen.
                </p>
            </section>

            {disabled && (
                <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 flex items-center gap-2">
                    <Database className="size-4" />
                    Conecta una base de datos para configurar las métricas.
                </div>
            )}

            {/* Sub-tabs for groups */}
            <div className="flex items-center gap-1 border-b">
                {ALL_METRIC_GROUP_TAGS.map((tag) => (
                    <button
                        key={tag}
                        type="button"
                        onClick={() => setActiveGroup(tag)}
                        className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                            activeGroup === tag
                                ? "border-primary text-foreground"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {GROUP_TAG_LABELS[tag]}
                        <span className="ml-1.5 text-xs text-muted-foreground">
                            ({counts[tag] ?? 0})
                        </span>
                    </button>
                ))}
            </div>

            {/* Add metric */}
            {!disabled && (
                <div>
                    {addingMetric ? (
                        <NewMetricForm
                            onAdd={addMetric}
                            onCancel={() => setAddingMetric(false)}
                            defaultGroup={activeGroup}
                        />
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAddingMetric(true)}
                        >
                            <Plus className="size-3.5 mr-1.5" />
                            Agregar métrica
                        </Button>
                    )}
                </div>
            )}

            {/* Metric list for current group */}
            <div className="space-y-1">
                {filteredMetrics.map((m) => (
                    <MetricRow
                        key={m.id}
                        m={m}
                        disabled={disabled}
                        onToggleEnabled={() => toggleEnabled(m.id)}
                        onEdit={editMetric}
                        onRemove={() => removeMetric(m.id)}
                    />
                ))}
            </div>

            {filteredMetrics.length === 0 && !addingMetric && (
                <div className="text-sm text-muted-foreground text-center py-8">
                    No hay métricas en el grupo {GROUP_TAG_LABELS[activeGroup]}.
                </div>
            )}
        </div>
    )
}


function HelpMarkdownPreview({ content }: { content: string }) {
    if (!content.trim()) {
        return (
            <p className="text-sm text-muted-foreground italic">
                Sin contenido. Escribe algo en el editor para ver la vista previa.
            </p>
        )
    }
    return (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
        </ReactMarkdown>
    )
}



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
    const [metricsForm, setMetricsForm] = useState<TelemetryGroup[] | null>(null)
    const [initialMetrics, setInitialMetrics] = useState<TelemetryGroup[] | null>(null)
    const [addingMetric, setAddingMetric] = useState(false)
    const [envDefaults, setEnvDefaults] = useState<Record<string, string>>({})
    const [helpMarkdown, setHelpMarkdown] = useState<string>("")
    const [initialHelpMarkdown, setInitialHelpMarkdown] = useState<string>("")

    // Load
    useEffect(() => {
        Promise.all([
            fetch("/api/settings").then((r) => r.json()) as Promise<{ settings: Record<string, string>; envDefaults: Record<string, string> }>,
            fetch("/api/health").then((r) => r.json()),
            fetch("/api/metrics").then((r) => r.json()),
        ])
            .then(([settingsData, health, metrics]) => {
                const raw = settingsData.settings ?? settingsData
                setEnvDefaults(settingsData.envDefaults ?? {})
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
                setMetricsForm(Array.isArray(metrics) ? metrics : [])
                setInitialMetrics(Array.isArray(metrics) ? metrics : [])
                const helpContent = raw["help.markdown"] || DEFAULT_HELP_MARKDOWN
                setHelpMarkdown(helpContent)
                setInitialHelpMarkdown(helpContent)
            })
            .catch(() => {
                const brand = { ...DEFAULT_BRANDING }
                setBrandForm(brand)
                setInitialBrand(brand)
                setGeneralForm({ ...DEFAULT_GENERAL })
                setInitialGeneral({ ...DEFAULT_GENERAL })
                setHasDbState(false)
                setMetricsForm([])
                setInitialMetrics([])
                setHelpMarkdown(DEFAULT_HELP_MARKDOWN)
                setInitialHelpMarkdown(DEFAULT_HELP_MARKDOWN)
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
        if (!brandForm || !generalForm || !initialBrand || !initialGeneral || !metricsForm || !initialMetrics)
            return false
        return (
            JSON.stringify(brandForm) !== JSON.stringify(initialBrand) ||
            JSON.stringify(generalForm) !== JSON.stringify(initialGeneral) ||
            JSON.stringify(metricsForm) !== JSON.stringify(initialMetrics) ||
            helpMarkdown !== initialHelpMarkdown
        )
    }, [brandForm, generalForm, initialBrand, initialGeneral, metricsForm, initialMetrics, helpMarkdown, initialHelpMarkdown])

    async function handleSave() {
        if (!brandForm || !generalForm || !metricsForm) return
        setSaving(true)
        try {
            const payload = { ...brandForm, ...generalForm, "help.markdown": helpMarkdown }
            const [settingsRes, metricsRes] = await Promise.all([
                fetch("/api/settings", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }),
                fetch("/api/metrics", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(metricsForm),
                }),
            ])
            if (!settingsRes.ok || !metricsRes.ok) throw new Error("Failed to save")
            // Snapshot new initial state
            setInitialBrand({ ...brandForm })
            setInitialGeneral({ ...generalForm })
            const updatedMetrics = await metricsRes.json()
            setMetricsForm(updatedMetrics)
            setInitialMetrics(updatedMetrics)
            setInitialHelpMarkdown(helpMarkdown)
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
        setHelpMarkdown(initialHelpMarkdown)
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

    if (!brandForm || !generalForm || !metricsForm) {
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
            {hasChanges && hasDbState !== false && (
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
                            {hasDbState === false
                                ? "No hay una base de datos configurada. Los campos están deshabilitados."
                                : "Administra la configuración general y la apariencia de la plataforma."}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRestoreDefaults}
                        disabled={hasDbState === false}
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
                        <TabsTrigger value="metrics">
                            <Activity className="size-3.5 mr-1.5" />
                            Métricas
                        </TabsTrigger>
                        <TabsTrigger value="help">
                            <CircleHelp className="size-3.5 mr-1.5" />
                            Ayuda
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
                                    placeholder={envDefaults["config.tbApi"] || "https://dashboard.example.com"}
                                    disabled={hasDbState === false}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    {envDefaults["config.tbApi"]
                                        ? `Usando variable de entorno TB_API: ${envDefaults["config.tbApi"]}`
                                        : "URL del servidor ThingsBoard. Si se deja vacío, se usa la variable de entorno TB_API."}
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
                                    IDs de los grupos de clientes de ThingsBoard. Los
                                    valores de la base de datos tienen prioridad sobre
                                    las variables de entorno. Si se dejan vacíos, se
                                    usan los valores del .env (mostrados como placeholder).
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
                                        placeholder={envDefaults["config.industriesGroupId"] || "UUID"}
                                        disabled={hasDbState === false}
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
                                        placeholder={envDefaults["config.billingGroupId"] || "UUID"}
                                        disabled={hasDbState === false}
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
                                        placeholder={envDefaults["config.multisiteGroupId"] || "UUID"}
                                        disabled={hasDbState === false}
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
                                    disabled={hasDbState === false}
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
                                    disabled={hasDbState === false}
                                />
                                <ColorPickerInput
                                    label="Color acento"
                                    value={brandForm["brand.accentColor"]}
                                    onChange={(v) =>
                                        setBrand("brand.accentColor", v)
                                    }
                                    disabled={hasDbState === false}
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
                                    disabled={hasDbState === false}
                                />
                                <ImageUploadCard
                                    label="Logo del login"
                                    description="Logo principal en la página de inicio de sesión"
                                    value={brandForm["brand.loginLogoUrl"]}
                                    settingKey="brand.loginLogoUrl"
                                    onChange={setBrand}
                                    aspectRatio="wide"
                                    disabled={hasDbState === false}
                                />
                                <ImageUploadCard
                                    label="Fondo del login"
                                    description="Imagen decorativa de la página de inicio de sesión"
                                    value={brandForm["brand.loginBgUrl"]}
                                    settingKey="brand.loginBgUrl"
                                    onChange={setBrand}
                                    aspectRatio="banner"
                                    disabled={hasDbState === false}
                                />
                                <ImageUploadCard
                                    label="Favicon"
                                    description="Icono de la pestaña del navegador"
                                    value={brandForm["brand.faviconUrl"]}
                                    settingKey="brand.faviconUrl"
                                    onChange={setBrand}
                                    aspectRatio="square"
                                    disabled={hasDbState === false}
                                />
                            </div>
                        </section>
                    </TabsContent>

                    {/* ── Metrics Tab ─────────────────────────────── */}
                    <TabsContent value="metrics" className="space-y-6 mt-4">
                        <MetricsTabContent
                            metrics={metricsForm}
                            onChange={setMetricsForm}
                            disabled={hasDbState === false}
                            addingMetric={addingMetric}
                            setAddingMetric={setAddingMetric}
                        />
                    </TabsContent>

                    {/* ── Help Tab ────────────────────────────────── */}
                    <TabsContent value="help" className="space-y-6 mt-4">
                        <section className="space-y-4">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Contenido de ayuda
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Escribe el contenido en formato Markdown. Este contenido se mostrará a todos los usuarios en la página de ayuda.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Editor Markdown
                                    </Label>
                                    <textarea
                                        value={helpMarkdown}
                                        onChange={(e) => setHelpMarkdown(e.target.value)}
                                        disabled={hasDbState === false}
                                        className="flex min-h-100 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-y"
                                        placeholder="# Título\n\nEscribe el contenido de ayuda aquí..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Vista previa
                                    </Label>
                                    <div className="min-h-100 rounded-md border border-input bg-muted/30 px-4 py-3 overflow-auto help-markdown">
                                        <HelpMarkdownPreview content={helpMarkdown} />
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => setHelpMarkdown(DEFAULT_HELP_MARKDOWN)}
                                disabled={hasDbState === false}
                            >
                                <RotateCcw className="size-3 mr-1.5" />
                                Restaurar texto por defecto
                            </Button>
                        </section>
                    </TabsContent>
                </Tabs>

                {/* spacer for scroll past sticky bar */}
                <div className="h-8" />
            </div>
        </div>
    )
}

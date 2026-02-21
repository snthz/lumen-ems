"use client"

import Image from "next/image"
import { useState, useCallback, useEffect } from "react"
import { useSessionStore } from "@/lib/auth/store/session.store"
import { Badge } from "@/components/ui/badge"
import {
    CircleAlert,
    Users,
    Box,
    Cpu,
    GitBranch,
    ChevronRight,
    X,
} from "lucide-react"

// ─── Image helper ────────────────────────────────────────

/** Onboarding images have very different dimensions. This map stores
 *  the natural width×height so Next/Image can compute aspect‑ratio and
 *  we can pick sensible max‑widths per image. */
const IMG = {
    "create-groups":      { w: 2938, h: 1616, max: "max-w-3xl" },
    "add-customer":       { w: 2940, h: 1616, max: "max-w-3xl" },
    "customer-form":      { w: 1358, h: 1616, max: "max-w-sm" },
    "customer-added":     { w: 2500, h: 866,  max: "max-w-2xl" },
    "add-ag":             { w: 2938, h: 1006, max: "max-w-3xl" },
    "form-ag":            { w: 904,  h: 1040, max: "max-w-xs" },
    "share-ag":           { w: 2502, h: 558,  max: "max-w-2xl" },
    "form-share-ag":      { w: 902,  h: 630,  max: "max-w-xs" },
    "add-asset":          { w: 2492, h: 616,  max: "max-w-2xl" },
    "btn-mog":            { w: 2496, h: 1506, max: "max-w-2xl" },
    "mog-assets":         { w: 1440, h: 582,  max: "max-w-xl" },
    "asset-customer-relation": { w: 1080, h: 1050, max: "max-w-sm" },
    "device-asset-relation":   { w: 1080, h: 1046, max: "max-w-sm" },
} as const

type ImgKey = keyof typeof IMG

// ─── Lightbox ────────────────────────────────────────────

function Lightbox({
    src,
    alt,
    onClose,
}: {
    src: string
    alt: string
    onClose: () => void
}) {
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose()
        }
        document.addEventListener("keydown", onKey)
        document.body.style.overflow = "hidden"
        return () => {
            document.removeEventListener("keydown", onKey)
            document.body.style.overflow = ""
        }
    }, [onClose])

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-zoom-out"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-101 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors cursor-pointer"
            >
                <X className="size-5" />
            </button>
            <div
                className="relative max-h-[90vh] max-w-[90vw]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt={alt}
                    className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl cursor-zoom-out"
                    onClick={onClose}
                />
            </div>
        </div>
    )
}

// ─── Onboarding Image ────────────────────────────────────

function OnboardingImage({ name, caption, onZoom }: { name: ImgKey; caption?: string; onZoom: (src: string, alt: string) => void }) {
    const meta = IMG[name]
    const src = `/images/onboarding/${name}.png`
    return (
        <figure className={`my-4 ${meta.max} w-full`}>
            <div
                className="rounded-lg border overflow-hidden bg-muted/30 shadow-sm cursor-zoom-in transition-shadow hover:shadow-md"
                onClick={() => onZoom(src, caption || name)}
            >
                <Image
                    src={src}
                    alt={caption || name}
                    width={meta.w}
                    height={meta.h}
                    className="w-full h-auto"
                    quality={85}
                />
            </div>
            {caption && (
                <figcaption className="text-xs text-muted-foreground mt-1.5 italic">
                    {caption}
                </figcaption>
            )}
        </figure>
    )
}

function Alert({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 px-4 py-3 text-sm text-amber-800 dark:text-amber-200 my-4">
            <CircleAlert className="size-4 mt-0.5 shrink-0" />
            <div>{children}</div>
        </div>
    )
}

function StepNumber({ n }: { n: number }) {
    return (
        <span className="inline-flex items-center justify-center size-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
            {n}
        </span>
    )
}

// ─── Page ────────────────────────────────────────────────

export default function OnboardingPage() {
    const user = useSessionStore((s) => s.user)
    const isTenantAdmin = user?.scopes?.includes("TENANT_ADMIN")
    const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)

    const openLightbox = useCallback((src: string, alt: string) => {
        setLightbox({ src, alt })
    }, [])

    const closeLightbox = useCallback(() => {
        setLightbox(null)
    }, [])

    if (user && !isTenantAdmin) {
        return (
            <div className="flex flex-1 items-center justify-center p-6">
                <div className="text-center space-y-2">
                    <h2 className="text-lg font-semibold">Acceso restringido</h2>
                    <p className="text-sm text-muted-foreground">
                        Solo los administradores pueden ver la guía de configuración.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-12 w-full">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Guía de configuración
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                    Sigue estos pasos para configurar correctamente tu plataforma de
                    monitoreo de energía. Todos los pasos se realizan desde el panel de
                    administración de ThingsBoard.
                </p>
            </div>

            {/* ── Step 1: Create Customer Groups ───────────────── */}
            <section className="space-y-4">
                <div className="flex items-start gap-3">
                    <StepNumber n={1} />
                    <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Users className="size-4" />
                            Crear grupos de clientes
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Desde ThingsBoard, dirígete a{" "}
                            <Badge variant="secondary" className="font-mono text-xs">
                                Customers → Groups
                            </Badge>{" "}
                            y crea los siguientes tres grupos:
                        </p>
                    </div>
                </div>

                <div className="ml-10 space-y-3">
                    <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                        <li>
                            <strong className="text-foreground">EMS Multisitio</strong>{" "}
                            — para clientes con múltiples ubicaciones
                        </li>
                        <li>
                            <strong className="text-foreground">EMS Industria</strong>{" "}
                            — para clientes industriales
                        </li>
                        <li>
                            <strong className="text-foreground">EMS Facturación</strong>{" "}
                            — para clientes con facturación
                        </li>
                    </ul>
                    <OnboardingImage
                        name="create-groups"
                        caption="Vista de grupos de clientes en ThingsBoard"
                        onZoom={openLightbox}
                    />
                </div>
            </section>

            {/* ── Step 2: Add Customers ────────────────────────── */}
            <section className="space-y-4">
                <div className="flex items-start gap-3">
                    <StepNumber n={2} />
                    <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Users className="size-4" />
                            Agregar clientes a los grupos
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Abre el grupo que corresponda y haz clic en el botón{" "}
                            <strong className="text-foreground">Add Customer</strong>{" "}
                            para registrar un nuevo cliente.
                        </p>
                    </div>
                </div>

                <div className="ml-10 space-y-3">
                    <OnboardingImage
                        name="add-customer"
                        caption="Botón para agregar un cliente dentro del grupo"
                        onZoom={openLightbox}
                    />

                    <p className="text-sm text-muted-foreground">
                        Completa el formulario con la información básica del
                        cliente: nombre, correo, descripción, etc.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <OnboardingImage
                            name="customer-form"
                            caption="Formulario de creación de cliente"
                            onZoom={openLightbox}
                        />
                        <OnboardingImage
                            name="customer-added"
                            caption="Cliente creado exitosamente"
                            onZoom={openLightbox}
                        />
                    </div>

                    <Alert>
                        <strong>Importante:</strong> Debes compartir el{" "}
                        <em>Customer Entity Group</em> con el cliente para que pueda
                        visualizar sus recursos. Sin este paso, el cliente no tendrá
                        acceso.
                    </Alert>
                </div>
            </section>

            {/* ── Step 3: Asset Groups ─────────────────────────── */}
            <section className="space-y-4">
                <div className="flex items-start gap-3">
                    <StepNumber n={3} />
                    <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Box className="size-4" />
                            Configurar grupos de assets
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Los <em>Asset Groups</em> permiten agrupar los activos de cada
                            cliente y compartirlos de forma controlada. Ve a{" "}
                            <Badge
                                variant="secondary"
                                className="font-mono text-xs"
                            >
                                Assets → Groups
                            </Badge>{" "}
                            y crea un nuevo grupo.
                        </p>
                    </div>
                </div>

                <div className="ml-10 space-y-4">
                    <OnboardingImage
                        name="add-ag"
                        caption="Crear un nuevo Asset Group"
                        onZoom={openLightbox}
                    />

                    <p className="text-sm text-muted-foreground">
                        Asigna un nombre descriptivo al grupo:
                    </p>
                    <OnboardingImage
                        name="form-ag"
                        caption="Formulario del Asset Group"
                        onZoom={openLightbox}
                    />

                    <p className="text-sm text-muted-foreground">
                        Después de crearlo, presiona el botón{" "}
                        <strong className="text-foreground">Share</strong> para
                        compartirlo con el cliente y asignar los permisos
                        correspondientes:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <OnboardingImage
                            name="share-ag"
                            caption="Botón de compartir el Asset Group"
                            onZoom={openLightbox}
                        />
                        <OnboardingImage
                            name="form-share-ag"
                            caption="Formulario de permisos para el cliente"
                            onZoom={openLightbox}
                        />
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Ahora puedes agregar assets al grupo:
                    </p>
                    <OnboardingImage
                        name="add-asset"
                        caption="Agregar un asset al grupo"
                        onZoom={openLightbox}
                    />

                    <p className="text-sm text-muted-foreground">
                        Si el asset ya existe, abre el asset y haz clic en{" "}
                        <strong className="text-foreground">
                            Manage owner and groups
                        </strong>{" "}
                        para asignarlo al grupo correspondiente:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <OnboardingImage
                            name="btn-mog"
                            caption="Botón 'Manage owner and groups'"
                            onZoom={openLightbox}
                        />
                        <OnboardingImage
                            name="mog-assets"
                            caption="Asignar asset al grupo"
                            onZoom={openLightbox}
                        />
                    </div>

                    <Alert>
                        <strong>Importante:</strong> Si un asset no pertenece al grupo
                        compartido con el cliente, este no podrá visualizarlo en la
                        plataforma.
                    </Alert>
                </div>
            </section>

            {/* ── Step 4: Devices ──────────────────────────────── */}
            <section className="space-y-4">
                <div className="flex items-start gap-3">
                    <StepNumber n={4} />
                    <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Cpu className="size-4" />
                            Configurar dispositivos
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Repite el mismo proceso de los pasos 2 y 3 pero en la
                            sección de{" "}
                            <Badge
                                variant="secondary"
                                className="font-mono text-xs"
                            >
                                Devices → Groups
                            </Badge>
                            . Crea un grupo de dispositivos, compártelo con el cliente y
                            agrega los dispositivos necesarios.
                        </p>
                    </div>
                </div>

                <div className="ml-10">
                    <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                            <ChevronRight className="size-3.5" />
                            El proceso es idéntico al de los assets — solo cambia la
                            sección en ThingsBoard.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Step 5: Relations ────────────────────────────── */}
            <section className="space-y-4">
                <div className="flex items-start gap-3">
                    <StepNumber n={5} />
                    <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <GitBranch className="size-4" />
                            Configurar relaciones
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Las relaciones definen la jerarquía de tu instalación.
                            La estructura es sencilla:
                        </p>
                    </div>
                </div>

                <div className="ml-10 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Badge variant="outline">Devices</Badge>
                        <ChevronRight className="size-3.5 text-muted-foreground" />
                        <Badge variant="outline">Assets</Badge>
                        <ChevronRight className="size-3.5 text-muted-foreground" />
                        <Badge variant="outline">Customer</Badge>
                    </div>

                    {/* Assets → Customer */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold">
                            5.1 — Relacionar assets con el customer
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Cada asset debe tener una relación con su customer para
                            aparecer en la plataforma. Los assets también pueden estar
                            relacionados entre sí (por ejemplo, un subestación dentro
                            de una planta).
                        </p>
                        <OnboardingImage
                            name="asset-customer-relation"
                            caption="Relación de un asset con su customer"
                            onZoom={openLightbox}
                        />

                        <div className="rounded-lg border bg-card px-4 py-3 text-sm space-y-2">
                            <p className="font-medium">
                                Atributos opcionales en{" "}
                                <code className="bg-muted px-1 rounded text-xs">
                                    Additional Info
                                </code>
                                :
                            </p>
                            <pre className="bg-muted rounded-md px-3 py-2 text-xs overflow-x-auto">
{`{
  "name": "",         // Nombre personalizado (por defecto usa el del asset)
  "hasDevices": true  // false para assets sin dispositivos (oculta checkbox en UI)
}`}
                            </pre>
                        </div>
                    </div>

                    {/* Devices → Assets */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold">
                            5.2 — Relacionar dispositivos con assets
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Cada dispositivo debe estar relacionado con al menos un
                            asset. Un dispositivo puede pertenecer a varios assets si es
                            necesario.
                        </p>
                        <OnboardingImage
                            name="device-asset-relation"
                            caption="Relación de un dispositivo con su asset"
                            onZoom={openLightbox}
                        />

                        <div className="rounded-lg border bg-card px-4 py-3 text-sm space-y-2">
                            <p className="font-medium">
                                Atributos opcionales en{" "}
                                <code className="bg-muted px-1 rounded text-xs">
                                    Additional Info
                                </code>
                                :
                            </p>
                            <pre className="bg-muted rounded-md px-3 py-2 text-xs overflow-x-auto">
{`{
  "name": "",        // Nombre personalizado (por defecto usa el del dispositivo)
  "default": false   // true para que se muestre seleccionado en la primera carga
}`}
                            </pre>
                        </div>
                    </div>

                    <Alert>
                        <strong>Nota:</strong> Puede haber assets relacionados entre sí
                        para representar sub-niveles de la instalación (p.ej.{" "}
                        <em>Planta → Subestación → Tablero</em>).
                    </Alert>
                </div>
            </section>

            {/* Bottom spacer */}
            <div className="h-12" />

            {lightbox && (
                <Lightbox
                    src={lightbox.src}
                    alt={lightbox.alt}
                    onClose={closeLightbox}
                />
            )}
        </div>
    )
}

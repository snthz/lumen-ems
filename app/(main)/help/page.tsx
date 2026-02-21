"use client"

import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Skeleton } from "@/components/ui/skeleton"

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

export default function HelpPage() {
    const [content, setContent] = useState<string | null>(null)

    useEffect(() => {
        fetch("/api/settings")
            .then((r) => r.json())
            .then((data) => {
                const raw = data.settings ?? data
                setContent(raw["help.markdown"] || DEFAULT_HELP_MARKDOWN)
            })
            .catch(() => {
                setContent(DEFAULT_HELP_MARKDOWN)
            })
    }, [])

    if (content === null) {
        return (
            <div className="max-w-3xl mx-auto p-6 space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-8 w-48 mt-6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        )
    }

    return (
        <div className="max-w-5xl w-full mx-auto p-6">
            <article className="help-markdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                </ReactMarkdown>
            </article>
        </div>
    )
}

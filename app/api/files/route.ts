import { NextRequest, NextResponse } from "next/server"
import { saveFile, getFile, deleteFile } from "@/lib/db/store"
import crypto from "crypto"

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/svg+xml", "image/webp", "image/gif"])

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get("file") as File | null
        const id = (formData.get("id") as string) || crypto.randomUUID()

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }
        if (!ALLOWED_TYPES.has(file.type)) {
            return NextResponse.json({ error: "File type not allowed" }, { status: 400 })
        }
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        await saveFile(id, file.name, file.type, buffer)

        return NextResponse.json({ id, filename: file.name, mimeType: file.type })
    } catch (err) {
        console.error("Upload failed:", err)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
        return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }
    await deleteFile(id)
    return NextResponse.json({ ok: true })
}

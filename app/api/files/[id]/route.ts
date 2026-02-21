import { NextRequest, NextResponse } from "next/server"
import { getFile } from "@/lib/db/store"

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const file = await getFile(id)
    if (!file) {
        return new NextResponse("Not found", { status: 404 })
    }

    return new NextResponse(new Uint8Array(file.data), {
        headers: {
            "Content-Type": file.mimeType,
            "Content-Disposition": `inline; filename="${file.filename}"`,
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    })
}

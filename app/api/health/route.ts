import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip =
        forwardedFor?.split(",")[0].trim() ??
        req.headers.get("x-real-ip") ??
        "unknown";

    return NextResponse.json({ redis: "ok", ip });
}

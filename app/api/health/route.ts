

export async function GET(req: Request, res: Response) {

    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip =
        forwardedFor?.split(",")[0].trim() ??
        req.headers.get("x-real-ip") ??
        "unknown"

    return Response.json({ redis: "ok", ip })
}

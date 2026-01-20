import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "@/lib/auth/jwt";

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (
        pathname.startsWith("/auth") ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/_next") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
        return redirectToAuth(req);
    }

    try {
        const claims = decodeJwt(token);

        if (claims.exp * 1000 <= Date.now()) {
            return redirectToAuth(req);
        }

        return NextResponse.next();
    } catch {
        return redirectToAuth(req);
    }
}

function redirectToAuth(req: NextRequest) {
    return NextResponse.redirect(new URL("/auth", req.url));
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

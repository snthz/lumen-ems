import {ThingsBoardJwtClaims} from "@/lib/auth/types";

export function decodeJwt(token: string): ThingsBoardJwtClaims {
    const parts = token.split(".")

    if (parts.length !== 3) {
        throw new Error("Invalid JWT format")
    }

    const payload = parts[1]

    const decoded = Buffer.from(
        payload.replace(/-/g, "+").replace(/_/g, "/"),
        "base64"
    ).toString("utf-8")

    try {
        return JSON.parse(decoded) as ThingsBoardJwtClaims
    } catch {
        throw new Error("Invalid JWT payload")
    }
}

export function jwtIsExpired(claims: ThingsBoardJwtClaims): boolean {
    const currentTime = Math.floor(Date.now() / 1000)
    return claims.exp < currentTime
}

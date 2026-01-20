import {UserJwtClaims} from "@/lib/auth/types";

export function decodeJwt(token: string): UserJwtClaims {
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
        return JSON.parse(decoded) as UserJwtClaims
    } catch {
        throw new Error("Invalid JWT payload")
    }
}

export function jwtIsExpired(claims: UserJwtClaims): boolean {
    const currentTime = Math.floor(Date.now() / 1000)
    return claims.exp < currentTime
}

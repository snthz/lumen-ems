"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { decodeJwt } from "@/lib/auth/jwt";
import { useSessionStore } from "@/lib/auth/store/session.store";

function setAuthCookie(token: string, exp: number) {
    const expires = new Date(exp * 1000).toUTCString();
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `auth_token=${token}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

function getAuthCookie(): string | null {
    const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
    return match ? match[1] : null;
}

function TokenProviderInner({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchToken = searchParams.get("token");

    const setSession = useSessionStore((s) => s.setSession);
    const clearSession = useSessionStore((s) => s.clearSession);

    // Block render until token is resolved — avoids flash of login page
    const [ready, setReady] = useState(!searchToken);

    useEffect(() => {
        const now = Date.now();

        const hydrateFromToken = (token: string) => {
            try {
                const claims = decodeJwt(token);
                if (claims.exp * 1000 <= now) {
                    clearSession();
                    return null;
                }
                setSession(claims);
                return claims;
            } catch {
                clearSession();
                return null;
            }
        };

        if (searchToken) {
            const claims = hydrateFromToken(searchToken);
            if (!claims) {
                setReady(true);
                return;
            }

            // Synchronously write cookie before navigating
            setAuthCookie(searchToken, claims.exp);

            const url = new URL(window.location.href);
            url.pathname = "/dashboard";
            url.searchParams.delete("token");
            router.replace(url.toString());
            // keep ready=false while redirecting to avoid flash
            return;
        }

        const existingToken = getAuthCookie();
        if (existingToken) {
            hydrateFromToken(existingToken);
        }

        setReady(true);
    }, [searchToken, router, setSession, clearSession]);

    if (!ready) return null;

    return <>{children}</>;
}

export function TokenProvider({ children }: { children: React.ReactNode }) {
    return (
        <Suspense>
            <TokenProviderInner>{children}</TokenProviderInner>
        </Suspense>
    );
}

"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { decodeJwt } from "@/lib/auth/jwt";
import { useGetCookie, useSetCookie } from "cookies-next";
import { useSessionStore } from "@/lib/auth/store/session.store";

function TokenProviderInner({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchToken = searchParams.get("token");

    const setCookie = useSetCookie();
    const getCookie = useGetCookie();

    const setSession = useSessionStore((s) => s.setSession);
    const clearSession = useSessionStore((s) => s.clearSession);

    useEffect(() => {
        const now = Date.now();
        const hydrateFromToken = (token: string) => {
            try {
                const claims = decodeJwt(token);

                if (claims.exp * 1000 <= now) {
                    clearSession();
                    return;
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
            if (!claims) return;

            console.log("Hydrated session from token in URL", claims);
            setCookie("auth_token", searchToken, {
                expires: new Date(claims.exp * 1000),
                sameSite: "lax",
                secure: true,
            });

            const url = new URL(window.location.href);
            url.pathname = "/dashboard";
            url.searchParams.delete("token");
            router.replace(url.toString());
            return;
        }

        const existingToken = getCookie("auth_token") as string | undefined;
        if (existingToken) {
            const debug = hydrateFromToken(existingToken);
            console.log("Hydrated session from existing cookie", debug);
        }

    }, [searchToken, router, setCookie, setSession, clearSession, getCookie]);

    return <>{children}</>;
}

export function TokenProvider({ children }: { children: React.ReactNode }) {
    return (
        <Suspense>
            <TokenProviderInner>{children}</TokenProviderInner>
        </Suspense>
    );
}

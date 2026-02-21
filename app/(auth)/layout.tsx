import type {Metadata} from "next";
import "../globals.css";
import {TokenProvider} from "@/features/auth/providers/token.provider";
import {Suspense} from "react";
import {BrandingProvider} from "@/lib/branding/branding.provider";
import {getAllSettings} from "@/lib/db/store";
import {toBranding} from "@/lib/branding/branding.defaults";
import Loading from "./loading";

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getAllSettings();
    const branding = toBranding(settings);
    return {
        title: `${branding.pageTitle} | Iniciar sesión`,
        description: `${branding.pageTitle} Iniciar sesión`,
    };
}

export default async function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    const initialSettings = await getAllSettings();
    return (
        <html lang="en">
        <body
            className={` antialiased`}
        >
        <Suspense fallback={<Loading />}>
            <BrandingProvider initial={initialSettings}>
                <TokenProvider>
                    {children}
                </TokenProvider>
            </BrandingProvider>
        </Suspense>
        </body>
        </html>
    );
}

import type {Metadata} from "next";
import "../globals.css";
import {TokenProvider} from "@/features/auth/providers/token.provider";
import {Suspense} from "react";
import Loading from "./loading";


export const metadata: Metadata = {
    title: "Lumen EMS | Iniciar sesión",
    description: "Lumen EMS Iniciar sesión",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body
            className={` antialiased`}
        >
        <Suspense fallback={<Loading />}>

            <TokenProvider>
                {children}
            </TokenProvider>
        </Suspense>
        </body>
        </html>
    );
}

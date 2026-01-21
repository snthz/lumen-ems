import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "../globals.css";
import {TokenProvider} from "@/features/auth/providers/token.provider";
import {Suspense} from "react";
import {AppSidebar} from "@/components/app-sidebar";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {getCustomersByEntityGroup} from "@/lib/thingsboard/server/thingsboard.server";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Lumen EMS | Dashboard",
    description: "Lumen EMS Dashboard",
};

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {
    const {data: customers} = await getCustomersByEntityGroup()
    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <Suspense fallback={null}>
            <TokenProvider>
                <SidebarProvider>
                    <AppSidebar customers={customers}/>
                    <SidebarInset>
                        <header className="flex h-16 shrink-0 items-center gap-2">
                            <div className=" flex items-center justify-between gap-2 px-4">
                                <div className={"flex items-center justify-center gap-1"}>
                                    <SidebarTrigger className="-ml-1"/>
                                    <Separator
                                        orientation="vertical"
                                        className="data-[orientation=vertical]:h-4"
                                    />
                                    <span className={"text-sm"}>Grafica</span>
                                </div>
                            </div>
                        </header>
                        <div className="flex flex-1 flex-col gap-4 px-4 pt-0">
                            {children}
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </TokenProvider>
        </Suspense>
        </body>
        </html>
    );
}

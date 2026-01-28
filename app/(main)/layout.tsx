import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "../globals.css";
import {TokenProvider} from "@/features/auth/providers/token.provider";
import {Suspense} from "react";
import {AppSidebar} from "@/components/sidebar/app-sidebar";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {getCustomersByEntityGroup} from "@/lib/thingsboard/server/thingsboard.server";
import {Toaster} from "sonner";
import Loading from "./loading";

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
            
        <Suspense fallback={<Loading />}>
            <TokenProvider>
                <SidebarProvider>
                    <AppSidebar customers={customers}/>
                    <SidebarInset>
                        <header className="flex shrink-0 items-center gap-2 border-b">
                            <div className=" flex items-center justify-between gap-2 px-4">
                                <div className={"flex items-center justify-center gap-4"}>
                                    <div className={"py-3 pr-2 border-r"}>
                                        <SidebarTrigger className="-ml-1 cursor-pointer"/>
                                    </div>
                                    <span className={"text-sm"}>Grafica</span>
                                </div>
                            </div>
                        </header>
                        <div className="flex flex-1 flex-col gap-4 pt-0">
                            {children}
                        </div>
                    </SidebarInset>
                </SidebarProvider>

            </TokenProvider>
            <Toaster/>
        </Suspense>
        </body>
        </html>
    );
}

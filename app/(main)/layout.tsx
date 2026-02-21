import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "../globals.css";
import {TokenProvider} from "@/features/auth/providers/token.provider";
import {Suspense} from "react";
import {AppSidebar} from "@/components/sidebar/app-sidebar";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {getCustomerGroups} from "@/lib/thingsboard/server/thingsboard.server";
import {Toaster} from "sonner";
import {BrandingProvider} from "@/lib/branding/branding.provider";
import {getAllSettings} from "@/lib/db/store";
import {toBranding} from "@/lib/branding/branding.defaults";
import Loading from "./loading";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getAllSettings();
    const branding = toBranding(settings);
    return {
        title: `${branding.pageTitle} | Dashboard`,
        description: `${branding.pageTitle} Dashboard`,
    };
}

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {
    const [{data: groups}, initialSettings] = await Promise.all([
        getCustomerGroups(),
        getAllSettings(),
    ]);
    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
            
        <Suspense fallback={<Loading />}>
            <BrandingProvider initial={initialSettings}>
            <TokenProvider>
                <SidebarProvider>
                    <AppSidebar groups={groups ?? []}/>
                    <SidebarInset>
                        <header className="flex shrink-0 items-center gap-2 border-b">
                            <div className="flex items-center gap-2 px-4">
                                <div className="py-3 pr-2 border-r">
                                    <SidebarTrigger className="-ml-1 cursor-pointer"/>
                                </div>
                            </div>
                        </header>
                        <div className="flex flex-1 flex-col gap-4 pt-0">
                            {children}
                        </div>
                    </SidebarInset>
                </SidebarProvider>

            </TokenProvider>
            </BrandingProvider>
            <Toaster/>
        </Suspense>
        </body>
        </html>
    );
}

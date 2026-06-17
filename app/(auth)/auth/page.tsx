"use client"

import Image from "next/image"
import {LoginForm} from "@/features/auth/components/login-form"
import {useBranding} from "@/lib/branding/branding.provider"

export default function LoginPage() {
    const { branding } = useBranding()
    const isUploadedLogo = branding.loginLogoUrl.startsWith("/api/")
    const isUploadedBg = branding.loginBgUrl.startsWith("/api/")

    return (
            <div className="grid min-h-svh lg:grid-cols-2 ">
                <div className="flex flex-col gap-4 p-6 md:p-10">
                    <div className="flex  gap-2 justify-start">
                        <Image src={branding.loginLogoUrl} alt="logo" width={300} height={100} className="h-12 w-auto" unoptimized={isUploadedLogo} />
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-sm">
                            <LoginForm/>
                        </div>
                    </div>
                </div>
                <div className="bg-muted relative hidden lg:block m-6 rounded-4xl">
                    <Image src={branding.loginBgUrl} alt="Image" fill sizes="50vw" className="object-cover rounded-4xl shadow-xs" unoptimized={isUploadedBg} />
                </div>
            </div>
    )
}

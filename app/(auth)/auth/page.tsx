import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex  gap-2 justify-start">
                    <img src={"/images/lumen-ems.png"} alt={"logo"} className={"w-1/2 md:w-1/3"}/>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <LoginForm />
                    </div>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:block">
                <img
                    src="/images/auth-image-2.png"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover"
                />
            </div>
        </div>
    )
}

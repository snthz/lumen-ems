import Image from "next/image"
import {LoginForm} from "@/features/auth/components/login-form"
export default function LoginPage() {
    return (
            <div className="grid min-h-svh lg:grid-cols-2 ">
                <div className="flex flex-col gap-4 p-6 md:p-10">
                    <div className="flex  gap-2 justify-start">
                        <Image src="/images/lumen-ems.png" alt="logo" width={300} height={100} className="w-1/2 md:w-1/3" />
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-xs">
                            <LoginForm/>
                        </div>
                    </div>
                </div>
                <div className="bg-muted relative hidden lg:block m-6 rounded-4xl">
                    <Image src="/images/auth-page-image.jpg" alt="Image" fill sizes="50vw" className="object-cover rounded-4xl shadow-xs" />
                </div>
            </div>
    )
}

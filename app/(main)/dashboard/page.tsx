"use client"
import {useSessionStore} from "@/lib/auth/store/session.store";

export default function Page() {
    const {user} = useSessionStore()
    return (
        <div>
            Dashboard Home Page {user?.firstName || ""}
        </div>
    )
}
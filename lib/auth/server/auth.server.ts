"use server";
import {env} from "@/lib/config/env";

export async function loginUser(username: string, password: string): Promise<{ token: string }> {

    const response = await fetch(`${env.TB_API}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({username, password}),
    });


    if (!response.ok) {
        throw new Error(`Login failed with status ${response.status}`);
    }

    return await response.json();

}
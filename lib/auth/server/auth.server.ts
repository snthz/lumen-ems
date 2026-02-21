"use server";
import {resolveConfig} from "@/lib/config/resolve";

export async function loginUser(username: string, password: string): Promise<{ token: string }> {
    const cfg = await resolveConfig()

    const response = await fetch(`${cfg.tbApi}/api/auth/login`, {
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
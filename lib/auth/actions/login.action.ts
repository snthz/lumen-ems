"use server";

import {cookies} from "next/headers";
import {decodeJwt} from "@/lib/auth/jwt";
import {loginUser} from "@/lib/auth/server/auth.server";
import {ActionResponse} from "@/lib/services/types";

export async function loginAction(
    _prevState: unknown,
    formData: FormData
) :Promise<ActionResponse<null>> {
    const username = formData.get("username") as string | null;
    const password = formData.get("password") as string | null;

    if (!username || !password) {
        return {
            success: false,
            error: "El nombre de usuario y la contraseña son obligatorios.",
        }
    }

    try {
        const { token } = await loginUser(username, password);
        const claims = decodeJwt(token);
        const cookieStore = await cookies();
        cookieStore.set("auth_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            expires: new Date(claims.exp * 1000),
            path: "/",
        });
        return {
            success: true,
        }
    } catch (error) {
        console.log(error);
        return {
            success: false,
            error: "Error al iniciar sesión. Por favor, verifique sus credenciales e intente nuevamente.",
        }
    }
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {ReadonlyRequestCookies} from "next/dist/server/web/spec-extension/adapters/request-cookies";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAuthToken(cookieStore: ReadonlyRequestCookies ) {
    const authToken = cookieStore.get('auth_token')?.value;
    if (!authToken) {
        throw new Error('No auth token found in cookies');
    }
    return authToken;
}
export interface ActionResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export type ApiResponse<T> = Promise<ActionResponse<T>>;
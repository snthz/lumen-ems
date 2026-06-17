"use client";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {ArrowRight, Eye, EyeOff, Lock, Mail} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {useState, FormEvent} from "react";
import {loginAction} from "@/lib/auth/actions/login.action";
import {useRouter} from "next/navigation";

export function LoginForm({
                              className,
                              ...props
                          }: React.ComponentProps<"form">) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        const result = await loginAction(null, formData);
        setLoading(false);
        if (result?.success) {
            router.replace("/dashboard");
            return;
        }
        if (result?.error) {
            setError(result.error);
        }




    }

    return (
        <form
            onSubmit={onSubmit}
            className={cn("flex flex-col", className)}
            {...props}
        >
            <FieldGroup className="gap-4">
                <div className="mb-3 flex flex-col items-center gap-1.5 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Inicio de sesión</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Accede a tu cuenta para continuar
                    </p>
                </div>

                <Field className="gap-1.5">
                    <FieldLabel htmlFor="username" className="text-xs font-medium text-muted-foreground">
                        Usuario
                    </FieldLabel>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            id="username"
                            name="username"
                            type="email"
                            placeholder="m@example.com"
                            className="h-10 pl-9"
                            required
                        />
                    </div>
                </Field>

                <Field className="gap-1.5">
                    <FieldLabel htmlFor="password" className="text-xs font-medium text-muted-foreground">
                        Contraseña
                    </FieldLabel>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-10 pl-9 pr-9"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>

                    <div className="flex justify-end">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-default">
                                    ¿Olvidaste tu contraseña?
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Contacta al administrador para restablecer tu contraseña.</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </Field>

                <Button
                    type="submit"
                    disabled={loading}
                    className="mt-1 h-10"
                >
                    {loading ? "Ingresando..." : "Continuar"}
                    <ArrowRight/>
                </Button>

                {error && (
                    <p className="-mt-2 text-sm text-red-500 text-center">{error}</p>
                )}

                <small className="mt-1 text-center text-xs text-muted-foreground">
                    © 2019-{new Date().getFullYear()} Lumen Energy Solutions
                </small>
            </FieldGroup>
        </form>
    );
}

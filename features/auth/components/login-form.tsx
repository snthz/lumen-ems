"use client";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {ArrowRight} from "lucide-react";
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
            className={cn("flex flex-col gap-6", className)}
            {...props}
        >
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Inicio de sesión</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Accede a tu cuenta para continuar
                    </p>

                </div>


                <Field>
                    <FieldLabel htmlFor="username">Usuario:</FieldLabel>
                    <Input
                        id="username"
                        name="username"
                        type="email"
                        placeholder="m@example.com"
                        required
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="password">Contraseña:</FieldLabel>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="********"
                        required
                    />

                    <div className="flex justify-end">
                        <Tooltip>
                            <TooltipTrigger asChild>
                <span className="text-xs text-neutral-600 cursor-default">
                  ¿Olvidaste tu contraseña?
                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Contacta al administrador para restablecer tu contraseña.</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </Field>

                <Field>
                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Ingresando..." : "Continuar"}
                        <ArrowRight/>
                    </Button>
                </Field>
                {error && (
                    <p className="text-sm text-red-500 text-center -mt-4">{error}</p>
                )}

                <small className="text-center text-xs text-muted-foreground">
                    © 2019-{new Date().getFullYear()} Lumen
                </small>
            </FieldGroup>
        </form>
    );
}

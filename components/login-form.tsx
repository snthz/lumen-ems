import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field"
import {Input} from "@/components/ui/input"
import {ArrowRight} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

export function LoginForm({
                              className,
                              ...props
                          }: React.ComponentProps<"form">) {
    return (
        <form className={cn("flex flex-col gap-6", className)} {...props}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Inicio de sesión</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Accede a tu cuenta para continuar
                    </p>
                </div>
                <Field>
                    <FieldLabel htmlFor="email">Usuario:</FieldLabel>
                    <Input id="email" type="email" placeholder="m@example.com" required/>
                </Field>
                <Field>
                    <div className="flex items-center">
                        <FieldLabel htmlFor="password">Contraseña:</FieldLabel>
                    </div>
                    <Input id="password"
                           placeholder={"********"}
                           type="password" required/>
                    <div className="flex justify-end">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className={"text-xs text-neutral-600"}> ¿Olvidaste tu contraseña? </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Contacta al administrador para restablecer tu contraseña.</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </Field>
                <Field>
                    <Button className={"bg-blue-400 hover:bg-blue-400/80 cursor-pointer"} type="submit">Continuar
                        <ArrowRight/>
                    </Button>
                </Field>
                <small className="text-center text-xs text-muted-foreground">
                    © 2023-{new Date().getFullYear()} Lumen
                </small>
            </FieldGroup>
        </form>
    )
}

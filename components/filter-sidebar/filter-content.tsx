"use client"
import {DevicesHierarchy} from "@/features/devices/components/devices-hierarchy";
import * as React from "react";
import {Button} from "@/components/ui/button";
import {RefreshCcw} from "lucide-react";

export function FilterContent() {
    return (
        <div className={"h-full relative"}>
            <div className="px-6  py-4 border-b md:sticky  top-0 bg-white ">
                <h2 className="text-sm font-medium text-neutral-600">
                    Filtros
                </h2>
            </div>
            <div className={"sticky top-0  left-0 p-4 bg-white"}>
                <Button
                    size="icon"
                    variant="outline"
                    className="w-full m-0 rounded-xs cursor-pointer text-neutral-500
                    "
                >
                    <RefreshCcw className="size-4 mr-1"/>
                    Actualizar
                </Button>
            </div>
            <DevicesHierarchy/>
        </div>
    )
}
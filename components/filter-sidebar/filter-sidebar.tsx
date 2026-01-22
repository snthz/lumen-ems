'use client'

import * as React from 'react'
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Filter, ChevronRight, ChevronLeft } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import clsx from 'clsx'
import {FilterContent} from "@/components/filter-sidebar/filter-content";
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";

export function FilterSidebar() {
    const { isMobile } = useSidebar()
    const [mobileOpen, setMobileOpen] = React.useState(false)
    const [expanded, setExpanded] = React.useState(true)
    if (isMobile) {
        return (
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                    <Button
                        size="icon"
                        variant="outline"
                        className="fixed bottom-4 right-4 z-50"
                    >
                        <Filter className="size-4" />
                    </Button>
                </SheetTrigger>

                <SheetContent side="right" className="w-[85vw] max-w-sm overflow-auto">
                    <VisuallyHidden>
                        <SheetTitle>
                            Filtros
                        </SheetTitle>
                    </VisuallyHidden>
                    <FilterContent/>
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <aside
            className={clsx(
                'sticky top-0 h-full  bg-background transition-all duration-300 ease-in-out ',
                expanded ? 'w-80 border-l' : 'w-0 '
            )}
        >
            {/* Toggle button */}
            <div
                className={clsx(
                    'absolute top-8 z-30 ',
                    expanded ? '-left-5' : '-left-5'
                )}
            >
                <Button
                    size="icon"
                    variant="outline"
                    className={"cursor-pointer "}
                    onClick={() => setExpanded(v => !v)}
                >
                    {expanded ? (
                        <ChevronRight className="size-4" />
                    ) : (
                        <ChevronLeft className="size-4" />
                    )}
                </Button>
            </div>

            <div
                className={clsx(
                    'flex h-full flex-col transition-opacity duration-200',
                    expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
            >
                <div className="flex-1 overflow-y-auto  ">
                    <FilterContent />
                </div>
            </div>
        </aside>
    )

}

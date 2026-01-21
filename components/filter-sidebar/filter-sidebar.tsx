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

                <SheetContent side="right" className="w-[85vw] max-w-sm">
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
                'sticky top-0 h-screen border-l  transition-all duration-300 ease-in-out bg-background',
                expanded ? 'w-80' : 'w-0'
            )}
        >
            <div
                className={clsx(
                    'absolute top-4 -left-5 z-20',
                    expanded ? '' : '-left-2'
                )}
            >
                <Button
                    size="icon"
                    variant="outline"
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
                    'h-full overflow-hidden  pt-4 transition-opacity duration-200',
                    expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
            >
                <FilterContent />
            </div>
        </aside>
    )
}

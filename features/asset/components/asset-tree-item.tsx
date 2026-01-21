'use client'

import React from 'react'
import { TbRelation } from '@/lib/thingsboard/thingsboard.types'
import { ChevronRight, Eye } from 'lucide-react'
import {
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useAssetStore } from '@/features/asset/store/asset.store'
import clsx from 'clsx'
import {Button} from "@/components/ui/button";

export function AssetTreeItem({ relation }: { relation: TbRelation }) {
    const selectedAssets = useAssetStore(state => state.selectedAssets)
    const toggleAssetSelected = useAssetStore(
        state => state.toggleAssetSelected
    )

    const assetChildren =
        relation.children?.filter(
            child => child.to.entityType === 'ASSET'
        ) ?? []

    const hasChildren = assetChildren.length > 0
    const [open, setOpen] = React.useState(false)

    const assetId = relation.to.id
    const isSelected = Boolean(selectedAssets[assetId])

    function handleSelect(e: React.MouseEvent) {
        e.stopPropagation()
        toggleAssetSelected(relation)
    }

    return (
        <SidebarMenuSubItem className="pl-0">
            <Collapsible open={open} onOpenChange={setOpen}>
                <div
                    className={clsx(
                        'flex items-center justify-between pl-0 pr-1 cursor-pointer rounded-none',
                        isSelected && 'bg-neutral-200/40'
                    )}
                >
                    <SidebarMenuButton
                        className="pl-0 flex-1 cursor-pointer"
                        onClick={handleSelect}
                    >
            <span className="flex items-center gap-2 w-full">
              <div className="w-4 h-px bg-neutral-200" />
              <span className="text-xs">
                {relation.additionalInfo?.name ?? relation.toName}
              </span>
            </span>

                        {isSelected && (
                            <Eye className="size-4 text-neutral-400 ml-2" />
                        )}
                    </SidebarMenuButton>

                    {hasChildren && (
                        <CollapsibleTrigger asChild>
                            <Button
                                variant={"ghost"}
                                size={"icon-sm"}
                                onClick={e => e.stopPropagation()}
                                className=" cursor-pointer "
                            >
                                <ChevronRight
                                    className={clsx(
                                        'size-4 text-neutral-400 transition-transform',
                                        open && 'rotate-90'
                                    )}
                                />
                            </Button>
                        </CollapsibleTrigger>
                    )}
                </div>

                {hasChildren && (
                    <CollapsibleContent>
                        <SidebarMenuSub className="pl-0">
                            {assetChildren.map(child => (
                                <AssetTreeItem
                                    key={`${child.from.id}-${child.to.id}`}
                                    relation={child}
                                />
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                )}
            </Collapsible>
        </SidebarMenuSubItem>
    )
}

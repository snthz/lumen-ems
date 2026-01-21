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

export function AssetTreeItem({ relation }: { relation: TbRelation }) {
    const selectedAssets = useAssetStore(state => state.selectedAssets)
    const toggleAssetSelected = useAssetStore(state => state.toggleAssetSelected)

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
                <CollapsibleTrigger asChild onClick={handleSelect} className={"cursor-pointer"}>
                    <SidebarMenuButton className="pl-0">
            <span className="flex items-center gap-2 w-full">
              <div className="w-4 h-px bg-neutral-200" />
                {relation.additionalInfo?.name ?? relation.toName}
            </span>

                        <div className="flex items-center gap-2">
                            {isSelected && (
                                <Eye className="size-3 text-neutral-400" />
                            )}

                            {hasChildren && (
                                <ChevronRight
                                    className={`transition-transform text-neutral-400 ${
                                        open ? 'rotate-90' : ''
                                    }`}
                                />
                            )}
                        </div>
                    </SidebarMenuButton>
                </CollapsibleTrigger>

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

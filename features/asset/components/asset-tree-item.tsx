'use client'

import React from 'react'
import { TbRelation } from '@/lib/thingsboard/thingsboard.types'
import { ChevronRight } from 'lucide-react'
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
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from '@/components/ui/spinner'

export function AssetTreeItem({ relation }: { relation: TbRelation }) {
    console.log("Rendering AssetTreeItem for relation", relation)
    const selectedAssets = useAssetStore(state => state.selectedAssets)
    const loadingAssets = useAssetStore(state => state.loadingAssets)
    const toggleAssetSelected = useAssetStore(state => state.toggleAssetSelected)

    const assetChildren =
        relation.children?.filter(
            child => child.to.entityType === 'ASSET' || child.to.entityType === 'CUSTOMER'
        ) ?? []

    const hasChildren = assetChildren.length > 0
    const [open, setOpen] = React.useState(false)

    const assetId = relation.to.id
    const isSelected = Boolean(selectedAssets[assetId])
    const isLoading = Boolean(loadingAssets[assetId])
    const hasDevices = relation.additionalInfo?.hasDevices !== false

    function handleSelect(e: React.MouseEvent) {
        e.stopPropagation()
        toggleAssetSelected(relation)
    }

    return (
        <SidebarMenuSubItem className="pl-0">
            <Collapsible open={open} onOpenChange={setOpen}>
                <div
                    className="flex items-center justify-between pl-0 pr-1 cursor-pointer rounded-none"
                >
                    <SidebarMenuButton
                        className="pl-0 flex-1 cursor-pointer rounded-none"
                        onClick={(e) => {
                            if (relation.to.entityType === 'CUSTOMER') return
                            if (!hasDevices) return
                            handleSelect(e)
                        }}
                        disabled={isLoading}
                    >
                        <span className="flex items-center gap-2 w-full">
                            <div className="w-4 h-px bg-neutral-200" />
                            {relation.to.entityType === 'CUSTOMER' ? (
                                relation.additionalInfo?.logo ? (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_TB_API ?? ''}${relation.additionalInfo.logo}`}
                                        alt={relation.additionalInfo.name ?? relation.toName}
                                        className="size-6 rounded-md object-cover"
                                    />
                                ) : (
                                    <div className="size-6 bg-neutral-200 rounded-md flex items-center justify-center">
                                        <span className="uppercase text-xs">
                                            {relation.additionalInfo?.name?.charAt(0) ?? relation.toName?.charAt(0) ?? '?'}
                                        </span>
                                    </div>
                                )
                            ) : hasDevices ? (
                                isLoading
                                    ? <Spinner className="size-4 text-neutral-400" />
                                    : <Checkbox
                                        checked={isSelected}
                                        tabIndex={-1}
                                        className="pointer-events-none"
                                    />
                            ) : null}

                            <span className="text-xs truncate max-w-35" title={relation.additionalInfo?.name ?? relation.toName ?? ''}>
                                {relation.additionalInfo?.name ?? relation.toName}
                            </span>
                        </span>
                    </SidebarMenuButton>

                    {hasChildren && (
                        <CollapsibleTrigger asChild>
                            <Button
                                variant={"ghost"}
                                size={"icon-sm"}
                                onClick={e => e.stopPropagation()}
                                className="cursor-pointer"
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
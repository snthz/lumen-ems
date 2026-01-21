import { create } from 'zustand'
import { TbRelation } from '@/lib/thingsboard/thingsboard.types'

type SelectedAsset = TbRelation & {
    parentId: string
    parentType: string
    parentName: string
}

interface AssetState {
    selectedAssets: Record<string, SelectedAsset>
    isAssetSelected: (assetId: string) => boolean
    toggleAssetSelected: (relation: TbRelation) => void
    setAssetSelected: (relation: TbRelation) => void
    clearAssetsSelected: () => void
}

export const useAssetStore = create<AssetState>((set, get) => ({
    selectedAssets: {},

    isAssetSelected: assetId => {
        return assetId in get().selectedAssets
    },

    toggleAssetSelected: relation => {
        const assetId = relation.to.id
        const isSelected = get().isAssetSelected(assetId)

        if (isSelected) {
            set(state => {
                const next = { ...state.selectedAssets }
                delete next[assetId]
                return { selectedAssets: next }
            })
        } else {
            get().setAssetSelected(relation)
        }
    },

    setAssetSelected: relation => {
        const selectedAsset: SelectedAsset = {
            ...relation,
            parentId: relation.from.id,
            parentType: relation.from.entityType,
            parentName:
                relation.additionalInfo?.name ??
                relation.toName ??
                '',
        }

        set(state => ({
            selectedAssets: {
                ...state.selectedAssets,
                [relation.to.id]: selectedAsset,
            },
        }))
    },

    clearAssetsSelected: () => {
        set({ selectedAssets: {} })
    },
}))

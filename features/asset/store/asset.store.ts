import { create } from 'zustand'
import { TbRelation } from '@/lib/thingsboard/thingsboard.types'

interface AssetState {
    selectedAssets: Record<string, TbRelation[]>
    isAssetSelected: (assetId: string) => boolean
    toggleAssetSelected: (relation: TbRelation) => void
    setAssetSelected: (relation: TbRelation) => void
    clearAssetsSelected: () => void
}

export const useAssetStore = create<AssetState>((set, get) => ({
    selectedAssets: {},

    isAssetSelected: (assetId: string) => {
        return assetId in get().selectedAssets
    },
    toggleAssetSelected: (relation: TbRelation) => {
        const isSelected = get().isAssetSelected(relation.to.id)
        console.log(isSelected, relation.to.id, relation)
        if (isSelected) {
            set(state => {
                const updatedSelectedAssets = { ...state.selectedAssets }
                delete updatedSelectedAssets[relation.to.id]
                return { selectedAssets: updatedSelectedAssets }
            })
        } else {
            get().setAssetSelected(relation)
        }
    },
    setAssetSelected: (relation: TbRelation) => {
        const assetId = relation.to.id
        const children = relation.children ?? []

        set(state => ({
            selectedAssets: {
                ...state.selectedAssets,
                [assetId]: children,
            },
        }))
    },

    clearAssetsSelected: () => {
        set({ selectedAssets: {} })
    },
}))

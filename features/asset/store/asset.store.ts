import { create } from 'zustand'
import { TbRelation } from '@/lib/thingsboard/thingsboard.types'
import { useDeviceStore } from '@/features/devices/store/device.store'

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

    isAssetSelected: assetId => assetId in get().selectedAssets,

    toggleAssetSelected: relation => {
        const assetId = relation.to.id
        const isSelected = get().isAssetSelected(assetId)

        if (isSelected) {
            useDeviceStore.getState().clearDevicesByAsset(assetId)

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
                relation.fromName ??
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
        useDeviceStore.getState().clearAllDevices()
    },
}))

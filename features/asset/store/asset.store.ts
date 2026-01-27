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
    loadingAssets: Record<string, boolean>
    processedAssets: Set<string>

    isAssetSelected: (assetId: string) => boolean
    toggleAssetSelected: (relation: TbRelation) => void
    setAssetSelected: (relation: TbRelation) => void
    clearAssetsSelected: () => void
}

export const useAssetStore = create<AssetState>((set, get) => ({
    selectedAssets: {},
    loadingAssets: {},
    processedAssets: new Set(),

    isAssetSelected: assetId => assetId in get().selectedAssets,

    toggleAssetSelected: (relation) => {
        const assetId = relation.to.id
        const isSelected = get().isAssetSelected(assetId)

        if (isSelected) {
            useDeviceStore.getState().clearDevicesByAsset(assetId)

            set(state => {
                const next = { ...state.selectedAssets }
                delete next[assetId]

                const newProcessed = new Set(state.processedAssets)
                newProcessed.delete(assetId)

                return {
                    selectedAssets: next,
                    processedAssets: newProcessed
                }
            })
        } else {
            get().setAssetSelected(relation)
        }
    },

    setAssetSelected: (relation) => {
        const assetId = relation.to.id

        if (get().processedAssets.has(assetId)) {
            return
        }

        try {
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
                    [assetId]: selectedAsset,
                },
                processedAssets: new Set(state.processedAssets).add(assetId)
            }))

            const deviceRelations = relation.children?.filter(
                rel => rel.to.entityType === 'DEVICE'
            ) ?? []

            const defaultDevices = deviceRelations.filter(
                dev => dev.additionalInfo?.default === true
            )

            const deviceStore = useDeviceStore.getState()

            defaultDevices.forEach(deviceRel => {
                const deviceId = deviceRel.to.id
                const deviceName = deviceRel.toName || deviceRel.additionalInfo?.name || deviceId

                if (!deviceStore.selectedDevices.find(d => d.id === deviceId)) {
                    deviceStore.addDevice({
                        id: deviceId,
                        name: deviceName,
                        assetId: assetId,
                        assetName: relation.additionalInfo?.name ?? relation.toName ?? assetId,
                    })
                }
            })

        } catch (error) {
            console.error('Error processing devices for asset:', error)
        }
    },

    clearAssetsSelected: () => {
        set({ selectedAssets: {}, loadingAssets: {}, processedAssets: new Set() })
        useDeviceStore.getState().clearAllDevices()
    },
}))
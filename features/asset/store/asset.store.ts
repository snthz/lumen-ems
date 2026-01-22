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

    isAssetSelected: (assetId: string) => boolean
    toggleAssetSelected: (relation: TbRelation) => void
    setAssetSelected: (relation: TbRelation) => void
    clearAssetsSelected: () => void
}

export const useAssetStore = create<AssetState>((set, get) => ({
    selectedAssets: {},
    loadingAssets: {},

    isAssetSelected: assetId => assetId in get().selectedAssets,

    toggleAssetSelected: (relation) => {
        const assetId = relation.to.id
        const isSelected = get().isAssetSelected(assetId)

        if (isSelected) {
            // Des-seleccionar: limpiar devices de este asset
            useDeviceStore.getState().clearDevicesByAsset(assetId)

            set(state => {
                const next = { ...state.selectedAssets }
                delete next[assetId]
                return { selectedAssets: next }
            })
        } else {
            // Seleccionar: auto-seleccionar devices
            get().setAssetSelected(relation)
        }
    },

    setAssetSelected: (relation) => {
        const assetId = relation.to.id

        try {
            // Agregar asset a seleccionados
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
            }))

            // ✅ Los devices ya están en relation.children (estructura recursiva)
            const deviceRelations = relation.children?.filter(
                rel => rel.to.entityType === 'DEVICE'
            ) ?? []

            // ✅ Auto-seleccionar devices con default: true
            const defaultDevices = deviceRelations.filter(
                dev => dev.additionalInfo?.default === true
            )

            const deviceStore = useDeviceStore.getState()

            defaultDevices.forEach(deviceRel => {
                const deviceId = deviceRel.to.id
                const deviceName = deviceRel.toName || deviceRel.additionalInfo?.name || deviceId

                // Solo agregar si no está ya seleccionado
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
        set({ selectedAssets: {}, loadingAssets: {} })
        useDeviceStore.getState().clearAllDevices()
    },
}))
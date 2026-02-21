import { create } from 'zustand'
import { TbRelation } from '@/lib/thingsboard/thingsboard.types'
import { useDeviceStore } from '@/features/devices/store/device.store'
import { toast } from 'sonner'

type SelectedAsset = TbRelation & {
    parentId: string
    parentType: string
    parentName: string
}

interface AssetState {
    selectedAssets: Record<string, SelectedAsset>
    loadingAssets: Record<string, boolean>
    processedAssets: Set<string>
    activeGroupLabel: string | null

    isAssetSelected: (assetId: string) => boolean
    toggleAssetSelected: (relation: TbRelation, groupLabel?: string) => void
    setAssetSelected: (relation: TbRelation, groupLabel?: string) => void
    clearAssetsSelected: () => void
}

export const useAssetStore = create<AssetState>((set, get) => ({
    selectedAssets: {},
    loadingAssets: {},
    processedAssets: new Set(),
    activeGroupLabel: null,

    isAssetSelected: assetId => assetId in get().selectedAssets,

    toggleAssetSelected: (relation, groupLabel) => {
        const assetId = relation.to.id
        const isSelected = get().isAssetSelected(assetId)

        if (isSelected) {
            useDeviceStore.getState().clearDevicesByAsset(assetId)

            set(state => {
                const next = { ...state.selectedAssets }
                delete next[assetId]

                const newProcessed = new Set(state.processedAssets)
                newProcessed.delete(assetId)

                const hasRemaining = Object.keys(next).length > 0

                return {
                    selectedAssets: next,
                    processedAssets: newProcessed,
                    activeGroupLabel: hasRemaining ? state.activeGroupLabel : null,
                }
            })
        } else {
            // Check cross-group restriction
            const { activeGroupLabel: current, selectedAssets } = get()
            if (groupLabel && current && current !== groupLabel && Object.keys(selectedAssets).length > 0) {
                toast.warning(
                    `Solo puedes seleccionar sitios de un grupo a la vez. Actualmente tienes sitios seleccionados de "${current}".`,
                    {
                        duration: 6000,
                        action: {
                            label: 'Entendido',
                            onClick: () => {},
                        },
                    }
                )
                return
            }
            get().setAssetSelected(relation, groupLabel)
        }
    },

    setAssetSelected: (relation, groupLabel) => {
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
                processedAssets: new Set(state.processedAssets).add(assetId),
                activeGroupLabel: groupLabel ?? state.activeGroupLabel,
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
                const deviceName = deviceRel.additionalInfo?.name || deviceRel.toName || deviceId

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
        set({ selectedAssets: {}, loadingAssets: {}, processedAssets: new Set(), activeGroupLabel: null })
        useDeviceStore.getState().clearAllDevices()
    },
}))
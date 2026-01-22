import { create } from 'zustand'

export interface SelectedDevice {
    id: string
    name: string
}

interface DeviceState {
    /**
     * assetId -> deviceId -> SelectedDevice
     */
    selectedDevices: Record<string, Record<string, SelectedDevice>>

    toggleDevice: (
        assetId: string,
        device: SelectedDevice
    ) => void

    clearDevicesByAsset: (assetId: string) => void
    clearAllDevices: () => void
}

export const useDeviceStore = create<DeviceState>((set) => ({
    selectedDevices: {},

    toggleDevice: (assetId, device) =>
        set((state) => {
            const assetDevices =
                state.selectedDevices[assetId] ?? {}

            const nextAssetDevices = { ...assetDevices }

            if (nextAssetDevices[device.id]) {
                // 🔴 ya existe → deseleccionar
                delete nextAssetDevices[device.id]
            } else {
                // 🟢 no existe → seleccionar
                nextAssetDevices[device.id] = device
            }

            return {
                selectedDevices: {
                    ...state.selectedDevices,
                    [assetId]: nextAssetDevices,
                },
            }
        }),

    clearDevicesByAsset: (assetId) =>
        set((state) => {
            if (!state.selectedDevices[assetId]) {
                return state
            }

            const next = { ...state.selectedDevices }
            delete next[assetId]

            return { selectedDevices: next }
        }),

    clearAllDevices: () =>
        set({ selectedDevices: {} }),
}))

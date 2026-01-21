import { create } from 'zustand'

interface DeviceState {
    selectedDevices: Record<string, Record<string, true>>

    toggleDevice: (assetId: string, deviceId: string) => void
    clearDevicesByAsset: (assetId: string) => void
    clearAllDevices: () => void
}

export const useDeviceStore = create<DeviceState>(set => ({
    selectedDevices: {},

    toggleDevice: (assetId, deviceId) =>
        set(state => {
            const assetDevices = state.selectedDevices[assetId] ?? {}

            const nextAssetDevices = { ...assetDevices }

            if (nextAssetDevices[deviceId]) {
                delete nextAssetDevices[deviceId]
            } else {
                nextAssetDevices[deviceId] = true
            }

            return {
                selectedDevices: {
                    ...state.selectedDevices,
                    [assetId]: nextAssetDevices,
                },
            }
        }),

    clearDevicesByAsset: assetId =>
        set(state => {
            const next = { ...state.selectedDevices }
            delete next[assetId]
            return { selectedDevices: next }
        }),

    clearAllDevices: () =>
        set({ selectedDevices: {} }),
}))

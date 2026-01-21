import { create } from 'zustand'

interface DeviceState {
    selectedDeviceId: string | null
    toggleDevice: (deviceId: string) => void
}

export const useDeviceStore = create<DeviceState>(set => ({
    selectedDeviceId: null,
    toggleDevice: deviceId =>
        set(state => ({
            selectedDeviceId:
                state.selectedDeviceId === deviceId ? null : deviceId,
        })),
}))

import { create } from 'zustand'

export interface SelectedDevice {
    id: string
    name: string
    assetId: string
    assetName: string
}

interface DeviceState {
    /**
     * Lista plana de devices seleccionados
     */
    selectedDevices: SelectedDevice[]

    /**
     * Agregar un device (evita duplicados)
     */
    addDevice: (device: SelectedDevice) => void

    /**
     * Remover un device por ID
     */
    removeDevice: (deviceId: string) => void

    /**
     * Toggle device (agregar si no existe, remover si existe)
     */
    toggleDevice: (device: SelectedDevice) => void

    /**
     * Limpiar todos los devices de un asset específico
     */
    clearDevicesByAsset: (assetId: string) => void

    /**
     * Limpiar todos los devices
     */
    clearAllDevices: () => void

    /**
     * Verificar si un device está seleccionado
     */
    isDeviceSelected: (deviceId: string) => boolean

    /**
     * Obtener devices de un asset específico
     */
    getDevicesByAsset: (assetId: string) => SelectedDevice[]
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
    selectedDevices: [],

    addDevice: (device) =>
        set((state) => {
            // Evitar duplicados
            if (state.selectedDevices.find(d => d.id === device.id)) {
                return state
            }

            return {
                selectedDevices: [...state.selectedDevices, device]
            }
        }),

    removeDevice: (deviceId) =>
        set((state) => ({
            selectedDevices: state.selectedDevices.filter(d => d.id !== deviceId)
        })),

    toggleDevice: (device) =>
        set((state) => {
            const exists = state.selectedDevices.find(d => d.id === device.id)

            if (exists) {
                // Ya existe → remover
                return {
                    selectedDevices: state.selectedDevices.filter(d => d.id !== device.id)
                }
            } else {
                // No existe → agregar
                return {
                    selectedDevices: [...state.selectedDevices, device]
                }
            }
        }),

    clearDevicesByAsset: (assetId) =>
        set((state) => ({
            selectedDevices: state.selectedDevices.filter(d => d.assetId !== assetId)
        })),

    clearAllDevices: () =>
        set({ selectedDevices: [] }),

    isDeviceSelected: (deviceId) =>
        get().selectedDevices.some(d => d.id === deviceId),

    getDevicesByAsset: (assetId) =>
        get().selectedDevices.filter(d => d.assetId === assetId),
}))
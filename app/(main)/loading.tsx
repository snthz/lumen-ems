export default function Loading() {
    return (
        <div className="flex fixed top-0 left-0 h-screen w-full z-50 bg-white/70 backdrop-blur-md">
            <div className="m-auto flex flex-col items-center gap-3">
                <div className="h-8 w-8 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                <span className="text-sm text-neutral-500">Cargando...</span>
            </div>
        </div>
    )
}
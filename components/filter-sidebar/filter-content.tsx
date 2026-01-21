import {DevicesHierarchy} from "@/features/devices/components/devices-hierarchy";

export function FilterContent() {

    return (
        <div >
            <div className={"px-6"}>
                <span>Filtros</span>
            </div>
            <DevicesHierarchy/>
        </div>
    )
}
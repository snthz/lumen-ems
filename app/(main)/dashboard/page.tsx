import {FilterSidebar} from "@/components/filter-sidebar/filter-sidebar";
import {Chart} from "@/features/chart/component/chart";

export default function Page() {
    return (
        <div className="flex relative h-[calc(100vh-69px)] w-full ">
                <div className={"flex-1 pt-4 px-6"}>
                    <div className={"p-2 shadow-md border rounded-lg"}>
                        <Chart/>
                    </div>
                </div>
                <FilterSidebar/>
        </div>
    )
}

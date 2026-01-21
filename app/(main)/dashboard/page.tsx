import {FilterSidebar} from "@/components/filter-sidebar/filter-sidebar";

export default function Page() {
    return (
        <div className="flex relative min-h-screen w-full ">
                <div className={"flex-1 pt-4 px-6"}>
                    Dashboard Home Page
                </div>
                <FilterSidebar/>
        </div>
    )
}

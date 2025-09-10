import { Plus, SidebarClose, MousePointerClickIcon, Globe } from "lucide-react";

const Menubar = () => {
    return (
    <div className="w-[300px] flex-shrink-0 h-full bg-dark0 border-l border-dark2 flex flex-col p-4 justify-between">
        <div className="flex flex-col w-full">
            <div className="justify-between flex items-center p-2 text-white rounded">
                <div className="flex items-center gap-2">
                    Add Options
                    <Plus size={20} />
                </div>
                <SidebarClose size={20} className="rotate-180 hover:bg-dark2 cursor-pointer" />
            </div>
            <div className="flex flex-row flex-wrap rounded gap-2 justify-center">
                <a className=" w-28 flex flex-col items-center gap-2 p-2 rounded text-white hover:bg-dark2 cursor-pointer">
                    <Globe size={50} /> Browse
                </a>
                <a className=" w-28 flex flex-col items-center text-center gap-2 p-2 rounded text-white hover:bg-dark2 cursor-pointer">
                    <MousePointerClickIcon size={50} /> Mouse Event
                </a>
            </div>
        </div>
    </div>
    );
};

export default Menubar;
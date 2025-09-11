import { Plus, SidebarClose, MousePointerClickIcon, Globe } from "lucide-react";
import { useState } from "react";


const Menubar = () => {
    const [isOpen, setIsOpen] = useState(false);
    if (isOpen) {
    return (
    <div className="w-[300px] flex-shrink-0 h-full bg-dark0 border-l border-dark2 flex flex-col p-4 justify-between">
        <div className="flex flex-col w-full gap-2">
            <div className="justify-end flex items-center text-white rounded">
                <SidebarClose size={20} className="rotate-180 hover:bg-dark2 cursor-pointer" onClick={() => setIsOpen(false)} />
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
    }
    else {
    return(
        <div className="w-[50px] flex-shrink-0 h-full bg-dark0 border-l border-dark2 flex flex-col p-4">
            <SidebarClose size={20} className="hover:bg-dark2 cursor-pointer text-white" onClick={() => setIsOpen(true)} />
        </div>
    )
    }

};

export default Menubar;
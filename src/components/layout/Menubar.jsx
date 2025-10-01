import { Plus, SidebarClose, MousePointerClickIcon, Globe, Play, Square, Car } from "lucide-react";
import { useState } from "react";
import DraggableCard from "../common/DraggableCard";


const Menubar = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    if (isOpen) {
    return (
    <div className="w-[300px] flex-shrink-0 h-full bg-dark0 border-l border-dark2 flex flex-col p-4 justify-between">
        <div className="flex flex-col w-full gap-2">
            <div className="justify-end flex items-center text-white rounded">
                <SidebarClose size={20} className="rotate-180 hover:bg-dark2 cursor-pointer" onClick={() => setIsOpen(false)} />
            </div>

            <div>
                <h4 className="text-white font-semibold mb-3 text-sm">Task Components</h4>
                <div className="flex flex-row flex-wrap rounded gap-2 justify-center">
                    <DraggableCard icon={Globe} size={50} name="Browse" iconKey="Globe"/>
                    <DraggableCard icon={MousePointerClickIcon} size={50} name="Click" iconKey="MousePointerClickIcon"/>
                </div>
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
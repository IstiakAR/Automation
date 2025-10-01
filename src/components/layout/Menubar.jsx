import { Plus, SidebarClose, MousePointerClickIcon, Globe, Play, Square } from "lucide-react";
import { useState } from "react";


const Menubar = ({ addNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    if (isOpen) {
    return (
    <div className="w-[300px] flex-shrink-0 h-full bg-dark0 border-l border-dark2 flex flex-col p-4 justify-between">
        <div className="flex flex-col w-full gap-2">
            <div className="justify-end flex items-center text-white rounded">
                <SidebarClose size={20} className="rotate-180 hover:bg-dark2 cursor-pointer" onClick={() => setIsOpen(false)} />
            </div>
            
            {/* Node Addition Section */}
            <div className="mb-4">
                <h4 className="text-white font-semibold mb-3 text-sm">Add Nodes</h4>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => addNode && addNode('startNode')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                    >
                        <Play size={16} />
                        Start Node
                    </button>
                    
                    <button
                        onClick={() => addNode && addNode('taskNode')}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9,11 12,14 22,4"></polyline>
                            <path d="m21,12c0,4.97 -4.03,9 -9,9s-9,-4.03 -9,-9 4.03,-9 9,-9c1.09,0 2.13,0.2 3.09,0.56"></path>
                        </svg>
                        Task Node
                    </button>

                    <button
                        onClick={() => addNode && addNode('addTaskNode')}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm border-2 border-dashed border-gray-500"
                    >
                        <Plus size={16} />
                        Placeholder
                    </button>
                    
                    <button
                        onClick={() => addNode && addNode('endNode')}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                    >
                        <Square size={16} />
                        End Node
                    </button>
                </div>
            </div>
            
            {/* Original Task Components */}
            <div>
                <h4 className="text-white font-semibold mb-3 text-sm">Task Components</h4>
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
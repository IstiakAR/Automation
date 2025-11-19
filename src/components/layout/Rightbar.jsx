import { SidebarClose, ChevronDown, Plus } from "lucide-react";
import DraggableCard from "../common/DraggableCard";
import { useRightbar } from "../../hooks/useRightbar";
import { RightbarCards } from "../../data/rightbarCards";

const Rightbar = () => {
    const {
        isOpen,
        filter,
        groupedCards,
        collapsedSections,
        handleFilter,
        toggleSection,
        toggleRightbar
    } = useRightbar(RightbarCards);
    
    if (isOpen) {
    return (
    <div className="w-[300px] flex-shrink-0 h-full bg-dark0 border-l border-dark2 flex flex-col p-4">
        <div className="flex flex-col w-full gap-2 h-full min-h-0">
            <div className="flex flex-row items-center justify-between mb-4">
                <input type="text" placeholder="Search..." value={filter} className="bg-dark2 text-white rounded p-2" onChange={handleFilter}/>
                <div className="justify-end flex items-center text-white rounded">
                    <SidebarClose size={20} className="rotate-180 hover:bg-dark2 cursor-pointer" onClick={toggleRightbar} />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
            {Object.entries(groupedCards).map(([section, cards]) => (
                <div key={section} className="mb-6">
                <div className="flex flex-row justify-between items-center cursor-pointer mb-2" onClick={() => toggleSection(section)}>
                    <div className="flex flex-row items-center gap-2">
                        <h3 className="text-white font-semibold">{section}</h3>
                        <span className="text-gray-300 bg-slate-500 rounded-full w-5 h-5 flex items-center justify-center">{cards.length}</span>
                    </div>
                    {collapsedSections[section] ?
                        <ChevronDown className="text-white" size={25}/>
                        : 
                        <Plus className="text-white" size={25}/>
                    }
                </div>
                {!collapsedSections[section] && (
                <div className="flex flex-row flex-wrap gap-2 justify-center">
                    {cards.map((card, index) => (
                    <DraggableCard key={index} {...card} />
                    ))}
                </div>
                )}
                </div>
            ))}
            </div>
        </div>
    </div>
    );
    }
    else {
    return(
        <div className="w-[50px] flex-shrink-0 h-full bg-dark0 border-l border-dark2 flex flex-col p-4 pt-6 overflow-hidden">
            <SidebarClose size={20} className="hover:bg-dark2 cursor-pointer text-white" onClick={toggleRightbar} />
        </div>
    )
    }
};

export default Rightbar;
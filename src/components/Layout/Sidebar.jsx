import { Settings, FileText, FolderKanban, ChevronsUpDown, SidebarClose } from "lucide-react";
import { useState } from "react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  
  if (isOpen) {
    return (
      <div className="w-64 h-full bg-dark0 border-r border-dark2 flex flex-col p-4 justify-between">
        <div className="flex flex-col w-full">
          <div className="flex justify-start mb-2">
            <SidebarClose size={20} className="text-white hover:bg-dark2 cursor-pointer" onClick={() => setIsOpen(false)} />
          </div>
          <a className="flex items-center justify-between gap-2 p-2 text-white rounded hover:bg-dark2 cursor-pointer">
            <div className="flex items-center gap-2">
              <FolderKanban size={20} /> Workspace
            </div>
            <ChevronsUpDown size={16} />
          </a>
          <div className="ml-5 flex flex-col rounded">
            <a className="flex items-center gap-2 p-2 rounded text-white hover:bg-dark2 cursor-pointer">
              <FileText size={20} /> Tasks
            </a>
            <a className="flex items-center gap-2 p-2 rounded text-white hover:bg-dark2 cursor-pointer">
              <FileText size={20} /> Tasks
            </a>
          </div>
        </div>
        <a className="flex items-center gap-2 rounded hover:bg-dark2 cursor-pointer text-white">
          <Settings size={18} /> Settings
        </a>
      </div>
    );
  } else {
    return (
      <div className="w-[50px] flex-shrink-0 h-full bg-dark0 border-r border-dark2 flex flex-col p-4 justify-between">
        <SidebarClose size={20} className="rotate-180 hover:bg-dark2 cursor-pointer text-white" onClick={() => setIsOpen(true)} />
        <a className="flex items-center rounded hover:bg-dark2 cursor-pointer text-white">
          <Settings size={26} />
        </a>
      </div>
    );
  }
};

export default Sidebar;

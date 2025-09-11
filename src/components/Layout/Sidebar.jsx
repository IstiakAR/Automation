import { Settings, FileText, FolderKanban, ChevronsUpDown, SidebarClose, Gauge } from "lucide-react";
import { useState } from "react";

const Sidebar = ({ logOpen, setLogOpen }) => {
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
        <div className="flex flex-col items-start">
          <div className="w-full h-10 flex items-center gap-2 rounded text-white hover:bg-dark2 cursor-pointer" onClick={() => setLogOpen(!logOpen)}>
            <Gauge size={20} /> Monitor
          </div>
          <div className="w-full h-10 flex items-center gap-2 rounded text-white hover:bg-dark2 cursor-pointer" onClick={() => setLogOpen(!logOpen)}>
            <Settings size={20} /> Settings
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-[55px] flex-shrink-0 h-full bg-dark0 border-r border-dark2 flex flex-col p-4 justify-between">
        <SidebarClose size={20} className="rotate-180 hover:bg-dark2 cursor-pointer text-white" onClick={() => setIsOpen(true)} />
        <div className="flex flex-col items-center">
          <div className="h-10 flex items-center rounded hover:bg-dark2 cursor-pointer text-white" onClick={() => setLogOpen(!logOpen)}>
            <Gauge size={20} />
          </div>
          <div className="h-10 flex items-center rounded hover:bg-dark2 cursor-pointer text-white" onClick={() => setLogOpen(!logOpen)}>
            <Settings size={20} />
          </div>
        </div>
      </div>
    );
  }
};

export default Sidebar;

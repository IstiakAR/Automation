import { Settings, FileText, Workflow, ChevronsUpDown } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="w-64 h-full bg-dark0 border-r border-dark2 flex flex-col p-4 justify-between">
      <div className="flex flex-col w-full">
        <a className="flex items-center justify-between gap-2 p-2 text-white rounded hover:bg-dark2 cursor-pointer">
          <div className="flex items-center gap-2">
            <Workflow size={20} /> Workspace
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
      <a className="flex items-center gap-2 p-2 rounded hover:bg-dark2 cursor-pointer text-white">
        <Settings size={20} /> Settings
      </a>
    </div>
  );
};

export default Sidebar;

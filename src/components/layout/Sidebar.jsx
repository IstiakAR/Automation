import { Settings, FileText, FolderKanban, ChevronsUpDown, SidebarClose, Gauge, Plus, Check, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "../../hooks/useWorkspace";
import WorkspaceCreateMenu from "../common/WorkspaceCreateMenu";

const Sidebar = ({ logOpen, setLogOpen }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [inlineTaskName, setInlineTaskName] = useState("");
  const {
    workspaces,
    activeWorkspace,
    showWorkspaceDropdown,
    showCreateMenu,
    showInlineTaskInput,
    handleWorkspaceSelect,
    createWorkspace,
    createTaskInline,
    deleteTask,
    toggleWorkspaceDropdown,
    toggleCreateMenu,
    toggleInlineTaskInput
  } = useWorkspace();
  
  if (isOpen) {
    return (
      <div className="relative w-64 h-full bg-dark0 border-r border-dark2 flex flex-col p-4 justify-between">
        <div className="flex flex-col w-full">
          <div 
            className="flex items-center justify-between gap-2 p-2 text-white rounded hover:bg-dark2 cursor-pointer"
            onClick={toggleWorkspaceDropdown}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-white">
                <FolderKanban />
              </div>
              <span className="truncate">{activeWorkspace.name}</span>
            </div>
            <ChevronsUpDown size={16} className="flex-shrink-0" />
          </div>

          {/* Workspace Dropdown */}
          {showWorkspaceDropdown && (
            <div className="absolute top-14 left-4 right-4 bg-dark1 border border-dark2 rounded-md shadow-lg z-50">
              <div className="p-2">
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className="flex items-center justify-between gap-2 p-2 rounded hover:bg-dark2 cursor-pointer text-white"
                    onClick={() => handleWorkspaceSelect(workspace)}
                  >
                    <div className="flex items-center gap-2 overflow-clip">
                      <div className="min-w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-black bg-white">
                        {workspace.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{workspace.name}</span>
                    </div>
                    {workspace.id === activeWorkspace.id && (
                      <Check size={16} className="text-green-400 min-w-4" />
                    )}
                  </div>
                ))}
                <hr className="border-dark2 my-2" />
                <div 
                  className="flex items-center gap-2 p-2 rounded hover:bg-dark2 cursor-pointer text-white"
                  onClick={toggleCreateMenu}
                >
                  <Plus size={16} />
                  <span>Create new</span>
                </div>
              </div>
            </div>
          )}

          <div className="ml-4 flex flex-col rounded">
            <div className="flex items-center justify-between mb-2 p-1.5">
              <h4 className="text-gray-400 text-sm font-medium">Tasks</h4>
              <button
                onClick={toggleInlineTaskInput}
                title="Add new task"
                className="flex items-center justify-center p-[2px] text-gray-400 hover:text-white"
              >
                <Plus size={16} />
              </button>
            </div>
            
            {showInlineTaskInput && (
              <div className="mb-2 p-1.5">
                <input
                  type="text"
                  value={inlineTaskName}
                  onChange={(e) => setInlineTaskName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inlineTaskName.trim()) {
                      createTaskInline(inlineTaskName.trim());
                      setInlineTaskName("");
                    } else if (e.key === 'Escape') {
                      setInlineTaskName("");
                      toggleInlineTaskInput();
                    }
                  }}
                  onBlur={() => {
                    if (inlineTaskName.trim()) {
                      createTaskInline(inlineTaskName.trim());
                      setInlineTaskName("");
                    } else {
                      toggleInlineTaskInput();
                    }
                  }}
                  placeholder="Task name..."
                  className="w-full px-2 py-1 text-sm bg-dark2 text-white border border-dark2 rounded focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>
            )}
            
            {activeWorkspace.tasks && activeWorkspace.tasks.length > 0 ? (
              activeWorkspace.tasks.map((task) => (
                <div key={task.id}
                  className="flex items-center justify-between gap-2 p-2 rounded text-white hover:bg-dark2 cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileText size={16} />
                    <span className="truncate text-sm">{task.name}</span>
                  </div>
                  <Trash2 
                    size={16} 
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 cursor-pointer flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    title="Delete task"
                  />
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm italic p-2">
                No tasks in this workspace
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start">
          <div
            className="w-full h-10 flex items-center gap-2 rounded text-white hover:bg-dark2 cursor-pointer"
            onClick={() => setLogOpen(!logOpen)}
          >
            <Gauge size={20} /> Monitor
          </div>
          <div
            className="w-full h-10 flex items-center gap-2 rounded text-white hover:bg-dark2 cursor-pointer"
            onClick={() => setLogOpen(!logOpen)}
          >
            <Settings size={20} /> Settings
          </div>
        </div>
        <div className="absolute z-50 bg-dark1 hover:bg-dark2 cursor-pointer top-0 -right-10 p-2 flex items-center justify-center text-white rounded-sm border-dark2 border-r border-b">
        <SidebarClose
          size={22}
          onClick={() => setIsOpen(false)}
        />
        </div>
        <WorkspaceCreateMenu 
          isOpen={showCreateMenu}
          onClose={toggleCreateMenu}
          onCreateWorkspace={createWorkspace}
        />
      </div>
    );
  } else {
    return (
      <>
        <div className="w-[55px] flex-shrink-0 h-full bg-dark0 border-r border-dark2 flex flex-col p-4 justify-between">
          <SidebarClose
            size={20}
            className="rotate-180 hover:bg-dark2 cursor-pointer text-white"
            onClick={() => setIsOpen(true)}
          />
          <div className="flex flex-col items-center">
            <div
              className="h-10 flex items-center rounded hover:bg-dark2 cursor-pointer text-white"
              onClick={() => setLogOpen(!logOpen)}
            >
              <Gauge size={20} />
            </div>
            <div
              className="h-10 flex items-center rounded hover:bg-dark2 cursor-pointer text-white"
              onClick={() => setLogOpen(!logOpen)}
            >
              <Settings size={20} />
            </div>
          </div>
        </div>
        <WorkspaceCreateMenu 
          isOpen={showCreateMenu}
          onClose={toggleCreateMenu}
          onCreateWorkspace={createWorkspace}
        />
      </>
    );
  }
};

export default Sidebar;

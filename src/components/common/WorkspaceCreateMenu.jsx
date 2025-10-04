import { useState } from "react";
import { X, Plus } from "lucide-react";

const WorkspaceCreateMenu = ({ isOpen, onClose, onCreateWorkspace }) => {
  const [workspaceName, setWorkspaceName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (workspaceName.trim()) {
      onCreateWorkspace(workspaceName.trim());
      setWorkspaceName("");
    }
  };

  const handleClose = () => {
    setWorkspaceName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark1 border border-dark2 rounded-lg p-6 w-96 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-semibold">Create Workspace</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Workspace Name
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full p-3 bg-dark2 text-white rounded border border-dark2 focus:border-white focus:outline-none"
              placeholder="Enter workspace name..."
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={!workspaceName.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              Create Workspace
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkspaceCreateMenu;
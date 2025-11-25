import { useEffect, useState } from "react";
import { nanoid } from 'nanoid';
import { invoke } from "@tauri-apps/api/core";

const initialWorkspaces = [];

export const useWorkspace = ({ setSelectedTaskId } = {}) => {
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [activeWorkspace, setActiveWorkspace] = useState(
    initialWorkspaces.find(w => w.active) || initialWorkspaces[0]
  );
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showInlineTaskInput, setShowInlineTaskInput] = useState(false);

  useEffect(() => {
    const loadWorkspacesAndFlows = async () => {
      try {
        const ws = await invoke("list_workspaces");
        let workspacesWithTasks = [];

        for (const w of ws) {
          const flows = await invoke("list_flows_for_workspace", { workspaceId: w.id });
          workspacesWithTasks.push({
            id: w.id,
            name: w.name,
            active: false,
            tasks: flows.map((f) => ({
              id: f.id,
              name: f.name,
              createdAt: new Date().toISOString(),
            })),
          });
        }

        if (workspacesWithTasks.length !== 0) {
          workspacesWithTasks[0].active = true;
        }

        setWorkspaces(workspacesWithTasks);
        setActiveWorkspace(workspacesWithTasks[0]);
      } catch (error) {
        console.error("Error loading workspaces:", error);
      }
    };

    loadWorkspacesAndFlows();
  }, []);

  const handleWorkspaceSelect = async (workspace) => {
    const updatedWorkspaces = workspaces.map(w => ({
      ...w,
      active: w.id === workspace.id
    }));
    setWorkspaces(updatedWorkspaces);
    setActiveWorkspace(workspace);
    setShowWorkspaceDropdown(false);
    setSelectedTaskId(0);
  };

  const createWorkspace = async (name) => {
    const newWorkspace = {
      id: nanoid(),
      name,
      active: false,
      tasks: []
    };
    try {
      await invoke("upsert_workspace", { id: newWorkspace.id, name: newWorkspace.name });
    } catch (error) {
      console.error("Error creating workspace in DB:", error);
    }
    setWorkspaces(prev => [...prev, newWorkspace]);
    setShowCreateMenu(false);
    if (setSelectedTaskId) {
      setSelectedTaskId(0);
    }
  };

  const createTaskInline = (taskName, workspaceId = activeWorkspace.id) => {
    const newTask = {
      id: nanoid(),
      name: taskName,
      createdAt: new Date().toISOString()
    };

    setWorkspaces(prev => prev.map(workspace => 
      workspace.id === workspaceId 
        ? { ...workspace, tasks: [...workspace.tasks, newTask] }
        : workspace
    ));

    if (workspaceId === activeWorkspace.id) {
    setActiveWorkspace(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTask].sort((a, b) => a.name.localeCompare(b.name))
    }));
    }

    setShowInlineTaskInput(false);
  };

  const deleteTask = (taskId, workspaceId = activeWorkspace.id) => {
    setWorkspaces(prev => prev.map(workspace => 
      workspace.id === workspaceId 
        ? { ...workspace, tasks: workspace.tasks.filter(task => task.id !== taskId) }
        : workspace
    ));

    if (workspaceId === activeWorkspace.id) {
      setActiveWorkspace(prev => ({
        ...prev,
        tasks: prev.tasks.filter(task => task.id !== taskId)
      }));
      invoke("delete_flow", { id: taskId }).catch((e) =>
        console.error("Error deleting flow from DB:", e)
      );
    }
  };

  const getWorkspaceTasks = (workspaceId) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    return workspace ? workspace.tasks : [];
  };

  const deleteWorkspace = (workspaceId) => {
    if (workspaces.length <= 1) return;
    
    const updatedWorkspaces = workspaces.filter(w => w.id !== workspaceId);
    setWorkspaces(updatedWorkspaces);
    
    if (activeWorkspace.id === workspaceId) {
      const newActive = updatedWorkspaces[0];
      setActiveWorkspace(newActive);
    }
  };

  const toggleWorkspaceDropdown = () => {
    setShowWorkspaceDropdown(!showWorkspaceDropdown);
    setShowCreateMenu(false);
  };

  const toggleCreateMenu = () => {
    setShowCreateMenu(!showCreateMenu);
    setShowWorkspaceDropdown(false);
  };


  const toggleInlineTaskInput = () => {
    setShowInlineTaskInput(!showInlineTaskInput);
  };

  return {
    workspaces,
    activeWorkspace,
    showWorkspaceDropdown,
    showCreateMenu,
    showInlineTaskInput,
    handleWorkspaceSelect,
    createWorkspace,
    createTaskInline,
    deleteTask,
    getWorkspaceTasks,
    deleteWorkspace,
    toggleWorkspaceDropdown,
    toggleCreateMenu,
    toggleInlineTaskInput
  };
};
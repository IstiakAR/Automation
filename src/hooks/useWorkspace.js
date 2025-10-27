import { useState } from "react";
import { nanoid } from 'nanoid'

const initialWorkspaces = [
  { 
    id: 1, 
    name: "Personal", 
    active: true,
    tasks: [
      { id: 1, name: "Personal Task 1", createdAt: new Date().toISOString() },
      { id: 2, name: "Personal Task 2", createdAt: new Date().toISOString() }
    ]
  },
  { 
    id: 2, 
    name: "Istiak Ahammed Rhyme's team", 
    active: false,
    tasks: [
      { id: 3, name: "Team Task 1", createdAt: new Date().toISOString() }
    ]
  },
  { 
    id: 3, 
    name: "Work Project", 
    active: false,
    tasks: []
  },
];

export const useWorkspace = () => {
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [activeWorkspace, setActiveWorkspace] = useState(
    initialWorkspaces.find(w => w.active) || initialWorkspaces[0]
  );
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showInlineTaskInput, setShowInlineTaskInput] = useState(false);

  const handleWorkspaceSelect = (workspace) => {
    const updatedWorkspaces = workspaces.map(w => ({
      ...w,
      active: w.id === workspace.id
    }));
    setWorkspaces(updatedWorkspaces);
    setActiveWorkspace(workspace);
    setShowWorkspaceDropdown(false);
  };

  const createWorkspace = (name) => {
    const newWorkspace = {
      id: crypto.randomUUID(),
      name,
      active: false,
      tasks: []
    };
    setWorkspaces(prev => [...prev, newWorkspace]);
    setShowCreateMenu(false);
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

    // Update active workspace if task was deleted from it
    if (workspaceId === activeWorkspace.id) {
      setActiveWorkspace(prev => ({
        ...prev,
        tasks: prev.tasks.filter(task => task.id !== taskId)
      }));
    }
  };

  const getWorkspaceTasks = (workspaceId) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    return workspace ? workspace.tasks : [];
  };

  const deleteWorkspace = (workspaceId) => {
    if (workspaces.length <= 1) return; // Don't delete the last workspace
    
    const updatedWorkspaces = workspaces.filter(w => w.id !== workspaceId);
    setWorkspaces(updatedWorkspaces);
    
    // If deleted workspace was active, switch to first available
    if (activeWorkspace.id === workspaceId) {
      const newActive = updatedWorkspaces[0];
      setActiveWorkspace(newActive);
    }
  };

  const toggleWorkspaceDropdown = () => {
    setShowWorkspaceDropdown(!showWorkspaceDropdown);
    setShowCreateMenu(false); // Close create menu when opening dropdown
  };

  const toggleCreateMenu = () => {
    setShowCreateMenu(!showCreateMenu);
    setShowWorkspaceDropdown(false); // Close dropdown when opening create menu
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
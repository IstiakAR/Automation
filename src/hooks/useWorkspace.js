import { useState } from "react";
import { nanoid } from 'nanoid';
import { writeTextFile, mkdir, exists } from "@tauri-apps/plugin-fs";
import { join, appConfigDir, configDir } from "@tauri-apps/api/path";
import { deleteTaskFromStorage } from "./useSaveFlowData";

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

export const useWorkspace = ({ setSelectedTaskId } = {}) => {
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [activeWorkspace, setActiveWorkspace] = useState(
    initialWorkspaces.find(w => w.active) || initialWorkspaces[0]
  );
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showInlineTaskInput, setShowInlineTaskInput] = useState(false);

  const handleWorkspaceSelect = async (workspace) => {
    const updatedWorkspaces = workspaces.map(w => ({
      ...w,
      active: w.id === workspace.id
    }));
    setWorkspaces(updatedWorkspaces);
    setActiveWorkspace(workspace);
    setShowWorkspaceDropdown(false);
    setSelectedTaskId(0);
    
    try {
      const appConfig = await appConfigDir();
      const filePath = await join(appConfig, `flowData-${workspace.id}.json`);
      const fileExists = await exists(filePath);
      if (!fileExists) {
        await createWorkspaceFile(workspace.id);
      }
    } catch (error) {
      console.error("Error handling workspace select:", error);
    }
  };

  const createWorkspace = async (name) => {
    const newWorkspace = {
      id: nanoid(),
      name,
      active: false,
      tasks: []
    };
    setWorkspaces(prev => [...prev, newWorkspace]);
    setShowCreateMenu(false);
    if (setSelectedTaskId) {
      setSelectedTaskId(0);
    }
    createWorkspaceFile(newWorkspace.id);
  };

  const createWorkspaceFile = async (workspaceId) => {
    try {
      const configDir = await appConfigDir();
      await mkdir(configDir, { recursive: true });
      const filePath = await join(configDir, `flowData-${workspaceId}.json`);
      await writeTextFile(filePath, JSON.stringify({}, null, 2));
    } catch (error) {
      console.error("Error creating workspace file:", error);
    }
  }

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
      deleteTaskFromStorage(taskId, workspaceId);
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
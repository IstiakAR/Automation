import { useEffect, useCallback } from "react";
import { writeTextFile, readTextFile } from "@tauri-apps/plugin-fs";
import { join, appConfigDir } from "@tauri-apps/api/path";

const getWorkspaceFilePath = async (workspaceId) => {
  const configDir = await appConfigDir();
  return await join(configDir, `flowData-${workspaceId}.json`);
};

// delete task
export async function deleteTaskFromStorage(taskId, workspaceId) {
  if (taskId === 0 || !taskId || !workspaceId) return;
  
  try {
    const filePath = await getWorkspaceFilePath(workspaceId);
    
    let taskData = {};
    try {
      const fileContent = await readTextFile(filePath);
      taskData = JSON.parse(fileContent);
    } catch {
      return;
    }

    delete taskData[taskId];
    await writeTextFile(filePath, JSON.stringify(taskData, null, 2));
    console.log(`Deleted task ${taskId} from workspace ${workspaceId}`);
  } catch (error) {
    console.error("Error deleting task from storage:", error);
  }
}

// save task
export function useSaveFlowData(taskId, nodes, edges, workspaceId) {
  useEffect(() => {
    if (taskId === 0 || !taskId || !workspaceId) return;

    const saveData = async () => {
      try {
        const filePath = await getWorkspaceFilePath(workspaceId);
        let taskData = {};
        try {
          const fileContent = await readTextFile(filePath);
          taskData = JSON.parse(fileContent);
        } catch {
          taskData = {};
        }
        
        taskData[taskId] = {
          nodes,
          edges,
          savedAt: new Date().toISOString(),
        };

        await writeTextFile(filePath, JSON.stringify(taskData, null, 2));
        console.log(`Flow data saved for task ${taskId} in workspace ${workspaceId}`);
      } catch (error) {
        console.error("Error saving flow data:", error);
      }
    };

    saveData();
  }, [taskId, nodes, edges, workspaceId]);

  // Load nodes and edges
  const loadFlowData = useCallback(async (id, wsId) => {
    if (id === 0 || !id || !wsId) return null;

    try {
      const filePath = await getWorkspaceFilePath(wsId);
      const fileContent = await readTextFile(filePath);
      const taskData = JSON.parse(fileContent);
      return taskData[id] || null;
    } catch (error) {
      console.error("Error loading flow data:", error);
      return null;
    }
  }, []);

  // Get all saved tasks for a workspace
  const getAllSavedTasks = useCallback(async (wsId) => {
    if (!wsId) return [];
    
    try {
      const filePath = await getWorkspaceFilePath(wsId);
      const fileContent = await readTextFile(filePath);
      const taskData = JSON.parse(fileContent);
      return Object.keys(taskData).map((id) => ({
        taskId: id,
        ...taskData[id],
      }));
    } catch (error) {
      console.error("Error getting all saved tasks:", error);
      return [];
    }
  }, []);

  return {
    loadFlowData,
    getAllSavedTasks,
  };
}

export default useSaveFlowData;

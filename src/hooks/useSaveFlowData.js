import { useEffect, useCallback } from "react";
import { writeTextFile, readTextFile } from "@tauri-apps/plugin-fs";
import { join, appConfigDir } from "@tauri-apps/api/path";

const FILE_NAME = "flowData.json";

export function useSaveFlowData(taskId, nodes, edges) {
  // Save nodes and edges to flowData.json file
  useEffect(() => {
    if (taskId === 0 || !taskId) return;

    const saveData = async () => {
      try {
        const configDir = await appConfigDir();
        const filePath = await join(configDir, FILE_NAME);
        
        let allFlowData = {};
        
        // Try to read existing file
        try {
          const fileContent = await readTextFile(filePath);
          allFlowData = JSON.parse(fileContent);
        } catch {
          // File doesn't exist yet, start with empty object
          allFlowData = {};
        }
        
        allFlowData[taskId] = {
          nodes,
          edges,
          savedAt: new Date().toISOString(),
        };

        // Write to file
        await writeTextFile(filePath, JSON.stringify(allFlowData, null, 2));
        console.log("Flow data saved for task:", taskId);
      } catch (error) {
        console.error("Error saving flow data:", error);
      }
    };

    saveData();
  }, [taskId, nodes, edges]);

  // Load nodes and edges from file for a specific taskId
  const loadFlowData = useCallback(async (id) => {
    if (id === 0 || !id) return null;

    try {
      const configDir = await appConfigDir();
      const filePath = await join(configDir, FILE_NAME);
      
      const fileContent = await readTextFile(filePath);
      const allFlowData = JSON.parse(fileContent);
      return allFlowData[id] || null;
    } catch (error) {
      console.error("Error loading flow data:", error);
      return null;
    }
  }, []);

  // Clear data for a specific taskId
  const clearFlowData = useCallback(async (id) => {
    if (id === 0 || !id) return;

    try {
      const configDir = await appConfigDir();
      const filePath = await join(configDir, FILE_NAME);
      
      let allFlowData = {};
      try {
        const fileContent = await readTextFile(filePath);
        allFlowData = JSON.parse(fileContent);
      } catch {
        return;
      }
      
      delete allFlowData[id];
      await writeTextFile(filePath, JSON.stringify(allFlowData, null, 2));
    } catch (error) {
      console.error("Error clearing flow data:", error);
    }
  }, []);

  // Get all saved tasks
  const getAllSavedTasks = useCallback(async () => {
    try {
      const configDir = await appConfigDir();
      const filePath = await join(configDir, FILE_NAME);
      
      const fileContent = await readTextFile(filePath);
      const allFlowData = JSON.parse(fileContent);
      return Object.keys(allFlowData).map((id) => ({
        taskId: id,
        ...allFlowData[id],
      }));
    } catch (error) {
      console.error("Error getting all saved tasks:", error);
      return [];
    }
  }, []);

  return {
    loadFlowData,
    clearFlowData,
    getAllSavedTasks,
  };
}

import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { join, appConfigDir } from '@tauri-apps/api/path';
import { readTextFile } from "@tauri-apps/plugin-fs";

export const useFlowControl = () => {
  const [isLoading, setIsLoading] = useState(false);

  const startFlow = useCallback(async (taskId, workspaceId) => {
    if (!taskId || taskId === 0 || !workspaceId) {
      console.error('Invalid taskId or workspaceId');
      return { success: false, error: 'Invalid taskId or workspaceId' };
    }

    setIsLoading(true);
    try {
      const configDir = await appConfigDir();
      const filePath = await join(configDir, `flowData-${workspaceId}.json`);

      let taskData = {};
      try {
        const fileContent = await readTextFile(filePath);
        taskData = JSON.parse(fileContent);
      } catch {
        setIsLoading(false);
        return { success: false, error: 'No flow data found' };
      }

      const flowData = taskData[taskId];
      if (!flowData) {
        setIsLoading(false);
        return { success: false, error: 'Task not found' };
      }

      const result = await invoke('start_flow', { command: flowData });
      
      setIsLoading(false);
      return { success: true, message: result };
    } catch (error) {
      console.error('Error starting flow:', error);
      setIsLoading(false);
      return { success: false, error: error.toString() };
    }
  }, []);

  return {
    isLoading,
    startFlow,
  };
};

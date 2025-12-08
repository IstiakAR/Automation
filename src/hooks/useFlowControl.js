import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

export const useFlowControl = () => {
  const [isLoading, setIsLoading] = useState(false);

  const startFlow = useCallback(async (taskId, workspaceId) => {
    if (!taskId || taskId === 0 || !workspaceId) {
      console.error('Invalid taskId or workspaceId');
      return { success: false, error: 'Invalid taskId or workspaceId' };
    }

    setIsLoading(true);
    try {
      const flowData = await invoke('load_flow_graph', { flowId: taskId });
      if (!flowData || !flowData.nodes || !flowData.edges) {
        setIsLoading(false);
        return { success: false, error: 'No flow data found' };
      }

      const result = await invoke('start_flow', { command: flowData, workspaceId: workspaceId })
        .then((msg) => {
          console.log('Success:', msg);
          return msg;
        })
        .catch((err) => {
          console.error('Flow error:', err);
          throw err;
        });
      
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

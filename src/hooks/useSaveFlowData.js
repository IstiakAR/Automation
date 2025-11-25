import { useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

// save task
export function useSaveFlowData(taskId, nodes, edges, workspaceId) {
  useEffect(() => {
    if (taskId === 0 || !taskId || !workspaceId) return;

    const saveData = async () => {
      try {
        await invoke("upsert_flow", {
          id: taskId,
          workspaceId,
          folderId: null,
          name: `Task ${taskId}`,
        });

        await invoke("save_flow_graph", {
          flowId: taskId,
          nodes,
          edges,
        });
        console.log(`Flow data saved for task ${taskId} in workspace ${workspaceId}`);
      } catch (error) {
        console.error("Error saving flow data to DB:", error);
      }
    };

    saveData();
  }, [taskId, nodes, edges, workspaceId]);

  // Load nodes and edges
  const loadFlowData = useCallback(async (id, wsId) => {
    if (id === 0 || !id || !wsId) return null;

    try {
      const graph = await invoke("load_flow_graph", { flowId: id });
      return graph;
    } catch (error) {
      console.error("Error loading flow data from DB:", error);
      return null;
    }
  }, []);

  // Get all saved tasks for a workspace
  const getAllSavedTasks = useCallback(async (wsId) => {
    if (!wsId) return [];
    
    try {
      const flows = await invoke("list_flows_for_workspace", { workspaceId: wsId });
      return flows.map((f) => ({
        taskId: f.id,
        name: f.name,
      }));
    } catch (error) {
      console.error("Error getting all saved tasks from DB:", error);
      return [];
    }
  }, []);

  return {
    loadFlowData,
    getAllSavedTasks,
  };
}

export default useSaveFlowData;

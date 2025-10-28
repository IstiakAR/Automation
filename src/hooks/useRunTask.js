import { invoke } from '@tauri-apps/api/core';
import { join, appConfigDir } from '@tauri-apps/api/path';
import { readTextFile } from "@tauri-apps/plugin-fs";;

export const runTask = async (taskId, workspaceId) => {
  if (taskId === 0 || !taskId || !workspaceId) return;
  
  try {
    const configDir = await appConfigDir();
    const filePath = await join(configDir, `flowData-${workspaceId}.json`);

    let taskData = {};
    try {
      const fileContent = await readTextFile(filePath);
      taskData = JSON.parse(fileContent);
    } catch {
      return;
    }
    console.log("Running task:", taskId, "with data:", taskData[taskId]);
    const res = await invoke("run_command", { command: taskData[taskId] });
    console.log("Task run result:", res);
  } catch (error) {
    console.error("Error running task:", error);
  }
}
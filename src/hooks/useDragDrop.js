import { useCallback } from "react";
import * as LucideIcons from "lucide-react";

let id = 0;
const getId = () => `node_${++id}`;

export function useDragDrop(reactFlowInstance, setNodes) {
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const draggedData = event.dataTransfer.getData("application/reactflow");

      if (typeof draggedData === "undefined" || !draggedData) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let label = "Task";
      let iconName = "ClipboardCheck";
      let iconComponent = LucideIcons.ClipboardCheck;
      let task = "No task description";

      try {
        const parsedData = JSON.parse(draggedData);
        console.log("Parsed drag data:", parsedData);
        label = parsedData.name || "Task";
        iconName = parsedData.iconName || "ClipboardCheck";
        task = parsedData.task || "No task description";
        iconComponent = LucideIcons[iconName] || LucideIcons.ClipboardCheck;
      } catch (e) {
        console.error("Error parsing drag data:", e);
      }

      const newNode = {
        id: getId(),
        type: "taskNode",
        position,
        data: { label, iconName, task },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  return {
    onDragOver,
    onDrop,
  };
}

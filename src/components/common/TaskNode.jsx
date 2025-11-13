import { Handle, Position } from "@xyflow/react";
import * as LucideIcons from "lucide-react";

export default function TaskNode({ data, id }) {
  const IconComponent = LucideIcons[data.iconName] || LucideIcons.ClipboardCheck;

  const handleDoubleClick = () => {
    if (data.onDoubleClick) {
      data.onDoubleClick({ ...data, nodeId: id });
    }
  };

  return (
    <div className="relative" onDoubleClick={handleDoubleClick}>
      <div className="bg-transparent text-white rounded-lg min-w-32 text-center 
                      border-2 border-gray-500 hover:border-blue-400 
                      shadow-md hover:shadow-lg transition-all duration-200">
        <div className="flex flex-col items-center gap-2 p-3">
          <IconComponent size={20} className="text-gray-200" />
          <span className="text-sm font-medium">{data.label || "Task"}</span>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-500 !border-2 !border-gray-500 !w-3 !h-3 !rounded-full"
        style={{ top: -8, left: "50%", transform: "translateX(-50%)" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-500 !border-2 !border-gray-500 !w-3 !h-3 !rounded-full"
        style={{ bottom: -8, left: "50%", transform: "translateX(-50%)" }}
      />
    </div>
  );
};

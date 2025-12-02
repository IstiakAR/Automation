import { Handle, Position } from "@xyflow/react";
import * as LucideIcons from "lucide-react";
import { RightbarCards } from "../../data/rightbarCards";

export default function TaskNode({ data, id, selected }) {
  const card = RightbarCards.find((c) => c.name === data.label);
  const iconName = card?.iconKey || "ClipboardCheck";
  const IconComponent = LucideIcons[iconName] || LucideIcons.ClipboardCheck;

  const handleDoubleClick = () => {
    if (data.onDoubleClick) {
      data.onDoubleClick({ ...data, nodeId: id });
    }
  };

  return (
    <div className="relative" onDoubleClick={handleDoubleClick}>
      <div className={`rounded-md border text-xs bg-slate-900 text-white px-3 py-2 shadow ${
        selected ? 'border-blue-500' : 'border-slate-600'
      }`}>
        <div className="flex flex-col items-center gap-2 p-3">
          <IconComponent size={20} className="text-gray-200" />
          <span className="text-sm font-medium">{data.label}</span>
        </div>
      </div>
      {data.label !== "Start" && (
      <Handle
        type="target"
        position={Position.Top}
        className="h-2 w-2 -top-1 bg-blue-700"
      />
      )}
      {data.label !== "Stop" && (
      <Handle
        type="source"
        position={Position.Bottom}
        id="out_1"
        className="h-2 w-2 -bottom-1 -ml-4 bg-green-700"
      />
      )}

      {data.label !== "Stop" && (
      <Handle
        type="source"
        position={Position.Bottom}
        id="out_2"
        className="h-2 w-2 -bottom-1 ml-4 bg-red-700"
      />
      )}

    </div>
  );
};
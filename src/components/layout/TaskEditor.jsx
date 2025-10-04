import { useState, useCallback, useRef } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  BackgroundVariant,
  Controls
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import * as LucideIcons from "lucide-react";
import TaskNode from "../common/TaskNode"

let id = 0;
const getId = () => `node_${++id}`;

const nodeTypes = {
  taskNode: TaskNode,
};

export default function TaskEditor({ onAddNode }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onNodesChange = useCallback(
    (changes) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const draggedData = event.dataTransfer.getData('application/reactflow');
      
      if (typeof draggedData === 'undefined' || !draggedData) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      let label = 'Task';
      let iconName = 'ClipboardCheck';
      let iconComponent = LucideIcons.ClipboardCheck;

      try {
        const parsedData = JSON.parse(draggedData);
        console.log('Parsed drag data:', parsedData);
        label = parsedData.name || 'Task';
        iconName = parsedData.iconName || 'ClipboardCheck';
        console.log('Looking for icon:', iconName, 'Available:', Object.keys(LucideIcons).includes(iconName));
        iconComponent = LucideIcons[iconName] || LucideIcons.ClipboardCheck;
        console.log('Using icon component:', iconComponent.name || 'ClipboardCheck');
      } catch (e) {
        label = draggedData || 'Task';
        iconName = 'ClipboardCheck';
        iconComponent = LucideIcons.ClipboardCheck;
      }
      
      const newNode = {
        id: getId(),
        type: 'taskNode',
        position,
        data: { label, iconName },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance],
  );

  return (
    <div className="flex w-full h-full">
      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          className=""
        >
          <Background
            id="dots"
            gap={20}
            size={1}
            color="#444"
            variant={BackgroundVariant.Dots}
          />
          <Controls 
            position="bottom-right" 
            showFitView={false} 
            showInteractive={false} 
          />
        </ReactFlow>
      </div>
    </div>
  );
}

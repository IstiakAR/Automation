import React, { useState, useCallback, useRef } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

let id = 0;
const getId = () => `node_${++id}`;

const StartNode = ({ data }) => {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg">
        <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <span className="font-medium">Start</span>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-transparent !border-none !w-2 !h-2" 
        style={{ bottom: -8, left: '50%', transform: 'translateX(-50%)' }}
      />
    </div>
  );
};

const EndNode = ({ data }) => {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg">
        <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12"/>
          </svg>
        </div>
        <span className="font-medium">End</span>
      </div>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-transparent !border-none !w-2 !h-2" 
        style={{ top: -8, left: '50%', transform: 'translateX(-50%)' }}
      />
    </div>
  );
};

const AddTaskNode = ({ data }) => {
  return (
    <div className="relative">
      <div 
        className="border-2 border-dashed border-gray-500 bg-gray-800 text-gray-300 px-8 py-6 rounded-lg shadow-lg min-w-32 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-750 transition-colors"
        onClick={() => data.onAddTask && data.onAddTask()}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-dashed border-gray-500 rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <span className="text-sm font-medium">Add Task</span>
        </div>
      </div>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-transparent !border-none !w-2 !h-2" 
        style={{ top: -8, left: '50%', transform: 'translateX(-50%)' }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-transparent !border-none !w-2 !h-2" 
        style={{ bottom: -8, left: '50%', transform: 'translateX(-50%)' }}
      />
    </div>
  );
};

// Task Node Component
const TaskNode = ({ data }) => {
  return (
    <div className="relative">
      <div className="bg-gray-600 text-white px-4 py-3 rounded-lg shadow-lg min-w-32 text-center">
        <div className="flex flex-col items-center gap-1">
          <div className="w-6 h-6 bg-white bg-opacity-20 rounded flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,11 12,14 22,4"></polyline>
              <path d="m21,12c0,4.97 -4.03,9 -9,9s-9,-4.03 -9,-9 4.03,-9 9,-9c1.09,0 2.13,0.2 3.09,0.56"></path>
            </svg>
          </div>
          <span className="text-sm font-medium">{data.label || 'Task'}</span>
        </div>
      </div>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-transparent !border-none !w-2 !h-2" 
        style={{ top: -8, left: '50%', transform: 'translateX(-50%)' }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-transparent !border-none !w-2 !h-2" 
        style={{ bottom: -8, left: '50%', transform: 'translateX(-50%)' }}
      />
    </div>
  );
};

const nodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  addTaskNode: AddTaskNode,
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

  const addNode = useCallback((nodeType) => {
    const newNode = {
      id: getId(),
      type: nodeType,
      position: reactFlowInstance
        ? reactFlowInstance.screenToFlowPosition({ x: 400, y: 200 })
        : { x: 400, y: 200 },
      data: { label: nodeType === 'taskNode' ? 'New Task' : '' },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance]);

  // Expose addNode function to parent component
  React.useEffect(() => {
    if (onAddNode) {
      onAddNode(addNode);
    }
  }, [addNode, onAddNode]);

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

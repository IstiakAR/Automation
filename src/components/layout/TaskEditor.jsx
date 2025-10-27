import { useState, useRef, useEffect } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import TaskNode from "../common/TaskNode";
import { useFlow } from "../../hooks/useFlow";
import { useDragDrop } from "../../hooks/useDragDrop";
import { useSaveFlowData } from "../../hooks/useSaveFlowData";

const nodeTypes = {
  taskNode: TaskNode,
};

export default function TaskEditor(props) {
  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    reactFlowInstance,
    setReactFlowInstance,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useFlow();
  const { onDragOver, onDrop } = useDragDrop(reactFlowInstance, setNodes);
  const { loadFlowData } = useSaveFlowData(props.taskId, nodes, edges);
  const reactFlowWrapper = useRef(null);
  const [taskId, setTaskId] = useState(props.taskId || 0);

  useEffect(() => {
    setTaskId(props.taskId || 0);
    
    // Load saved data when taskId changes
    if (props.taskId && props.taskId !== 0) {
      const loadData = async () => {
        const savedData = await loadFlowData(props.taskId);
        if (savedData) {
          setNodes(savedData.nodes);
          setEdges(savedData.edges);
        } else {
          setNodes([]);
          setEdges([]);
        }
      };
      loadData();
    }
  }, [props.taskId, loadFlowData, setNodes, setEdges]);

  if(taskId === 0) {
    return <></>;
  }
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

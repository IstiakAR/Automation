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
import { useFlowControl } from "../../hooks/useFlowControl";
import { Play, Loader2 } from "lucide-react";

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
  const reactFlowWrapper = useRef(null);
  const [taskId, setTaskId] = useState(props.taskId || 0);
  const onNodeDoubleClickRef = useRef(props.onNodeDoubleClick);
  const { startFlow, isLoading } = useFlowControl();
  
  useEffect(() => {
    onNodeDoubleClickRef.current = props.onNodeDoubleClick;
  }, [props.onNodeDoubleClick]);

  const { onDragOver, onDrop } = useDragDrop(reactFlowInstance, setNodes, onNodeDoubleClickRef.current);
  const { loadFlowData } = useSaveFlowData(props.taskId, nodes, edges, props.workspaceId, props.taskName);

  useEffect(() => {
    if (props.onUpdateNode) {
      const updateNode = (updatedData) => {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === updatedData.nodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  label: updatedData.label,
                  command: updatedData.command,
                  args: updatedData.args,
                  onDoubleClick: onNodeDoubleClickRef.current,
                },
              };
            }
            return node;
          })
        );
      };
      props.onUpdateNode(updateNode);
    }
  }, [props.onUpdateNode, setNodes]);

  useEffect(() => {
    setTaskId(props.taskId || 0);
    
    if (props.taskId && props.taskId !== 0 && props.workspaceId) {
      const loadData = async () => {
        console.log("[TaskEditor] Loading data for task:", props.taskId, "workspace:", props.workspaceId, "taskName:", props.taskName);
        const savedData = await loadFlowData(props.taskId, props.workspaceId);
        if (savedData) {
          console.log("Loaded saved data:", savedData);
          const nodesWithHandler = savedData.nodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              onDoubleClick: onNodeDoubleClickRef.current
            }
          }));
          setNodes(nodesWithHandler);
          setEdges(savedData.edges);
          console.log("Loaded edges:", savedData.edges);
        } else {
          console.log("No saved data, clearing");
          setNodes([]);
          setEdges([]);
        }
      };
      loadData();
    } else if (!props.taskId || props.taskId === 0) {
      setNodes([]);
      setEdges([]);
    }
  }, [props.taskId, props.workspaceId, loadFlowData, setNodes, setEdges]);

  if(taskId === 0) {
    return <></>;
  }
  
  return (
    <div className="flex w-full h-full relative">
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
        <div className="absolute top-2 right-2 z-50">
          {isLoading ? (
            <Loader2 className="border-white border-2 rounded-full p-1 w-10 h-10 text-white animate-spin" />
          ) : (
            <Play 
              className="border-white border-2 rounded-full p-1 w-10 h-10 text-white cursor-pointer hover:bg-white hover:text-black transition-colors"
              onClick={async () => {
                const result = await startFlow(taskId, props.workspaceId);
                if (!result.success) {
                  console.error('Failed to start flow:', result.error);
                  alert(`Failed to start flow: ${result.error}`);
                } else {
                  console.log('Flow completed:', result.message);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
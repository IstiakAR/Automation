import Leftbar from "./Leftbar";
import Topbar from "./Topbar";
import Rightbar from "./Rightbar";
import TaskEditor from "./TaskEditor";
import Logger from "./Logger";
import { useState, useCallback } from "react";
import { useWorkspace } from "../../hooks/useWorkspace";
import ConfigBar from "./ConfigBar";

const Layout = ({ children }) => {
  const [logOpen, setLogOpen] = useState(false);
  const [addNodeFunction, setAddNodeFunction] = useState(null);
  const [updateNodeFunction, setUpdateNodeFunction] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(0);
  const [configBarOpen, setConfigBarOpen] = useState(false);
  const [configTaskData, setConfigTaskData] = useState(null);
  const workspaceState = useWorkspace({ setSelectedTaskId });
  const { activeWorkspace } = workspaceState;

  const selectedTask =
    activeWorkspace && activeWorkspace.tasks
      ? activeWorkspace.tasks.find((t) => t.id === selectedTaskId)
      : null;

  const handleAddNodeFunction = useCallback((addNodeFn) => {
    setAddNodeFunction(() => addNodeFn);
  }, []);

  const handleUpdateNodeFunction = useCallback((updateNodeFn) => {
    setUpdateNodeFunction(() => updateNodeFn);
  }, []);

  const handleNodeDoubleClick = useCallback((nodeData) => {
    setConfigTaskData(nodeData);
    setConfigBarOpen(true);
  }, []);

  const handleCloseConfigBar = useCallback(() => {
    setConfigBarOpen(false);
    setConfigTaskData(null);
  }, []);

  const handleSaveConfig = useCallback((updatedData) => {
    if (updateNodeFunction) {
      updateNodeFunction(updatedData);
    }
  }, [updateNodeFunction]);

  return (
    <div className="select-none flex flex-col h-screen bg-dark0 overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Leftbar 
          logOpen={logOpen} 
          setLogOpen={setLogOpen} 
          setSelectedTaskId={setSelectedTaskId}
          {...workspaceState}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TaskEditor 
            taskId={selectedTaskId} 
            workspaceId={activeWorkspace?.id} 
            taskName={selectedTask ? selectedTask.name : ""}
            onAddNode={handleAddNodeFunction}
            onUpdateNode={handleUpdateNodeFunction}
            onNodeDoubleClick={handleNodeDoubleClick}
          />
          {logOpen && <Logger logOpen={logOpen} setLogOpen={setLogOpen} />}
        </div>
        {configBarOpen && <ConfigBar taskData={configTaskData} onClose={handleCloseConfigBar} onSave={handleSaveConfig} />}
        <Rightbar addNode={addNodeFunction} />
      </div>
    </div>
  );
};

export default Layout;

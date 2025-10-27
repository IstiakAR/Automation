import Leftbar from "./Leftbar";
import Topbar from "./Topbar";
import Rightbar from "./Rightbar";
import TaskEditor from "./TaskEditor";
import Logger from "./Logger";
import { useState } from "react";

const Layout = ({ children }) => {
  const [logOpen, setLogOpen] = useState(false);
  const [addNodeFunction, setAddNodeFunction] = useState(null);

  const handleAddNodeFunction = (addNodeFn) => {
    setAddNodeFunction(() => addNodeFn);
  };

  return (
    <div className="select-none flex flex-col h-screen bg-dark0 overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Leftbar logOpen={logOpen} setLogOpen={setLogOpen} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TaskEditor onAddNode={handleAddNodeFunction} />
          {logOpen && <Logger logOpen={logOpen} setLogOpen={setLogOpen} />}
        </div>
        <Rightbar addNode={addNodeFunction} />
      </div>
    </div>
  );
};

export default Layout;

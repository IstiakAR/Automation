import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Menubar from "./Menubar";
import TaskEditor from "./TaskEditor";
import Logger from "./Logger";
import { useState } from "react";

const Layout = ({ children }) => {
  const [logOpen, setLogOpen] = useState(false);

  return (
    <div className="select-none flex flex-col h-screen bg-dark0">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar logOpen={logOpen} setLogOpen={setLogOpen} />
        <div className="flex flex-col flex-1">
          <TaskEditor />
          {logOpen && <Logger logOpen={logOpen} setLogOpen={setLogOpen} />}
        </div>
        <Menubar />
      </div>
    </div>
  );
};

export default Layout;

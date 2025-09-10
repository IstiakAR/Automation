import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Menubar from "./Menubar";
import TaskEditor from "./TaskEditor";

const Layout = ({ children }) => {
  return (
    <div className="select-none flex flex-col h-screen bg-dark0">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar />
        <TaskEditor />
        <Menubar />
      </div>
    </div>
  );
};

export default Layout;

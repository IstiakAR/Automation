import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Startup from "./pages/Startup";
import Editor from "./pages/Editor";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Startup />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/Editor" element={<Editor />} />
      <Route path="/Settings" element={<Settings />} />
    </Routes>
  );
}

export default App;

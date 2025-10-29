import Topbar from "../components/layout/Topbar";
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const handleSkip = () => {
        navigate('/Editor');
    };

    return (
    <div className="select-none flex flex-col h-screen bg-dark0 overflow-hidden">
      <Topbar />
      <h1 className="text-white">Dashboard Page</h1>
      <span className="text-blue-500 absolute bottom-4 right-4 cursor-pointer"
      onClick={handleSkip}>Skip</span>
    </div>
    )
}

export default Dashboard;

import Layout from "../Layout/Layout";
import Card from "../common/Card";

const Dashboard = () => {
  return (
    <Layout>
      <div className="grid grid-cols-3 gap-6">
        <Card>Task 1: Automated Script</Card>
        <Card>Task 2: Twitter Post</Card>
        <Card>Task 3: Alarm Setup</Card>
      </div>
    </Layout>
  );
};

export default Dashboard;

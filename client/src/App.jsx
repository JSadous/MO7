import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <Navbar />
      <Outlet />
    </div>
  );
};
export default App

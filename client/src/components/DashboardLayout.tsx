import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export const DashboardLayout = () => {
    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content scrollbar">
                <Outlet />
            </main>
        </div>
    );
};

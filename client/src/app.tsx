import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import { Queue } from "./pages/Queue/Queue";
import { DashboardLayout } from "./components/DashboardLayout";
import { PersonaProvider } from "./context/PersonaContext";

import { AgentsList } from "./pages/Queue/AgentsList";
import { AgentEditor } from "./pages/Queue/AgentEditor";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        path: "/",
        element: <AgentsList />,
      },
      {
        path: "/agent/:id",
        element: <AgentEditor />,
      },
      {
        path: "/logs",
        element: (
          <div className="flex flex-col items-center justify-center h-full text-center p-12">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Call Logs</h2>
            <p className="text-zinc-500 max-w-xs mx-auto">History of your voice interactions will appear here once you start publishing agents.</p>
          </div>
        ),
      },
      {
        path: "/settings",
        element: (
          <div className="p-12 max-w-2xl mx-auto">
            <h1 className="text-3xl font-black text-white mb-8">Settings</h1>
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 border border-white/5">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">API Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Worker Address</label>
                    <input className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#76b900] outline-none" placeholder="moshi.chat" readOnly value="https://moshi.chat/api" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
]);


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <PersonaProvider>
    <RouterProvider router={router} />
  </PersonaProvider>
);

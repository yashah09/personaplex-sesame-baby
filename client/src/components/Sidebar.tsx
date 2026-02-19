import { Link, useLocation } from "react-router-dom";

export const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        {
            id: "agents",
            label: "Agents",
            path: "/",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            id: "calls",
            label: "Call Logs",
            path: "/logs",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        {
            id: "settings",
            label: "Settings",
            path: "/settings",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        }
    ];

    return (
        <aside className="sidebar">
            <div className="p-8 pb-4">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-[#76b900] flex items-center justify-center text-black font-black text-xl italic">P</div>
                    <h1 className="text-xl font-black text-white tracking-widest uppercase">PersonaPlex</h1>
                </div>

                <div className="px-4 py-2 mb-6 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Organization</div>
                    <div className="text-sm font-semibold text-white truncate">Future Theory Labs</div>
                </div>
            </div>

            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="p-6 mt-auto">
                <div className="glass-card rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="status-dot"></div>
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">System Status</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-medium">Latency: 420ms (Avg)</div>
                    <div className="text-[10px] text-zinc-500 font-medium">Uptime: 99.99%</div>
                </div>
            </div>
        </aside>
    );
};

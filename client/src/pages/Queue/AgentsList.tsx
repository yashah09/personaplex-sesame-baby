import { useNavigate } from "react-router-dom";
import { AGENT_TEMPLATES } from "../../config/agents";

export const AgentsList = () => {
    const navigate = useNavigate();

    return (
        <div className="p-12 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">My Agents</h1>
                    <p className="text-zinc-500 font-medium">Create and manage your PersonaPlex voice assistants.</p>
                </div>
                <button className="px-6 py-3 bg-[#76b900] text-black font-black rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95">
                    + Create Agent
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {AGENT_TEMPLATES.map((agent) => (
                    <div
                        key={agent.id}
                        onClick={() => navigate(`/agent/${agent.id}`)}
                        className="group relative p-8 rounded-3xl cursor-pointer transition-all duration-300 glass-card hover:bg-white/5 border border-white/5 hover:border-[#76b900]/30"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold"
                                style={{ backgroundColor: `${agent.color}22`, color: agent.color, border: `1px solid ${agent.color}44` }}
                            >
                                {agent.name[0]}
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#76b900] transition-colors">{agent.name}</h3>
                        <p className="text-sm text-zinc-400 line-clamp-2 mb-6 font-medium leading-relaxed">
                            {agent.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {agent.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-white/5">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5">
                            <span className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                                <span className="w-2 h-2 rounded-full bg-[#76b900]"></span>
                                Active
                            </span>
                            <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">
                                {agent.voicePrompt.replace('.pt', '')}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Custom Agent / Create New */}
                <div className="group p-8 rounded-3xl cursor-pointer transition-all duration-300 border-2 border-dashed border-white/10 hover:border-[#76b900]/50 hover:bg-white/5 flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-[#76b900] transition-colors mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-400 group-hover:text-white transition-colors">Build Custom Agent</h3>
                    <p className="text-xs text-zinc-600 mt-1 font-medium italic">Define unique personality</p>
                </div>
            </div>
        </div>
    );
};

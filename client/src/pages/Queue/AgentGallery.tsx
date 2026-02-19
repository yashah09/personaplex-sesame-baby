import { Agent, AGENT_TEMPLATES } from "../../config/agents";

interface AgentGalleryProps {
    onSelect: (agent: Agent) => void;
    selectedAgentId?: string;
}

export const AgentGallery = ({ onSelect, selectedAgentId }: AgentGalleryProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full mt-8">
            {AGENT_TEMPLATES.map((agent) => (
                <div
                    key={agent.id}
                    onClick={() => onSelect(agent)}
                    className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 glass-card hover:scale-[1.02] ${selectedAgentId === agent.id ? "ring-2 ring-[#76b900] bg-white/5" : "hover:bg-white/5"
                        }`}
                >
                    <div className="flex items-start gap-4">
                        <div
                            className="p-3 rounded-xl bg-opacity-20 flex items-center justify-center"
                            style={{ backgroundColor: `${agent.color}33`, color: agent.color }}
                        >
                            {/* Fallback Icon */}
                            <div className="w-6 h-6 flex items-center justify-center font-bold text-xl">
                                {agent.name[0]}
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white group-hover:text-[#76b900] transition-colors">
                                {agent.name}
                            </h3>
                            <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
                                {agent.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {agent.tags.map(tag => (
                                    <span key={tag} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md bg-white/5 text-zinc-500 border border-white/5">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {selectedAgentId === agent.id && (
                        <div className="absolute top-4 right-4 text-[#76b900]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                </div>
            ))}

            {/* Custom Agent Option */}
            <div
                onClick={() => onSelect({
                    id: "custom",
                    name: "Custom Agent",
                    description: "Define your own personality and voice.",
                    textPrompt: "",
                    voicePrompt: "NATF0.pt",
                    tags: ["User Defined"],
                    color: "#71717a",
                    icon: "User"
                })}
                className={`group p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 border-dashed ${selectedAgentId === 'custom' ? "border-[#76b900] bg-white/5" : "border-white/10 hover:border-[#76b900]/50 hover:bg-white/5"
                    } flex flex-col items-center justify-center gap-2`}
            >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${selectedAgentId === 'custom' ? "text-[#76b900]" : "text-zinc-400 group-hover:text-[#76b900]"
                    }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </div>
                <span className={`text-sm font-medium transition-colors ${selectedAgentId === 'custom' ? "text-white" : "text-zinc-400 group-hover:text-white"
                    }`}>Custom Agent</span>
            </div>
        </div>
    );
};

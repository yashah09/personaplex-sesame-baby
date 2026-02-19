import { FC, useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AGENT_TEMPLATES } from "../../config/agents";
import { Conversation } from "../Conversation/Conversation";
import { usePersona } from "../../context/PersonaContext";

const VOICE_OPTIONS = [
    "NATF0.pt", "NATF1.pt", "NATF2.pt", "NATF3.pt",
    "NATM0.pt", "NATM1.pt", "NATM2.pt", "NATM3.pt",
    "VARF0.pt", "VARF1.pt", "VARF2.pt", "VARF3.pt", "VARF4.pt",
    "VARM0.pt", "VARM1.pt", "VARM2.pt", "VARM3.pt", "VARM4.pt",
];

export const AgentEditor: FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { audioContext, worklet, isConnected, isConnecting, startSession, stopSession, modelParams } = usePersona();

    const agent = useMemo(() => AGENT_TEMPLATES.find(a => a.id === id) || AGENT_TEMPLATES[0], [id]);

    const [localTextPrompt, setLocalTextPrompt] = useState(agent.textPrompt);
    const [localVoicePrompt, setLocalVoicePrompt] = useState(agent.voicePrompt);

    useEffect(() => {
        // Sync context params with agent defaults on load
        modelParams.setTextPrompt(agent.textPrompt);
        modelParams.setVoicePrompt(agent.voicePrompt);
        setLocalTextPrompt(agent.textPrompt);
        setLocalVoicePrompt(agent.voicePrompt);
    }, [agent, modelParams]);

    const handleStartTest = async () => {
        // Update context params before starting
        modelParams.setTextPrompt(localTextPrompt);
        modelParams.setVoicePrompt(localVoicePrompt);
        await startSession();
    };

    return (
        <div className="flex h-full overflow-hidden">
            {/* Sidebar Editor */}
            <div className="w-[450px] border-r border-white/5 bg-[#111113] flex flex-col h-full scrollbar overflow-y-auto">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h2 className="text-xl font-bold text-white">Editor</h2>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-[#76b900]/10 border border-[#76b900]/20 text-[#76b900] text-[10px] font-bold uppercase tracking-widest">
                        Draft
                    </div>
                </div>

                <div className="p-8 space-y-10 flex-grow">
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">System Prompt</label>
                            <span className="text-[10px] text-zinc-600 font-medium">Define Persona</span>
                        </div>
                        <textarea
                            value={localTextPrompt}
                            onChange={(e) => setLocalTextPrompt(e.target.value)}
                            className="w-full h-64 p-5 bg-black/40 text-sm text-white border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#76b900] transition-all resize-none font-medium leading-relaxed scrollbar"
                            placeholder="e.g. You are a helpful professor specializing in quantum physics..."
                        />
                    </section>

                    <section className="space-y-4">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Vocal Profile</label>
                        <div className="grid grid-cols-2 gap-2">
                            {VOICE_OPTIONS.slice(0, 10).map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setLocalVoicePrompt(option)}
                                    className={`p-3 text-left rounded-xl border transition-all ${localVoicePrompt === option
                                        ? "bg-[#76b900]/10 border-[#76b900] text-white"
                                        : "bg-white/5 border-white/5 text-zinc-400 hover:border-white/10"
                                        }`}
                                >
                                    <div className="text-[10px] font-bold tracking-tight">{option.replace('.pt', '')}</div>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Model Parameters</label>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                                    <span>TEMPERATURE</span>
                                    <span>0.8</span>
                                </div>
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#76b900] w-[80%] rounded-full"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                                    <span>TOP K</span>
                                    <span>40</span>
                                </div>
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#76b900] w-[40%] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="p-8 border-t border-white/5 bg-black/20">
                    <button className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-[#76b900] hover:text-black transition-all active:scale-95">
                        Publish Agent
                    </button>
                </div>
            </div>

            {/* Main Preview/Test Area */}
            <div className="flex-1 relative bg-black flex flex-col">
                {!isConnected ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                        <div
                            className="w-32 h-32 rounded-3xl flex items-center justify-center text-5xl font-bold mb-8 animate-pulse"
                            style={{ backgroundColor: `${agent.color}11`, color: agent.color, border: `1px solid ${agent.color}33` }}
                        >
                            {agent.name[0]}
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4">Interactive Lab</h2>
                        <p className="text-zinc-500 max-w-md mb-12 font-medium">
                            Ready to test your persona? Launch a live duplex session to interact with your agent in real-time.
                        </p>
                        <button
                            onClick={handleStartTest}
                            disabled={isConnecting}
                            className="px-12 py-5 bg-[#76b900] text-black font-black text-xl rounded-3xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(118,185,0,0.4)] active:scale-95 disabled:opacity-50"
                        >
                            {isConnecting ? "Warming Up..." : "Start Live Test"}
                        </button>
                    </div>
                ) : (
                    <div className="h-full w-full">
                        <Conversation
                            workerAddr={""}
                            audioContext={audioContext}
                            worklet={worklet}
                            theme="dark"
                            startConnection={handleStartTest}
                            onConversationEnd={stopSession}
                            {...modelParams}
                        />
                        <button
                            onClick={stopSession}
                            className="absolute top-8 right-8 z-[100] px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-lg border border-red-500/30 transition-all"
                        >
                            End Session
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

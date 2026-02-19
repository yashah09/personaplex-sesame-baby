import moshiProcessorUrl from "../../audio-processor.ts?worker&url";
import { FC, useEffect, useState, useCallback, useRef, MutableRefObject } from "react";
import eruda from "eruda";
import { useSearchParams } from "react-router-dom";
import { Conversation } from "../Conversation/Conversation";
import { Button } from "../../components/Button/Button";
import { useModelParams } from "../Conversation/hooks/useModelParams";
import { env } from "../../env";
import { prewarmDecoderWorker } from "../../decoder/decoderWorker";
import { AgentGallery } from "./AgentGallery";
import { AGENT_TEMPLATES, Agent } from "../../config/agents";

const VOICE_OPTIONS = [
  "NATF0.pt", "NATF1.pt", "NATF2.pt", "NATF3.pt",
  "NATM0.pt", "NATM1.pt", "NATM2.pt", "NATM3.pt",
  "VARF0.pt", "VARF1.pt", "VARF2.pt", "VARF3.pt", "VARF4.pt",
  "VARM0.pt", "VARM1.pt", "VARM2.pt", "VARM3.pt", "VARM4.pt",
];

interface HomepageProps {
  showMicrophoneAccessMessage: boolean;
  startConnection: () => Promise<void>;
  textPrompt: string;
  setTextPrompt: (value: string) => void;
  voicePrompt: string;
  setVoicePrompt: (value: string) => void;
}

const Homepage = ({
  startConnection,
  showMicrophoneAccessMessage,
  textPrompt,
  setTextPrompt,
  voicePrompt,
  setVoicePrompt,
}: HomepageProps) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(AGENT_TEMPLATES[0].id);

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgentId(agent.id);
    setTextPrompt(agent.textPrompt);
    setVoicePrompt(agent.voicePrompt);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center py-12 px-4 scrollbar">
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="inline-block px-3 py-1 rounded-full bg-[#76b900]/10 border border-[#76b900]/20 text-[#76b900] text-xs font-bold tracking-widest uppercase mb-4">
          Experimental Lab
        </div>
        <h1 className="text-6xl font-black gradient-text tracking-tighter mb-4">
          PersonaPlex
        </h1>
        <p className="text-zinc-400 max-w-lg mx-auto text-lg">
          Deployment-ready voice agents with sub-second latency and full-duplex personality control.
        </p>
      </div>

      <div className="w-full max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm border border-white/10">01</span>
              Select Agent Archetype
            </h2>
          </div>
          <AgentGallery onSelect={handleSelectAgent} selectedAgentId={selectedAgentId} />
        </section>

        <section className="glass-card rounded-3xl p-8 space-y-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm border border-white/10 font-bold">02</span>
            <h2 className="text-xl font-bold text-white">Configure Personality</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest">
                System Prompt (Persona)
              </label>
              <textarea
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                className="w-full h-48 p-4 bg-black/50 text-white border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#76b900] transition-all resize-none scrollbar"
                placeholder="How should the agent behave?"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest">
                Vocal Profile
              </label>
              <div className="space-y-2">
                {VOICE_OPTIONS.slice(0, 8).map((option) => (
                  <button
                    key={option}
                    onClick={() => setVoicePrompt(option)}
                    className={`w-full p-3 text-left rounded-xl border transition-all ${voicePrompt === option
                        ? "bg-[#76b900]/10 border-[#76b900] text-white"
                        : "bg-white/5 border-white/5 text-zinc-400 hover:border-white/10"
                      }`}
                  >
                    <div className="text-xs font-bold">{option.replace('.pt', '')}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col items-center gap-6 py-8">
          {showMicrophoneAccessMessage && (
            <p className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              Microphone access is required to interact with the agent.
            </p>
          )}

          <button
            onClick={async () => await startConnection()}
            className="group relative px-12 py-4 bg-[#76b900] text-black font-black text-xl rounded-2xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(118,185,0,0.3)] hover:shadow-[0_0_30px_rgba(118,185,0,0.5)] active:scale-95"
          >
            Launch Agent Session
          </button>

          <p className="text-zinc-500 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secure, end-to-end encrypted voice stream
          </p>
        </div>
      </div>
    </div>
  );
}

export const Queue: FC = () => {
  const theme = "dark" as const;
  const [searchParams] = useSearchParams();
  const overrideWorkerAddr = searchParams.get("worker_addr");
  const [hasMicrophoneAccess, setHasMicrophoneAccess] = useState<boolean>(false);
  const [showMicrophoneAccessMessage, setShowMicrophoneAccessMessage] = useState<boolean>(false);
  const modelParams = useModelParams();

  const audioContext = useRef<AudioContext | null>(null);
  const worklet = useRef<AudioWorkletNode | null>(null);

  useEffect(() => {
    if (env.VITE_ENV === "development") {
      eruda.init();
    }
    () => {
      if (env.VITE_ENV === "development") {
        eruda.destroy();
      }
    };
  }, []);

  const getMicrophoneAccess = useCallback(async () => {
    try {
      await window.navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicrophoneAccess(true);
      return true;
    } catch (e) {
      console.error(e);
      setShowMicrophoneAccessMessage(true);
      setHasMicrophoneAccess(false);
    }
    return false;
  }, [setHasMicrophoneAccess, setShowMicrophoneAccessMessage]);

  const startProcessor = useCallback(async () => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext();
      prewarmDecoderWorker(audioContext.current.sampleRate);
    }
    if (worklet.current) {
      return;
    }
    let ctx = audioContext.current;
    ctx.resume();
    try {
      worklet.current = new AudioWorkletNode(ctx, 'moshi-processor');
    } catch (err) {
      await ctx.audioWorklet.addModule(moshiProcessorUrl);
      worklet.current = new AudioWorkletNode(ctx, 'moshi-processor');
    }
    worklet.current.connect(ctx.destination);
  }, [audioContext, worklet]);

  const startConnection = useCallback(async () => {
    await startProcessor();
    const hasAccess = await getMicrophoneAccess();
    if (hasAccess) {
      // Values are already set in modelParams, they get passed to Conversation
    }
  }, [startProcessor, getMicrophoneAccess]);

  return (
    <div className="bg-[#0a0a0b] text-white selection:bg-[#76b900] selection:text-black">
      {(hasMicrophoneAccess && audioContext.current && worklet.current) ? (
        <Conversation
          workerAddr={overrideWorkerAddr ?? ""}
          audioContext={audioContext as MutableRefObject<AudioContext | null>}
          worklet={worklet as MutableRefObject<AudioWorkletNode | null>}
          theme={theme}
          startConnection={startConnection}
          {...modelParams}
        />
      ) : (
        <Homepage
          startConnection={startConnection}
          showMicrophoneAccessMessage={showMicrophoneAccessMessage}
          textPrompt={modelParams.textPrompt}
          setTextPrompt={modelParams.setTextPrompt}
          voicePrompt={modelParams.voicePrompt}
          setVoicePrompt={modelParams.setVoicePrompt}
        />
      )}
    </div>
  );
};


import { FC, MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSocket } from "./hooks/useSocket";
import { SocketContext } from "./SocketContext";
import { ServerAudio } from "./components/ServerAudio/ServerAudio";
import { UserAudio } from "./components/UserAudio/UserAudio";
import { Button } from "../../components/Button/Button";
import { ServerAudioStats } from "./components/ServerAudio/ServerAudioStats";
import { AudioStats } from "./hooks/useServerAudio";
import { TextDisplay } from "./components/TextDisplay/TextDisplay";
import { MediaContext } from "./MediaContext";
import { ServerInfo } from "./components/ServerInfo/ServerInfo";
import { ModelParamsValues, useModelParams } from "./hooks/useModelParams";
import fixWebmDuration from "webm-duration-fix";
import { getMimeType, getExtension } from "./getMimeType";
import { type ThemeType } from "./hooks/useSystemTheme";

type ConversationProps = {
  workerAddr: string;
  workerAuthId?: string;
  sessionAuthId?: string;
  sessionId?: number;
  email?: string;
  theme: ThemeType;
  audioContext: MutableRefObject<AudioContext|null>;
  worklet: MutableRefObject<AudioWorkletNode|null>;
  onConversationEnd?: () => void;
  isBypass?: boolean;
  startConnection: () => Promise<void>;
} & Partial<ModelParamsValues>;


const buildURL = ({
  workerAddr,
  params,
  workerAuthId,
  email,
  textSeed,
  audioSeed,
}: {
  workerAddr: string;
  params: ModelParamsValues;
  workerAuthId?: string;
  email?: string;
  textSeed: number;
  audioSeed: number;
}) => {
  const newWorkerAddr = useMemo(() => {
    if (workerAddr == "same" || workerAddr == "") {
      const newWorkerAddr = window.location.hostname + ":" + window.location.port;
      console.log("Overriding workerAddr to", newWorkerAddr);
      return newWorkerAddr;
    }
    return workerAddr;
  }, [workerAddr]);
  const wsProtocol = (window.location.protocol === 'https:') ? 'wss' : 'ws';
  const url = new URL(`${wsProtocol}://${newWorkerAddr}/api/chat`);
  if(workerAuthId) {
    url.searchParams.append("worker_auth_id", workerAuthId);
  }
  if(email) {
    url.searchParams.append("email", email);
  }
  url.searchParams.append("text_temperature", params.textTemperature.toString());
  url.searchParams.append("text_topk", params.textTopk.toString());
  url.searchParams.append("audio_temperature", params.audioTemperature.toString());
  url.searchParams.append("audio_topk", params.audioTopk.toString());
  url.searchParams.append("pad_mult", params.padMult.toString());
  url.searchParams.append("text_seed", textSeed.toString());
  url.searchParams.append("audio_seed", audioSeed.toString());
  url.searchParams.append("repetition_penalty_context", params.repetitionPenaltyContext.toString());
  url.searchParams.append("repetition_penalty", params.repetitionPenalty.toString());
  url.searchParams.append("text_prompt", params.textPrompt.toString());
  url.searchParams.append("voice_prompt", params.voicePrompt.toString());
  console.log(url.toString());
  return url.toString();
};


export const Conversation:FC<ConversationProps> = ({
  workerAddr,
  workerAuthId,
  audioContext,
  worklet,
  sessionAuthId,
  sessionId,
  onConversationEnd,
  startConnection,
  isBypass=false,
  email,
  theme,
  ...params
}) => {
  const getAudioStats = useRef<() => AudioStats>(() => ({
    playedAudioDuration: 0,
    missedAudioDuration: 0,
    totalAudioMessages: 0,
    delay: 0,
    minPlaybackDelay: 0,
    maxPlaybackDelay: 0,
  }));
  const isRecording = useRef<boolean>(false);
  const audioChunks = useRef<Blob[]>([]);

  const audioStreamDestination = useRef<MediaStreamAudioDestinationNode>(audioContext.current!.createMediaStreamDestination());
  const stereoMerger = useRef<ChannelMergerNode>(audioContext.current!.createChannelMerger(2));
  const audioRecorder = useRef<MediaRecorder>(new MediaRecorder(audioStreamDestination.current.stream, { mimeType: getMimeType("audio"), audioBitsPerSecond: 128000  }));
  const [audioURL, setAudioURL] = useState<string>("");
  const [isOver, setIsOver] = useState(false);
  const modelParams = useModelParams(params);
  const micDuration = useRef<number>(0);
  const actualAudioPlayed = useRef<number>(0);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const textSeed = useMemo(() => Math.round(1000000 * Math.random()), []);
  const audioSeed = useMemo(() => Math.round(1000000 * Math.random()), []);

  const WSURL = buildURL({
    workerAddr,
    params: modelParams,
    workerAuthId,
    email: email,
    textSeed: textSeed,
    audioSeed: audioSeed,
  });

  const onDisconnect = useCallback(() => {
    setIsOver(true);
    console.log("on disconnect!");
    stopRecording();
  }, [setIsOver]);

  const { socketStatus, sendMessage, socket, start, stop } = useSocket({
    // onMessage,
    uri: WSURL,
    onDisconnect,
  });
  useEffect(() => {
    audioRecorder.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };
    audioRecorder.current.onstop = async () => {
      let blob: Blob;
      const mimeType = getMimeType("audio");
      if(mimeType.includes("webm")) {
        blob = await fixWebmDuration(new Blob(audioChunks.current, { type: mimeType }));
        } else {
          blob = new Blob(audioChunks.current, { type: mimeType });
      }
      setAudioURL(URL.createObjectURL(blob));
      audioChunks.current = [];
      console.log("Audio Recording and encoding finished");
    };
  }, [audioRecorder, setAudioURL, audioChunks]);


  useEffect(() => {
    start();
    return () => {
      stop();
    };
  }, [start, workerAuthId]);

  const startRecording = useCallback(() => {
    if(isRecording.current) {
      return;
    }
    console.log(Date.now() % 1000, "Starting recording");
    console.log("Starting recording");
    // Build stereo routing for recording: left = server (worklet), right = user mic (connected in useUserAudio)
    try {
      stereoMerger.current.disconnect();
    } catch {}
    try {
      worklet.current?.disconnect(audioStreamDestination.current);
    } catch {}
    // Route server audio (mono) to left channel of merger
    worklet.current?.connect(stereoMerger.current, 0, 0);
    // Connect merger to the MediaStream destination
    stereoMerger.current.connect(audioStreamDestination.current);

    setAudioURL("");
    audioRecorder.current.start();
    isRecording.current = true;
  }, [isRecording, worklet, audioStreamDestination, audioRecorder, stereoMerger]);

  const stopRecording = useCallback(() => {
    console.log("Stopping recording");
    console.log("isRecording", isRecording)
    if(!isRecording.current) {
      return;
    }
    try {
      worklet.current?.disconnect(stereoMerger.current);
    } catch {}
    try {
      stereoMerger.current.disconnect(audioStreamDestination.current);
    } catch {}
    audioRecorder.current.stop();
    isRecording.current = false;
  }, [isRecording, worklet, audioStreamDestination, audioRecorder, stereoMerger]);

  const onPressConnect = useCallback(async () => {
      if (isOver) {
        window.location.reload();
      } else {
        audioContext.current?.resume();
        if (socketStatus !== "connected") {
          start();
        } else {
          stop();
        }
      }
    }, [socketStatus, isOver, start, stop]);

  const socketColor = useMemo(() => {
    if (socketStatus === "connected") {
      return 'bg-[#76b900]';
    } else if (socketStatus === "connecting") {
      return 'bg-orange-300';
    } else {
      return 'bg-red-400';
    }
  }, [socketStatus]);

  const socketButtonMsg = useMemo(() => {
    if (isOver) {
      return 'New Conversation';
    }
    if (socketStatus === "connected") {
      return 'Disconnect';
    } else {
      return 'Connecting...';
    }
  }, [isOver, socketStatus]);

  return (
    <SocketContext.Provider
      value={{
        socketStatus,
        sendMessage,
        socket,
      }}
    >
      <div className="main-grid">
        <header className="controls glass-card rounded-2xl px-6 py-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-[#76b900]/10 flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#76b900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
               </svg>
             </div>
             <div>
               <h2 className="font-bold text-white tracking-tight">Active Session</h2>
               <div className="flex items-center gap-2">
                 <div className={`h-2 w-2 rounded-full ${socketColor} ${socketStatus === 'connected' ? 'animate-pulse' : ''}`} />
                 <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{socketStatus}</span>
               </div>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <button
                onClick={onPressConnect}
                disabled={socketStatus !== "connected" && !isOver}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  isOver 
                    ? "bg-[#76b900] text-black hover:scale-105" 
                    : "bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                {socketButtonMsg}
              </button>
          </div>
        </header>

        {audioContext.current && worklet.current && (
          <MediaContext.Provider value={{
            startRecording,
            stopRecording,
            audioContext: audioContext as MutableRefObject<AudioContext>,
            worklet: worklet as MutableRefObject<AudioWorkletNode>,
            audioStreamDestination,
            stereoMerger,
            micDuration,
            actualAudioPlayed,
          }}>
            <main className="player animate-in fade-in duration-1000">
              <div className="relative flex flex-col items-center justify-center gap-12 py-12">
                {/* Visualizer Background */}
                <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-20">
                  <div className="w-64 h-64 rounded-full bg-[#76b900] blur-[120px] animate-pulse-slow" />
                </div>

                <div className="w-full max-w-sm aspect-square glass-card rounded-full flex items-center justify-center relative glow-border">
                  <ServerAudio
                    setGetAudioStats={(callback: () => AudioStats) =>
                      (getAudioStats.current = callback)
                    }
                    theme={theme}
                  />
                </div>

                <div className="w-24 h-24 glass-card rounded-full flex items-center justify-center">
                  <UserAudio theme={theme}/>
                </div>

                {audioURL && (
                  <div className="mt-4">
                    <a 
                      href={audioURL} 
                      download={`personaplex_audio.${getExtension("audio")}`} 
                      className="px-4 py-2 rounded-lg bg-white/5 text-zinc-400 text-xs font-bold hover:text-white transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Transcript Audio
                    </a>
                  </div>
                )}
              </div>
            </main>

            <aside className="player-text scrollbar">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Real-time Transcript</h3>
                 <div className="px-2 py-1 rounded bg-white/5 text-[10px] text-zinc-500 border border-white/5">FULL DUPLEX</div>
              </div>
              <div ref={textContainerRef} className="space-y-4">
                <TextDisplay containerRef={textContainerRef}/>
              </div>
            </aside>

            <div className="player-stats glass-card rounded-2xl p-6 animate-in fade-in slide-in-from-right-4 duration-700">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Signal Quality</h3>
              <ServerAudioStats getAudioStats={getAudioStats} />
              <div className="mt-6 border-t border-white/5 pt-6">
                <ServerInfo/>
              </div>
            </div>
          </MediaContext.Provider>
        )}
      </div>
    </SocketContext.Provider>
  );
};


        // </MediaContext.Provider> : undefined}
        // 
        // }></MediaContext.Provider>

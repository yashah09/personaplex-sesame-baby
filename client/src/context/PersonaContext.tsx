import { createContext, useContext, useRef, useState, useCallback, FC, ReactNode, MutableRefObject } from "react";
import moshiProcessorUrl from "../audio-processor.ts?worker&url";
import { prewarmDecoderWorker } from "../decoder/decoderWorker";
import { useModelParams } from "../pages/Conversation/hooks/useModelParams";

interface PersonaContextType {
    audioContext: MutableRefObject<AudioContext | null>;
    worklet: MutableRefObject<AudioWorkletNode | null>;
    isConnecting: boolean;
    isConnected: boolean;
    startSession: () => Promise<void>;
    stopSession: () => void;
    modelParams: any; // Simplified for now
}

const PersonaContext = createContext<PersonaContextType | null>(null);

export const PersonaProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const audioContext = useRef<AudioContext | null>(null);
    const worklet = useRef<AudioWorkletNode | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const modelParams = useModelParams();

    const startProcessor = useCallback(async () => {
        if (!audioContext.current) {
            audioContext.current = new AudioContext();
            prewarmDecoderWorker(audioContext.current.sampleRate);
        }
        if (worklet.current) return;

        let ctx = audioContext.current;
        await ctx.resume();

        try {
            worklet.current = new AudioWorkletNode(ctx, 'moshi-processor');
        } catch (err) {
            await ctx.audioWorklet.addModule(moshiProcessorUrl);
            worklet.current = new AudioWorkletNode(ctx, 'moshi-processor');
        }
        worklet.current.connect(ctx.destination);
    }, []);

    const startSession = useCallback(async () => {
        setIsConnecting(true);
        try {
            await startProcessor();
            await window.navigator.mediaDevices.getUserMedia({ audio: true });
            setIsConnected(true);
        } catch (e) {
            console.error(e);
        } finally {
            setIsConnecting(false);
        }
    }, [startProcessor]);

    const stopSession = useCallback(() => {
        setIsConnected(false);
    }, []);

    return (
        <PersonaContext.Provider value={{
            audioContext,
            worklet,
            isConnected,
            isConnecting,
            startSession,
            stopSession,
            modelParams
        }}>
            {children}
        </PersonaContext.Provider>
    );
};

export const usePersona = () => {
    const context = useContext(PersonaContext);
    if (!context) throw new Error("usePersona must be used within PersonaProvider");
    return context;
};

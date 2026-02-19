import { FC, RefObject, useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "../../hooks/audioUtils";
import { useSocketContext } from "../../SocketContext";
import { type ThemeType } from "../../hooks/useSystemTheme";

type AudioVisualizerProps = {
  analyser: AnalyserNode | null;
  parent: RefObject<HTMLElement>;
  theme: ThemeType;
};

const MAX_INTENSITY = 255;

export const ServerVisualizer: FC<AudioVisualizerProps> = ({ analyser, parent, theme }) => {
  const [canvasWidth, setCanvasWidth] = useState(parent.current ? Math.min(parent.current.clientWidth, parent.current.clientHeight) : 0);
  const requestRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { socketStatus } = useSocketContext();

  const draw = useCallback((width: number, centerX: number, centerY: number, audioData: Uint8Array, ctx: CanvasRenderingContext2D) => {
    const maxCircleWidth = Math.floor(width * 0.9);
    const averageIntensity = Math.sqrt(
      audioData.reduce((acc, curr) => acc + curr * curr, 0) / audioData.length,
    );
    const intensity = clamp(
      averageIntensity * 1.5,
      averageIntensity,
      MAX_INTENSITY,
    );
    const relIntensity = intensity / MAX_INTENSITY;
    const pulseRadius = ((socketStatus === "connected" ? 0.4 + 0.6 * relIntensity : 0.4) * maxCircleWidth) / 2;

    ctx.clearRect(0, 0, width, width);

    // Background glow
    if (socketStatus === "connected") {
      const gradient = ctx.createRadialGradient(centerX, centerY, pulseRadius * 0.5, centerX, centerY, pulseRadius * 1.5);
      gradient.addColorStop(0, "rgba(118, 185, 0, 0.4)");
      gradient.addColorStop(1, "rgba(118, 185, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius * 1.5, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Outer Ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxCircleWidth / 2, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner Pulsing Orb
    const orbGradient = ctx.createRadialGradient(
      centerX - pulseRadius * 0.3,
      centerY - pulseRadius * 0.3,
      0,
      centerX,
      centerY,
      pulseRadius
    );

    if (socketStatus === "connected") {
      orbGradient.addColorStop(0, "#a3e635");
      orbGradient.addColorStop(1, "#4d7c0f");
    } else {
      orbGradient.addColorStop(0, "#3f3f46");
      orbGradient.addColorStop(1, "#18181b");
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI);
    ctx.fillStyle = orbGradient;
    ctx.shadowBlur = socketStatus === "connected" ? 40 : 10;
    ctx.shadowColor = socketStatus === "connected" ? "rgba(118, 185, 0, 0.6)" : "rgba(0,0,0,0.5)";
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow

    // Center Core
    if (socketStatus === "connected") {
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxCircleWidth / 12, 0, 2 * Math.PI);
      ctx.fillStyle = "white";
      ctx.fill();
    }
  }, [socketStatus]);


  const visualizeData = useCallback(() => {
    const width = parent.current ? Math.min(parent.current.clientWidth, parent.current.clientHeight) : 0;
    if (width !== canvasWidth) {
      setCanvasWidth(width);
    }
    requestRef.current = window.requestAnimationFrame(() => visualizeData());
    if (!canvasRef.current) {
      console.log("Canvas not found");
      return;
    }
    const ctx = canvasRef.current.getContext("2d");
    const audioData = new Uint8Array(140);
    analyser?.getByteFrequencyData(audioData);
    if (!ctx) {
      console.log("Canvas context not found");
      return;
    }
    const centerX = width / 2;
    const centerY = width / 2;
    draw(width, centerX, centerY, audioData, ctx);
  }, [analyser, socketStatus, canvasWidth, parent]);


  useEffect(() => {
    if (!analyser) {
      return;
    }
    analyser.smoothingTimeConstant = 0.95;
    visualizeData();
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [visualizeData, analyser]);

  return (
    <canvas
      className="max-h-full max-w-full"
      ref={canvasRef}
      width={canvasWidth}
      height={canvasWidth}
    />
  );
};

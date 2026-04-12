"use client";

import { useEffect, useRef } from "react";

interface UseVisualizerOptions {
  analyser: AnalyserNode | null;
  isActive: boolean;
}

export function useVisualizer({ analyser, isActive }: UseVisualizerOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const observer = new ResizeObserver(() => resize());
    observer.observe(canvas);

    let frameId: number | null = null;
    const bufferLength = analyser?.frequencyBinCount ?? 0;
    const dataArray = bufferLength > 0 ? new Uint8Array(bufferLength) : null;

    const renderFrame = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      context.clearRect(0, 0, width, height);

      context.fillStyle = "#09090b";
      context.fillRect(0, 0, width, height);

      if (!isActive || !analyser || !dataArray) {
        context.fillStyle = "#27272a";
        for (let i = 0; i < 32; i += 1) {
          const barWidth = width / 40;
          const x = i * (barWidth + 3);
          const barHeight = 4;
          context.fillRect(x, height - barHeight - 3, barWidth, barHeight);
        }

        frameId = window.requestAnimationFrame(renderFrame);
        return;
      }

      analyser.getByteFrequencyData(dataArray);

      const barCount = 56;
      const step = Math.max(1, Math.floor(dataArray.length / barCount));
      const gap = 2;
      const barWidth = Math.max(2, (width - gap * (barCount - 1)) / barCount);

      for (let i = 0; i < barCount; i += 1) {
        const value = dataArray[i * step] ?? 0;
        const normalized = value / 255;
        const barHeight = Math.max(3, normalized * height);
        const x = i * (barWidth + gap);
        const y = height - barHeight;

        const gradient = context.createLinearGradient(0, y, 0, height);
        gradient.addColorStop(0, "#67e8f9");
        gradient.addColorStop(1, "#0f172a");

        context.fillStyle = gradient;
        context.fillRect(x, y, barWidth, barHeight);
      }

      frameId = window.requestAnimationFrame(renderFrame);
    };

    frameId = window.requestAnimationFrame(renderFrame);

    return () => {
      observer.disconnect();
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [analyser, isActive]);

  return { canvasRef };
}

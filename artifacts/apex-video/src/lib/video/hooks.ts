import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    startRecording?: () => void;
    stopRecording?: () => void;
  }
}

interface VideoPlayerOptions {
  durations: Record<string, number>;
  loop?: boolean;
}

/**
 * Core video playback hook. DO NOT MODIFY — recording/export pipeline depends on exact implementation.
 */
export function useVideoPlayer({ durations, loop = true }: VideoPlayerOptions) {
  const keys = Object.keys(durations);
  const [sceneIndex, setSceneIndex] = useState(0);
  const hasStarted = useRef(false);

  // Fire startRecording once on mount
  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      window.startRecording?.();
    }
  }, []);

  // Advance to next scene after current duration
  useEffect(() => {
    const key = keys[sceneIndex];
    const duration = durations[key] ?? 3000;

    const timer = setTimeout(() => {
      const next = sceneIndex + 1;
      if (next >= keys.length) {
        if (loop) {
          setSceneIndex(0);
        } else {
          window.stopRecording?.();
        }
      } else {
        setSceneIndex(next);
      }
    }, duration);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIndex]);

  return {
    currentScene: sceneIndex,
    currentSceneKey: keys[sceneIndex] ?? keys[0],
  };
}

/**
 * Returns a 0–1 progress value that advances over `duration` ms.
 * Resets when `duration` changes (i.e. on each scene change).
 */
export function useSceneTimer(duration: number): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const start = performance.now();
    const id = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p >= 1) window.clearInterval(id);
    }, 60);
    return () => window.clearInterval(id);
  }, [duration]);

  return progress;
}

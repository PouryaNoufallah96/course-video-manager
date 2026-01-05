import { useEffect, useState } from "react";

/**
 * Hook to monitor real-time audio volume level from a MediaStream.
 * Returns a normalized volume level from 0-1.
 */
export const useVolumeLevel = (opts: { mediaStream: MediaStream | null }) => {
  const [volumeLevel, setVolumeLevel] = useState<number>(0);

  useEffect(() => {
    if (!opts.mediaStream) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(opts.mediaStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animationFrameId: number;

    const updateVolume = () => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i]!;
      }
      const average = sum / dataArray.length;

      // Normalize to 0-1 range (255 is max value)
      const normalized = Math.min(1, average / 128);
      setVolumeLevel(normalized);

      animationFrameId = requestAnimationFrame(updateVolume);
    };

    updateVolume();

    return () => {
      cancelAnimationFrame(animationFrameId);
      source.disconnect();
      audioContext.close();
    };
  }, [opts.mediaStream]);

  return volumeLevel;
};

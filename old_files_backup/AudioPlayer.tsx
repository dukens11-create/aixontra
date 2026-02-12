"use client";

import { useEffect, useRef } from "react";

export default function AudioPlayer({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (ref.current) ref.current.load();
  }, [src]);

  return (
    <audio ref={ref} controls style={{ width: "100%" }}>
      <source src={src} />
      Your browser does not support audio playback.
    </audio>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

type SaveDataConnection = {
  saveData?: boolean;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
};

type NavigatorWithConnection = Navigator & {
  connection?: SaveDataConnection;
};

const posterSrc = "/hero/hero-network-poster.webp";
type VideoVariant = "desktop" | "mobile";

export function HeroVideoLayer() {
  const layerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [posterOnly, setPosterOnly] = useState(true);
  const [videoVariant, setVideoVariant] = useState<VideoVariant>("desktop");
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const connection = (navigator as NavigatorWithConnection).connection;

    const syncPosterMode = () => {
      setPosterOnly(Boolean(motionQuery.matches || connection?.saveData));
      setVideoVariant(mobileQuery.matches ? "mobile" : "desktop");
    };

    syncPosterMode();
    motionQuery.addEventListener("change", syncPosterMode);
    mobileQuery.addEventListener("change", syncPosterMode);
    connection?.addEventListener?.("change", syncPosterMode);

    return () => {
      motionQuery.removeEventListener("change", syncPosterMode);
      mobileQuery.removeEventListener("change", syncPosterMode);
      connection?.removeEventListener?.("change", syncPosterMode);
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    const video = videoRef.current;

    if (!layer || !video || posterOnly || videoFailed) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => video.pause());
        } else {
          video.pause();
        }
      },
      { threshold: 0.08 },
    );

    observer.observe(layer);
    return () => observer.disconnect();
  }, [posterOnly, videoFailed]);

  if (videoFailed) {
    return null;
  }

  if (posterOnly) {
    return (
      <div
        className="hero-video-layer hero-video-layer--poster-only"
        style={{ backgroundImage: `url(${posterSrc})` }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div ref={layerRef} className="hero-video-layer" aria-hidden="true">
      <video
        ref={videoRef}
        className="hero-video-layer__video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={posterSrc}
        onError={() => setVideoFailed(true)}
      >
        <source src={`/hero/hero-network-${videoVariant === "mobile" ? "720" : "1080"}.webm`} type="video/webm" />
        <source src={`/hero/hero-network-${videoVariant === "mobile" ? "720" : "1080"}.mp4`} type="video/mp4" />
      </video>
    </div>
  );
}

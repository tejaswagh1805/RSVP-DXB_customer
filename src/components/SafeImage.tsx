import { useState } from "react";
import fallbackImage from "@/assets/hero.jpg";

export function SafeImage({ src, alt, className = "", loading = "lazy" }: { src: string; alt: string; className?: string; loading?: "lazy" | "eager" }) {
  const [failed, setFailed] = useState(false);
  if (!src) return <div className={`bg-surface-2 ${className}`} role="img" aria-label={`${alt} image unavailable`} />;
  return <img src={failed ? fallbackImage : src} alt={alt} loading={loading} decoding="async" onError={() => setFailed(true)} className={className} />;
}

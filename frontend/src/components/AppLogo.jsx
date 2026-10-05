import { MessageCircleMore } from "lucide-react";

export const APP_NAME = "MultiChat";

export function AppLogo({ className = "", size = 32, alt = APP_NAME }) {
  return (
    <span
      role="img"
      aria-label={alt}
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground ${className}`}
      style={{ width: size, height: size }}
    >
      <MessageCircleMore size={Math.round(size * 0.58)} strokeWidth={2.2} aria-hidden />
    </span>
  );
}

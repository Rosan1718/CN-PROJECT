import { APP_NAME, AppLogo } from "../AppLogo";
import { ThemePresetPicker } from "../ThemePresetPicker";
import { ThemeToggle } from "../ThemeToggle";
import { WallpaperPicker } from "../WallpaperPicker";

function AuthHeader() {
  return (
    <header className="sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b border-white/10 bg-slate-950/80 px-3 py-2.5 backdrop-blur-xl">
      <div className="flex flex-1 items-center gap-2.5 px-1">
        <div className="rounded-xl bg-[linear-gradient(135deg,#22d3ee,#8b5cf6)] p-1.5 shadow-[0_0_20px_rgba(34,211,238,0.35)] ring-1 ring-cyan-400/40">
          <AppLogo size={28} className="rounded-[7px]" alt="" />
        </div>

        <div>
          <p className="truncate text-[15px] font-semibold leading-tight text-white">{APP_NAME}</p>
          <p className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-300/80">
            Private session
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-slate-200">
        <WallpaperPicker />

        <ThemePresetPicker />

        <ThemeToggle />
      </div>
    </header>
  );
}
export default AuthHeader;

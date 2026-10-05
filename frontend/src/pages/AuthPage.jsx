import { AuthActionPanel } from "../components/auth/AuthActionPanel";
import AuthHeader from "../components/auth/AuthHeader";
import { AuthHeroPanel } from "../components/auth/AuthHeroPanel";
import { useWallpaper } from "../context/wallpaper";

function AuthPage() {
  const { frameStyle } = useWallpaper();

  return (
    <div
      className="box-border flex min-h-dvh flex-col bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_30%),linear-gradient(135deg,#020817_0%,#0f172a_28%,#111827_100%)] p-3 sm:p-5 md:p-8"
      style={frameStyle}
    >
      <div className="mx-auto flex w-full max-w-368 flex-1 flex-col overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/70 text-foreground shadow-[0_32px_120px_rgba(15,23,42,0.72)] backdrop-blur-2xl">
        <AuthHeader />

        <main className="relative flex flex-1 flex-col overflow-hidden md:flex-row">
          <AuthHeroPanel />
          <AuthActionPanel />
        </main>
      </div>
    </div>
  );
}
export default AuthPage;

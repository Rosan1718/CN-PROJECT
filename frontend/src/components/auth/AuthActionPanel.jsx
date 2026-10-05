import { useClerk } from "@clerk/react";
import { Button } from "@heroui/react";
import { ArrowRightIcon, ShieldCheckIcon, SparklesIcon } from "lucide-react";
import { AppLogo } from "../AppLogo";
import { AuthCardShell } from "./AuthCardShell";

const AFTER_AUTH = "/";

const logoTileClassName = [
  "relative rounded-[22px] bg-[linear-gradient(135deg,#0f172a,#111827,#1d4ed8)] p-2.5",
  "shadow-[0_0_30px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400/30",
].join(" ");

const continueButtonClassName = [
  "group relative h-13 overflow-hidden rounded-[18px] text-[15px] font-semibold",
  "bg-[linear-gradient(135deg,#22d3ee,#3b82f6,#8b5cf6)] text-white",
  "shadow-[0_18px_35px_rgba(59,130,246,0.45)]",
  "transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]",
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[18px]",
  "after:shadow-[inset_0_1px_0_rgba(255,255,255,0.32)]",
].join(" ");

export function AuthActionPanel() {
  const clerk = useClerk();

  return (
    <section className="relative flex flex-1 flex-col items-stretch justify-center overflow-hidden bg-[linear-gradient(180deg,rgba(15,23,42,0.4),rgba(15,23,42,0.05))] px-5 py-12 sm:px-10 md:px-14 md:py-10 lg:px-16">
      <AuthCardShell>
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-5">
            <div
              aria-hidden
              className="absolute -inset-3.5 rounded-[22px] bg-[radial-gradient(circle,_rgba(34,211,238,0.25),_transparent_62%)] blur-xl"
            />
            <div className={logoTileClassName}>
              <AppLogo size={52} className="rounded-xl" alt="" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-cyan-300">
            <SparklesIcon className="size-3.5" strokeWidth={2} aria-hidden />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
              Secure entry
            </span>
          </div>
        </div>

        {
          <Button
            fullWidth
            size="lg"
            variant="primary"
            className={continueButtonClassName}
            onPress={() => {
              clerk.openSignIn({ fallbackRedirectUrl: AFTER_AUTH, forceRedirectUrl: AFTER_AUTH });
            }}
          >
            <span className="relative z-1 flex items-center justify-center gap-2">
              Continue
              <ArrowRightIcon
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </Button>
        }

        <div className="mt-8 flex items-center justify-center gap-2 border-t border-white/10 pt-6 text-[11px] font-medium text-slate-300">
          <ShieldCheckIcon
            className="size-3.5 shrink-0 text-emerald-400"
            strokeWidth={2}
            aria-hidden
          />
          <span>Protected session · TLS encryption</span>
        </div>
      </AuthCardShell>
    </section>
  );
}

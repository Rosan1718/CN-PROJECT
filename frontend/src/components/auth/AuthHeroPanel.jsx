import { APP_NAME } from "../AppLogo";
import { AuthHeroPattern } from "./AuthHeroPattern";

const heroPanelClassName = [
  "relative flex min-h-[min(320px,42vh)] shrink-0 flex-col overflow-hidden",
  "bg-[linear-gradient(135deg,#0f172a_0%,#111827_30%,#1e1b4b_100%)]",
  "md:w-[44%] md:max-w-xl md:border-r md:border-white/10",
  "lg:w-[42%] lg:max-w-none",
].join(" ");

const heroImageClassName = [
  "h-auto max-h-[min(44vh,380px)] w-[min(92%,19rem)]",
  "animate-[auth-float-y_4.5s_ease-in-out_infinite]",
  "object-contain object-center select-none motion-reduce:animate-none",
  "sm:w-[min(88%,21rem)] md:max-h-[min(52vh,440px)] md:w-[min(90%,22rem)]",
].join(" ");

export function AuthHeroPanel() {
  return (
    <section className={heroPanelClassName}>
      <AuthHeroPattern />

      <div className="relative z-1 flex flex-1 flex-col px-6 pb-6 pt-8 md:px-8 md:pb-8 md:pt-10">
        <div className="text-center md:text-left">
          <p className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-300">
            Stay connected
          </p>
          <h2 className="text-balance font-mono text-[1.15rem] font-semibold uppercase leading-snug tracking-[0.12em] text-white sm:text-[1.3rem]">
            Welcome to {APP_NAME}
          </h2>
          <p className="mx-auto mt-2.5 max-w-[22rem] text-pretty font-mono text-[11px] font-medium leading-relaxed tracking-[0.08em] text-slate-300 md:mx-0 md:max-w-none">
            Bring your conversations together. Sign in to message people and share updates.
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center py-6 md:py-4">
          <img
            src="/auth.png"
            alt=""
            width={640}
            height={640}
            className={heroImageClassName}
            draggable={false}
            decoding="async"
          />
        </div>

        <p className="text-center font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 md:text-left">
          A simpler place for everyday conversations
        </p>
      </div>
    </section>
  );
}

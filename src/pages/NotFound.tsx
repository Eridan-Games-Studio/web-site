import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Starfield } from '@/components/Starfield';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?<>{}[]~^";

/** Scrambles `text` then resolves one character at a time. */
function useScrambleText(text: string, delayMs = 600, intervalMs = 40) {
  const [display, setDisplay] = useState(() =>
    Array.from({ length: text.length }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join("")
  );

  useEffect(() => {
    let resolved = 0;
    const timeout = setTimeout(() => {
      const id = setInterval(() => {
        resolved++;
        setDisplay(
          text.slice(0, resolved) +
            Array.from({ length: text.length - resolved }, () =>
              GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
            ).join("")
        );
        if (resolved >= text.length) clearInterval(id);
      }, intervalMs);
      return () => clearInterval(id);
    }, delayMs);
    return () => clearTimeout(timeout);
  }, [text, delayMs, intervalMs]);

  return display;
}

const NotFound = () => {
  const location = useLocation();
  const scrambled = useScrambleText("SIGNAL LOST", 800, 55);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-cosmic-gradient">
      <Starfield />
      <Navigation />

      <main className="relative flex min-h-[80vh] items-center justify-center px-6 overflow-hidden">
        {/* Decorative orbit rings */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <div className="absolute h-[420px] w-[420px] animate-[spin_30s_linear_infinite] rounded-full border border-primary/10 sm:h-[520px] sm:w-[520px]" />
          <div className="absolute h-[580px] w-[580px] animate-[spin_45s_linear_infinite_reverse] rounded-full border border-secondary/10 sm:h-[700px] sm:w-[700px]" />
          <div className="absolute h-[740px] w-[740px] animate-[spin_60s_linear_infinite] rounded-full border border-accent/5 sm:h-[880px] sm:w-[880px]" />

          {/* Orbiting dot on the middle ring */}
          <div className="absolute h-[580px] w-[580px] animate-[spin_12s_linear_infinite] sm:h-[700px] sm:w-[700px]">
            <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_12px_3px_rgba(56,189,248,0.6)]" />
          </div>
        </div>

        <div className="relative z-10 text-center">
          {/* Big 404 */}
          <h1 className="font-fantasy text-[10rem] font-bold leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-primary via-secondary to-accent/60 drop-shadow-[0_0_40px_rgba(56,189,248,0.25)] sm:text-[12rem]">
            404
          </h1>

          {/* Scramble line */}
          <p className="mt-2 font-mono text-sm tracking-[0.35em] text-primary/70 uppercase">
            {scrambled}
          </p>

          {/* Divider glow */}
          <div className="mx-auto my-8 h-px w-48 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Copy */}
          <p className="mx-auto max-w-md text-lg text-muted-foreground">
            You've drifted beyond charted space.
            <br />
            The coordinates <span className="font-mono text-primary/80">{location.pathname}</span> don't match any known world.
          </p>

          {/* Action buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg border border-primary/30 bg-primary/10 px-8 py-3 font-medium text-primary transition-all hover:bg-primary/20 hover:border-primary/60 hover:shadow-[0_0_24px_rgba(56,189,248,0.15)]"
            >
              <span className="transition-transform group-hover:-translate-x-0.5">&#8592;</span>
              <span>Return Home</span>
            </Link>

            <Link
              to="/worlds"
              className="inline-flex items-center gap-2 rounded-lg border border-secondary/20 px-8 py-3 font-medium text-secondary/80 transition-all hover:border-secondary/50 hover:text-secondary hover:bg-secondary/5"
            >
              <span>Explore Worlds</span>
              <span className="transition-transform group-hover:translate-x-0.5">&#8594;</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;

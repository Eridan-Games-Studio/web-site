import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { games } from '@/data/games';

const statusColors: Record<string, string> = {
  'Concept': 'text-muted-foreground border-muted-foreground/40 bg-muted-foreground/10',
  'Design Phase': 'text-blue-400 border-blue-400/40 bg-blue-400/10',
  'In Development': 'text-amber-400 border-amber-400/40 bg-amber-400/10',
  'Coming Soon': 'text-cyan-400 border-cyan-400/40 bg-cyan-400/10',
  'Released': 'text-green-400 border-green-400/40 bg-green-400/10',
  'Testing Phase': 'text-purple-400 border-purple-400/40 bg-purple-400/10',
  'Development Phase': 'text-amber-400 border-amber-400/40 bg-amber-400/10',
};

export const HeroSection = () => {
  const prefersReducedMotion = useReducedMotion();

  const scrollToContent = () => {
    const worldsSection = document.getElementById('worlds');
    if (worldsSection) {
      worldsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-16 pb-8">
      {/* Base cosmic gradient */}
      <div className="absolute inset-0 bg-cosmic-radial z-10" />

      {/* Animated gradient orbs - respects reduced motion */}
      <div className="absolute inset-0 overflow-hidden z-5">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cosmic-purple/20 blur-[100px]"
          animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cosmic-blue/20 blur-[80px]"
          animate={prefersReducedMotion ? {} : { scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-6 lg:gap-10 items-center py-8">
          {/* Left side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4"
              >
                Eridan Games
              </motion.p>
              <h1 className="font-fantasy text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-wide leading-tight [text-wrap:balance]">
                Where shores
                <br />
                meet{' '}
                <span className="text-star-gradient glow-text">stars</span>
              </h1>
            </div>

            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Crafting worlds filled with wonder, challenge, and contrast—where your choices shape the narrative.
            </p>

            <div className="pt-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground/70 [font-variant-numeric:tabular-nums]">
                {games.length} Projects in Development
              </span>
            </div>
          </motion.div>

          {/* Right side - Games Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {games.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                >
                  <Link
                    to={`/games/${game.id}`}
                    className="group block relative aspect-[4/3] rounded-xl overflow-hidden cosmic-card border-border/30 hover:border-primary/50 focus-visible:border-primary/50 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {/* Game Image */}
                    <img
                      src={game.conceptArt || game.image}
                      alt={game.title}
                      width={400}
                      height={300}
                      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4">
                      {/* Status badge */}
                      <span className={`self-start px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full border mb-2 ${statusColors[game.status]}`}>
                        {game.status}
                      </span>

                      {/* Title */}
                      <h3 className="font-fantasy text-sm sm:text-base lg:text-lg font-semibold text-foreground leading-tight mb-1 group-hover:text-primary transition-colors">
                        {game.title}
                      </h3>

                      {/* Description - truncated */}
                      <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {game.shortDescription}
                      </p>
                    </div>

                    {/* Hover glow effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
                  </Link>
                </motion.div>
              ))}

            </div>

            {/* Discover Games Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + games.length * 0.1 }}
              className="mt-4 flex justify-center"
            >
              <Link
                to="/games"
                className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 hover:border-primary/50 focus-visible:bg-primary/20 focus-visible:border-primary/50 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="font-fantasy text-sm font-semibold text-foreground group-hover:text-primary group-focus-visible:text-primary transition-colors">
                  Discover all of our Games
                </span>
                <span className="text-primary group-hover:translate-x-1 group-focus-visible:translate-x-1 transition-transform" aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

    </section>
  );
};

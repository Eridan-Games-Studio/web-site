import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Starfield } from '@/components/Starfield';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { worlds as worldsData, World } from '@/data/worlds';

// Map worlds to their positions: top, bottom-left, bottom-right
const getWorldByPosition = (position: 'top' | 'bottom-left' | 'bottom-right') => {
  const mapping: Record<string, 'top' | 'bottom-left' | 'bottom-right'> = {
    'the-age-of-rika': 'top',
    'haven-world': 'bottom-left',
    'atomic-horizon': 'bottom-right',
  };
  return worldsData.find(w => mapping[w.id] === position);
};

// Pie slice clip-paths
const pieSlices = {
  top: 'polygon(50% 50%, 6.7% 25%, 25% 6.7%, 50% 0%, 75% 6.7%, 93.3% 25%)',
  'bottom-left': 'polygon(50% 50%, 50% 100%, 25% 93.3%, 6.7% 75%, 0% 50%, 6.7% 25%)',
  'bottom-right': 'polygon(50% 50%, 93.3% 25%, 100% 50%, 93.3% 75%, 75% 93.3%, 50% 100%)',
};

// World theme colors
const worldColors: Record<string, { accent: string; bg: string; text: string; border: string }> = {
  'the-age-of-rika': {
    accent: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-200/80',
    border: 'border-cyan-500/30',
  },
  'haven-world': {
    accent: 'text-purple-400',
    bg: 'bg-purple-500/10',
    text: 'text-purple-200/80',
    border: 'border-purple-500/30',
  },
  'atomic-horizon': {
    accent: 'text-amber-400',
    bg: 'bg-amber-500/10',
    text: 'text-amber-200/80',
    border: 'border-amber-500/30',
  },
};


interface PieSectionProps {
  world: World;
  position: 'top' | 'bottom-left' | 'bottom-right';
  isActive: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onTouchActivate: () => void;
}

const PieSection = ({ world, position, isActive, onHoverStart, onHoverEnd, onTouchActivate }: PieSectionProps) => {
  const clipPath = pieSlices[position];
  const colors = worldColors[world.id];

  const textPositions = {
    top: 'top-[18%] left-1/2 -translate-x-1/2 w-[55%]',
    'bottom-left': 'top-[58%] left-[8%] w-[38%]',
    'bottom-right': 'top-[58%] right-[8%] w-[38%]',
  };

  return (
    <Link
      to={`/worlds/${world.slug}`}
      className="absolute inset-0 group focus-visible:outline-none touch-manipulation"
      style={{ clipPath }}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onTouchStart={(e) => {
        if (!isActive) {
          e.preventDefault();
          onTouchActivate();
        }
      }}
      onClick={(e) => {
        // On mobile, first touch activates, second touch navigates
        if ('ontouchstart' in window && !isActive) {
          e.preventDefault();
          onTouchActivate();
        }
      }}
    >
      <motion.div
        className={`absolute inset-0 overflow-hidden transition-all duration-300 ${isActive ? 'bg-card/40' : 'bg-card/70 hover:bg-card/50'
          }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Hover glow effect */}
        <div className={`absolute inset-0 transition-colors duration-500 ${isActive ? colors.bg : 'bg-transparent group-hover:bg-primary/5'
          }`} />

        {/* World name and instruction */}
        <div className={`absolute ${textPositions[position]} text-center z-10 p-2 flex flex-col items-center gap-1`}>
          <h3 className={`font-fantasy text-base sm:text-base lg:text-lg font-semibold transition-colors duration-300 ${isActive ? colors.accent : 'text-foreground/90 group-hover:text-primary'
            }`}>
            {world.name}
          </h3>

          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 5 }}
            className={`text-[10px] uppercase tracking-widest font-medium ${colors.accent} opacity-80`}
          >
            Click to explore
          </motion.span>
        </div>
      </motion.div>
    </Link>
  );
};

// Swipable Pillar component for mobile
const MobilePillarSwiper = ({ pillars, colors }: { pillars: World['gameplayPillars']; colors: any }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextPillar = () => {
    setCurrentIndex((prev) => (prev + 1) % pillars.length);
  };

  const prevPillar = () => {
    setCurrentIndex((prev) => (prev - 1 + pillars.length) % pillars.length);
  };

  return (
    <div className="lg:hidden space-y-6">
      <div className="text-center space-y-2">
        <h3 className="font-fantasy text-3xl sm:text-4xl font-semibold text-foreground uppercase tracking-widest">
          Core Themes
        </h3>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          The foundational pillars that define {pillars[0]?.title ? 'this world' : 'the setting'}
        </p>
      </div>

      <div className="relative overflow-hidden pt-4 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`cosmic-card p-8 border ${colors.border} min-h-[300px] flex flex-col justify-center text-center`}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) nextPillar();
              else if (info.offset.x > 50) prevPillar();
            }}
          >
            <h4 className={`font-fantasy text-2xl font-bold ${colors.accent} mb-6 uppercase tracking-wider`}>
              {pillars[currentIndex].title}
            </h4>
            <div className="space-y-4">
              {pillars[currentIndex].text.split('\n\n').map((para, i) => (
                <p key={i} className="text-muted-foreground text-sm leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {pillars.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? `${colors.accent.replace('text-', 'bg-')} w-4` : 'bg-primary/20'
                }`}
              aria-label={`Go to pillar ${i + 1}`}
            />
          ))}
        </div>

        <p className="text-center text-[10px] text-muted-foreground/30 mt-4 uppercase tracking-widest animate-pulse">
          ← Swipe to explore →
        </p>
      </div>
    </div>
  );
};

// Info Panel Component
const WorldInfoPanel = ({ world }: { world: World | null }) => {
  if (!world) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center">
            <span className="text-4xl">🌍</span>
          </div>
          <p className="font-fantasy text-2xl font-semibold mb-2">Explore Our Worlds</p>
          <p className="text-base text-muted-foreground/80">Hover over a world segment to learn more</p>
        </div>
      </div>
    );
  }

  const colors = worldColors[world.id];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={world.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {/* Mobile Swiper - shown on mobile and tablet */}
        <MobilePillarSwiper pillars={world.gameplayPillars} colors={colors} />

        {/* Desktop View - shown only on lg screens */}
        <div className="hidden lg:flex flex-col gap-8">
          {/* About Box */}
          <div className={`cosmic-card p-6 border ${colors.border}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-2 h-8 rounded-full ${colors.accent.replace('text-', 'bg-')}`} />
              <h3 className="font-fantasy text-xl font-semibold text-foreground">About</h3>
            </div>

            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-primary/20">
                <img
                  src={world.image}
                  alt={world.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-fantasy text-lg font-semibold ${colors.accent} mb-1`}>
                  {world.name}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                  {world.tagline}
                </p>
              </div>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed mt-4">
              {world.description.split('\n')[0]}
            </p>
          </div>

          {/* Core Pillars Box */}
          <div className={`cosmic-card p-6 border ${colors.border}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-2 h-8 rounded-full ${colors.accent.replace('text-', 'bg-')}`} />
              <h3 className="font-fantasy text-xl font-semibold text-foreground">Core Pillars</h3>
            </div>

            <div className="space-y-4">
              {world.gameplayPillars.slice(0, 3).map((pillar, index) => (
                <div key={index} className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                  <h4 className={`font-medium ${colors.accent} text-sm mb-1`}>
                    {pillar.title}
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                    {pillar.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const Worlds = () => {
  const [hoveredWorld, setHoveredWorld] = useState<string | null>(null);

  const topWorld = getWorldByPosition('top');
  const bottomLeftWorld = getWorldByPosition('bottom-left');
  const bottomRightWorld = getWorldByPosition('bottom-right');

  if (!topWorld || !bottomLeftWorld || !bottomRightWorld) {
    return null;
  }

  // Get the currently hovered world data
  const activeWorld = hoveredWorld
    ? worldsData.find(w => w.id === hoveredWorld) || null
    : null;

  // Background image based on hovered world
  const backgroundImage =
    hoveredWorld === 'haven-world' ? '/content/images/world.noir.jpg' :
      hoveredWorld === 'the-age-of-rika' ? '/content/images/rika-liguni-zeleni.png' :
        hoveredWorld === 'atomic-horizon' ? '/content/images/world-atomic-horizon.png' :
          '/content/images/planet.jpg';

  return (
    <div className="min-h-screen bg-cosmic-gradient">
      <Starfield />
      <Navigation />

      <main className="relative pt-32 pb-20">
        {/* Hero Header */}
        <section className="relative px-6 mb-12">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-fantasy text-5xl sm:text-6xl font-semibold mb-6"
            >
              Our <span className="text-cosmic-gradient">Worlds</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto"
            >
              We build authentic, boldly contrasted worlds, where every layer invites discovery.
            </motion.p>
          </div>
        </section>

        {/* Two-column layout */}
        <section className="px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left: Pie Circle Menu */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative w-full aspect-square max-w-md mx-auto rounded-full overflow-hidden border-2 border-primary/30"
            >
              {/* Background image - changes on hover */}
              <img
                src={backgroundImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none transition-all duration-500"
              />

              {/* Top slice - Rule of Rika */}
              <PieSection
                world={topWorld}
                position="top"
                isActive={hoveredWorld === topWorld.id}
                onHoverStart={() => setHoveredWorld(topWorld.id)}
                onHoverEnd={() => setHoveredWorld(null)}
                onTouchActivate={() => setHoveredWorld(topWorld.id)}
              />

              {/* Bottom-left slice - Haven */}
              <PieSection
                world={bottomLeftWorld}
                position="bottom-left"
                isActive={hoveredWorld === bottomLeftWorld.id}
                onHoverStart={() => setHoveredWorld(bottomLeftWorld.id)}
                onHoverEnd={() => setHoveredWorld(null)}
                onTouchActivate={() => setHoveredWorld(bottomLeftWorld.id)}
              />

              {/* Bottom-right slice - Atomic Horizon */}
              <PieSection
                world={bottomRightWorld}
                position="bottom-right"
                isActive={hoveredWorld === bottomRightWorld.id}
                onHoverStart={() => setHoveredWorld(bottomRightWorld.id)}
                onHoverEnd={() => setHoveredWorld(null)}
                onTouchActivate={() => setHoveredWorld(bottomRightWorld.id)}
              />

              {/* Center point decoration */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/50 z-20 pointer-events-none" />
            </motion.div>

            {/* Right: Info Panels */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="min-h-[400px] lg:min-h-[500px]"
            >
              <WorldInfoPanel world={activeWorld} />
            </motion.div>
          </div>
        </section>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Worlds;

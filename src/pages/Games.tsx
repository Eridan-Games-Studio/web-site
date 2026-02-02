import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Starfield } from '@/components/Starfield';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { games as gamesData } from '@/data/games';
import { getWorldByGameId } from '@/data/worlds';

// Phase categories mapping
const phaseMapping: Record<string, string> = {
  'Concept': 'Design',
  'Design Phase': 'Design',
  'In Development': 'Development',
  'Development Phase': 'Development',
  'Testing Phase': 'Playtesting',
  'Coming Soon': 'Development',
  'Released': 'Released',
};

const phases = ['Design', 'Development', 'Playtesting'] as const;

// Transform games for display
const games = gamesData.map(game => {
  const world = getWorldByGameId(game.id);
  return {
    id: game.id,
    title: game.title,
    description: game.shortDescription,
    imageUrl: game.conceptArt || game.image,
    worldName: world?.name || '',
    worldId: world?.id || '',
    status: game.status,
    phase: phaseMapping[game.status] || 'Development',
    // Combine all categories for filtering
    allTags: [...game.type, ...game.players, ...game.theme],
  };
});

// Extract unique values for each category directly from game data
const filterGroups: Record<string, string[]> = {
  'Type': Array.from(new Set(gamesData.flatMap(game => game.type))),
  'Players': Array.from(new Set(gamesData.flatMap(game => game.players))),
  'Theme': Array.from(new Set(gamesData.flatMap(game => game.theme))),
};

// Only include groups that have values
const activeFilterGroups = Object.entries(filterGroups).reduce((acc, [group, values]) => {
  if (values.length > 0) {
    acc[group] = values;
  }
  return acc;
}, {} as Record<string, string[]>);

interface ScrollableRowProps {
  title: string;
  children: React.ReactNode;
  isEmpty?: boolean;
}

const ScrollableRow = ({ title, children, isEmpty }: ScrollableRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (isEmpty) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-fantasy text-xl font-semibold text-foreground">
          {title}
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="p-1.5 rounded-lg bg-card/50 border border-border/30 hover:bg-card hover:border-primary/30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="p-1.5 rounded-lg bg-card/50 border border-border/30 hover:bg-card hover:border-primary/30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent pb-2"
      >
        {children}
      </div>
    </div>
  );
};

const Games = () => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // Toggle genre selection
  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  // Filter games by selected filters (AND logic)
  const filteredGames = useMemo(() => {
    if (selectedGenres.length === 0) return games;
    return games.filter(game =>
      selectedGenres.every(selected =>
        game.allTags.some(tag => tag.toLowerCase() === selected.toLowerCase())
      )
    );
  }, [selectedGenres]);

  // Group games by phase
  const gamesByPhase = useMemo(() => {
    const grouped: Record<string, typeof games> = {
      Design: [],
      Development: [],
      Playtesting: [],
    };
    filteredGames.forEach(game => {
      if (grouped[game.phase]) {
        grouped[game.phase].push(game);
      }
    });
    return grouped;
  }, [filteredGames]);

  return (
    <div className="min-h-screen bg-cosmic-gradient">
      <Starfield />
      <Navigation />

      <main className="relative pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Compact Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h1 className="font-fantasy text-3xl font-semibold mb-2">
              Our <span className="text-cosmic-gradient">Games</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Worlds in development, stories in motion.
            </p>
          </motion.div>

          {/* Horizontal Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-8"
          >
            {/* Filter Groups */}
            <div className="flex flex-wrap items-center gap-6">
              {Object.entries(activeFilterGroups).map(([groupName, values]) => (
                <div key={groupName} className="flex items-center gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                    {groupName}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {values.map((value) => {
                      const isSelected = selectedGenres.some(
                        s => s.toLowerCase() === value.toLowerCase()
                      );
                      return (
                        <button
                          type="button"
                          key={value}
                          onClick={() => toggleGenre(value)}
                          className={`
                            relative px-3 py-1 rounded-full text-[11px] font-medium
                            transition-all duration-300 ease-out
                            border backdrop-blur-sm
                            ${isSelected
                              ? 'bg-primary/20 border-primary/60 text-primary shadow-[0_0_12px_rgba(139,92,246,0.4)] scale-105'
                              : 'bg-card/40 border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-card/60'
                            }
                          `}
                        >
                          {/* Glow effect for selected */}
                          {isSelected && (
                            <span className="absolute inset-0 rounded-full bg-primary/10 blur-sm" />
                          )}
                          <span className="relative">{value}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Clear filters */}
              <AnimatePresence>
                {selectedGenres.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    type="button"
                    onClick={() => setSelectedGenres([])}
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] text-muted-foreground/70 hover:text-foreground hover:bg-card/40 transition-all"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Active filter indicator */}
            {selectedGenres.length > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-xs text-muted-foreground"
              >
                Showing games matching: {selectedGenres.join(' + ')}
              </motion.p>
            )}
          </motion.div>

          {/* Game Phase Rows */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {phases.map((phase) => (
              <ScrollableRow
                key={phase}
                title={`${phase} Phase`}
                isEmpty={gamesByPhase[phase].length === 0}
              >
                {gamesByPhase[phase].map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex-shrink-0"
                  >
                    <Link
                      to={`/games/${game.id}`}
                      className="group block w-40 rounded-lg overflow-hidden cosmic-card border-border/30 hover:border-primary/50 transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={game.imageUrl}
                          alt={game.title}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

                        {/* World badge */}
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[8px] font-medium rounded bg-primary/30 backdrop-blur-sm border border-primary/40">
                          {game.worldName}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-2">
                        <h3 className="font-fantasy text-xs font-semibold text-foreground leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1">
                          {game.title}
                        </h3>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {game.description}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </ScrollableRow>
            ))}

            {/* Empty state when no games match filter */}
            {filteredGames.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No games match the selected filters.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedGenres([])}
                  className="mt-2 text-primary hover:underline text-sm"
                >
                  Clear filters
                </button>
              </div>
            )}
          </motion.div>

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <span>←</span>
              <span>Back to Home</span>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Games;

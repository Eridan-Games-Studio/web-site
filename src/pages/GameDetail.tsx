import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, BookOpen, Play, Users, Calendar, Gamepad2, Tag } from 'lucide-react';
import { Starfield } from '@/components/Starfield';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { getGameById, getGamesByWorld } from '@/data/games';
import { getWorldByGameId } from '@/data/worlds';

const developerImages: Record<string, string> = {
  'Borjan Dujmović': '/content/images/boki2.jpg',
  'Dino Đorić': '/content/images/dino2.jpg',
  'Matej Pupačić': '/content/images/Maki.jpg',
  'Matija': '/content/images/matijatest.jpg',
  'Nikola Serdarević': '/content/images/nikola.jpg',
  'Sven Vukelić': '/content/images/sven.jpg',
  'Vuk Dragičević': '/content/images/vuk.jpg',
  'Tomislav Furlanis': '/content/images/slika.tom.jpg',
  'Siniša Družeta': '/content/images/sinisa.jpg',
};

const GameDetail = () => {
  const { gameId } = useParams<{ gameId: string }>();

  const game = getGameById(gameId || '');
  const world = game ? getWorldByGameId(game.id) : undefined;
  const relatedGames = world ? getGamesByWorld(world.id).filter(g => g.id !== game?.id) : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-background relative">
        <Starfield />
        <Navigation />
        <main className="relative z-10 container mx-auto px-6 py-32 text-center">
          <h1 className="font-fantasy text-4xl font-bold text-foreground mb-4">Game Not Found</h1>
          <p className="text-muted-foreground mb-8">The game you're looking for doesn't exist.</p>
          <Link to="/games" className="inline-flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Build developers array from game.developers object
  const developers = Object.entries(game.developers)
    .filter(([_, value]) => value)
    .map(([key, value]) => ({
      name: value as string,
      role: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim(),
    }));

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <Starfield />
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-fantasy text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground glow-text">
              {game.title}
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mt-4 max-w-2xl mx-auto">
              {game.synopsis}
            </p>
            {game.wikiUrl && (
              <motion.a
                href={game.wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors font-medium"
              >
                <BookOpen className="w-5 h-5" />
                Dive Deeper into the Wiki
              </motion.a>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10">
        <div className="container mx-auto px-6 py-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* About the Game */}
              <motion.section variants={itemVariants} className="cosmic-card p-6 sm:p-8">
                <h2 className="font-fantasy text-2xl font-semibold text-foreground glow-text mb-4 flex items-center gap-3">
                  <span className="text-primary">◆</span>
                  About the Game
                </h2>
                <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                  {game.description}
                </p>
              </motion.section>


              {/* Concept Art */}
              {game.conceptArt && (
                <motion.section variants={itemVariants} className="cosmic-card p-6 sm:p-8">
                  <h2 className="font-fantasy text-2xl font-semibold text-foreground glow-text mb-4 flex items-center gap-3">
                    <span className="text-primary">◆</span>
                    Concept Art
                  </h2>
                  <div className="relative rounded-lg overflow-hidden border-glow max-w-md mx-auto">
                    <img
                      src={game.conceptArt}
                      alt={`${game.title} concept art`}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </motion.section>
              )}

              {/* Screenshots */}
              {game.gallery && game.gallery.length > 0 && (
                <motion.section variants={itemVariants} className="cosmic-card p-6 sm:p-8">
                  <h2 className="font-fantasy text-2xl font-semibold text-foreground glow-text mb-6 flex items-center gap-3">
                    <span className="text-primary">◆</span>
                    Gallery
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {game.gallery.map((screenshot, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.03 }}
                        className="relative aspect-video rounded-lg overflow-hidden border-glow cursor-pointer group"
                      >
                        <img
                          src={screenshot}
                          alt={`${game.title} screenshot ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}



              {/* Developers */}
              {developers.length > 0 && (
                <motion.section variants={itemVariants} className="cosmic-card p-6 sm:p-8">
                  <h2 className="font-fantasy text-2xl font-semibold text-foreground glow-text mb-6 flex items-center gap-3">
                    <span className="text-primary">◆</span>
                    Development Team
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {developers.map((dev, index) => {
                      const devImage = developerImages[dev.name];
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 bg-card/50 border border-border/50 rounded-lg p-3 hover:border-primary/30 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30 bg-primary/20 flex items-center justify-center">
                            {devImage ? (
                              <img
                                src={devImage}
                                alt={dev.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="w-6 h-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{dev.name}</p>
                            <p className="text-muted-foreground text-xs">{dev.role}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* Part of World */}
              {world && (
                <motion.section variants={itemVariants} className="cosmic-card p-6 sm:p-8">
                  <h2 className="font-fantasy text-2xl font-semibold text-foreground glow-text mb-6 flex items-center gap-3">
                    <span className="text-primary">◆</span>
                    Part of {world.name}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* World Image */}
                    <div className="flex-shrink-0">
                      <Link to={`/worlds/${world.id}`} className="block">
                        <div className="relative w-full sm:w-48 aspect-video rounded-lg overflow-hidden border-glow group">
                          <img
                            src={world.image}
                            alt={world.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                        </div>
                      </Link>
                    </div>

                    {/* World Info */}
                    <div className="flex-1">
                      <p className="text-muted-foreground text-sm sm:text-base mb-4">
                        {world.tagline}
                      </p>
                      <Link
                        to={`/worlds/${world.id}`}
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium text-sm"
                      >
                        Explore {world.name}
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      {/* Related Games */}
                      {relatedGames.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-foreground mb-3">
                            More from {world.name}
                          </h4>
                          <div className="flex gap-3">
                            {relatedGames.map((related) => (
                              <Link
                                key={related.id}
                                to={`/games/${related.id}`}
                                className="group"
                              >
                                <div className="relative w-20 h-14 rounded-md overflow-hidden border border-border/50 group-hover:border-primary/50 transition-colors">
                                  <img
                                    src={related.image}
                                    alt={related.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 truncate max-w-20 group-hover:text-primary transition-colors">
                                  {related.title}
                                </p>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.section>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">


              {/* Game Information Card */}
              <motion.aside variants={itemVariants} className="cosmic-card p-6 sticky top-24">
                <h2 className="font-fantasy text-xl font-semibold text-foreground glow-text mb-6 flex items-center gap-3">
                  <span className="text-primary">◆</span>
                  Game Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Play className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm font-medium text-foreground">{game.status}</p>
                    </div>
                  </div>

                  {game.releaseDate && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Release Date</p>
                        <p className="text-sm font-medium text-foreground">{game.releaseDate}</p>
                      </div>
                    </div>
                  )}

                  {game.platforms.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cosmic-cyan/20 flex items-center justify-center">
                        <Gamepad2 className="w-4 h-4 text-cosmic-cyan" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Platforms</p>
                        <p className="text-sm font-medium text-foreground">
                          {game.platforms.join(', ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {game.type.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Tag className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Type</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {game.type.map((t, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full border border-primary/30"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {game.players.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Players</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {game.players.map((p, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-xs bg-secondary/10 text-secondary rounded-full border border-secondary/30"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {game.theme.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                        <Tag className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Theme</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {game.theme.map((th, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-xs bg-accent/10 text-accent rounded-full border border-accent/30"
                            >
                              {th}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.aside>

              {/* Features & Mechanics */}
              <motion.section variants={itemVariants} className="cosmic-card p-6 sm:p-8">
                <h2 className="font-fantasy text-2xl font-semibold text-foreground glow-text mb-6 flex items-center gap-3">
                  <span className="text-primary">◆</span>
                  Key Features & Mechanics
                </h2>
                <div className="space-y-6">
                  {/* Features */}
                  <div>
                    <h3 className="font-fantasy text-lg font-medium text-primary mb-4">Features</h3>
                    <ul className="space-y-3">
                      {game.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3 text-muted-foreground">
                          <span className="text-cosmic-cyan mt-1.5 text-xs">✦</span>
                          <span className="text-sm sm:text-base">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Mechanics */}
                  <div>
                    <h3 className="font-fantasy text-lg font-medium text-secondary mb-4">Mechanics</h3>
                    <ul className="space-y-3">
                      {game.mechanics.map((mechanic, index) => (
                        <li key={index} className="flex items-start gap-3 text-muted-foreground">
                          <span className="text-cosmic-purple mt-1.5 text-xs">✦</span>
                          <span className="text-sm sm:text-base">{mechanic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.section>
            </div>
          </motion.div>

          {/* Back to Games Link */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mt-12 pt-8 border-t border-border/30"
          >
            <Link
              to="/games"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Games
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GameDetail;

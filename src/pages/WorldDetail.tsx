import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink, BookOpen, Gamepad2 } from 'lucide-react';
import { Starfield } from '@/components/Starfield';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { getWorldById, World } from '@/data/worlds';
import { getGamesByWorld } from '@/data/games';

// World theme colors for consistency
const worldColors: Record<string, { accent: string; bg: string; border: string }> = {
  'the-age-of-rika': {
    accent: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  'haven-world': {
    accent: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  'atomic-horizon': {
    accent: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
};

// Swipeable Pillar component for mobile
const MobilePillarSwiper = ({ pillars, worldId }: { pillars: World['gameplayPillars']; worldId: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const colors = worldColors[worldId] || worldColors['the-age-of-rika'];

  const nextPillar = () => {
    setCurrentIndex((prev) => (prev + 1) % pillars.length);
  };

  const prevPillar = () => {
    setCurrentIndex((prev) => (prev - 1 + pillars.length) % pillars.length);
  };

  return (
    <div className="relative overflow-hidden pt-4 pb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`cosmic-card p-8 border ${colors.border} min-h-[250px] flex flex-col justify-center text-center`}
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
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex ? `${colors.accent.replace('text-', 'bg-')} w-4` : 'bg-primary/20'
            }`}
            aria-label={`Go to pillar ${i + 1}`}
          />
        ))}
      </div>

      <p className="text-center text-[10px] text-muted-foreground/30 mt-4 uppercase tracking-widest animate-pulse">
        ← Swipe to explore →
      </p>
    </div>
  );
};

// World gallery images - only Rule of Rika has images for now
const worldGalleryImages: Record<string, { src: string; title: string; description: string }[]> = {
  'the-age-of-rika': [
    { src: '/content/images/rika-akvira-maro.png', title: 'Akvira Empire', description: 'Prescient Alchemists' },
    { src: '/content/images/rika-liguni-zeleni.png', title: 'Liguni Confluence', description: 'Pantemporal Symbionts' },
    { src: '/content/images/rika-zohar-zohar1.png', title: "Zo-Har Unity", description: 'Gestalt Organism' },
    { src: '/content/images/rika-dindra-zemlja.png', title: 'Dindrae Tetrarky', description: 'Aura Emitters' },
  ],
  'haven-world': [],
  'atomic-horizon': [],
};

// Image Gallery Component
const ImageGallery = ({ worldId }: { worldId: string }) => {
  const images = worldGalleryImages[worldId] || [];
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <section className="relative py-16 bg-cosmic-gradient">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="font-fantasy text-2xl sm:text-3xl font-semibold text-foreground glow-text mb-8 text-center">
            Gallery
          </h2>

          {/* Horizontal scrollable gallery */}
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
            {images.map((image, index) => (
              <motion.button
                key={index}
                onClick={() => setSelectedImage(index)}
                className="flex-shrink-0 snap-start group relative overflow-hidden rounded-xl border border-primary/30 bg-card/50 hover:bg-card transition-all duration-300"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-56 h-72 sm:w-64 sm:h-80 relative">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h4 className="font-fantasy text-lg font-semibold text-primary">{image.title}</h4>
                    <p className="text-sm text-muted-foreground">{image.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Lightbox Modal */}
          <AnimatePresence>
            {selectedImage !== null && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedImage(null)}
                  className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
                />
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  onClick={() => setSelectedImage(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative max-w-4xl max-h-[90vh] w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={images[selectedImage].src}
                      alt={images[selectedImage].title}
                      className="w-full h-full object-contain rounded-lg"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent rounded-b-lg">
                      <h3 className="font-fantasy text-2xl font-semibold text-primary">
                        {images[selectedImage].title}
                      </h3>
                      <p className="text-muted-foreground">{images[selectedImage].description}</p>
                    </div>
                    {/* Navigation arrows */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage((prev) => (prev! - 1 + images.length) % images.length);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors text-xl"
                    >
                      ←
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage((prev) => (prev! + 1) % images.length);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors text-xl"
                    >
                      →
                    </button>
                    {/* Close button */}
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-4 right-4 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors text-2xl"
                    >
                      ×
                    </button>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

const WorldDetail = () => {
  const { worldId } = useParams<{ worldId: string }>();

  const world = getWorldById(worldId || '');
  const gamesInWorld = world ? getGamesByWorld(world.id) : [];

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

  if (!world) {
    return (
      <div className="min-h-screen bg-background relative">
        <Starfield />
        <Navigation />
        <main className="relative z-10 container mx-auto px-6 py-32 text-center">
          <h1 className="font-fantasy text-4xl font-bold text-foreground mb-4">World Not Found</h1>
          <p className="text-muted-foreground mb-8">The world you're looking for doesn't exist.</p>
          <Link to="/worlds" className="inline-flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-4 h-4" />
            Back to Worlds
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

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
              {world.name}
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mt-4 max-w-2xl mx-auto">
              {world.tagline}
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {world.wikiUrl && (
                <motion.a
                  href={world.wikiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors font-medium"
                >
                  <BookOpen className="w-5 h-5" />
                  Dive Deeper into the Wiki
                </motion.a>
              )}
              {world.worldAnvilUrl && (
                <motion.a
                  href={world.worldAnvilUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors font-medium"
                >
                  <ExternalLink className="w-5 h-5" />
                  Explore on World Anvil
                </motion.a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Image Gallery - only shown for worlds with images */}
      {worldGalleryImages[world.id]?.length > 0 && (
        <ImageGallery worldId={world.id} />
      )}





      {/* Gameplay Pillars */}
      {world.gameplayPillars.length > 0 && (
        <section className="relative py-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-fantasy text-3xl sm:text-4xl font-semibold text-foreground glow-text">
                Core Themes
              </h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                The foundational pillars that define {world.name}
              </p>
            </motion.div>

            {/* Mobile: Swipeable pillars */}
            <div className="sm:hidden max-w-lg mx-auto">
              <MobilePillarSwiper pillars={world.gameplayPillars} worldId={world.id} />
            </div>

            {/* Tablet/Desktop: Grid layout */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {world.gameplayPillars.map((pillar, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="cosmic-card p-6 h-full"
                >
                  <h3 className="font-fantasy text-xl font-semibold text-primary mb-4">
                    {pillar.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                    {pillar.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Games in This World */}
      {gamesInWorld.length > 0 && (
        <section className="relative py-20 bg-cosmic-gradient">
          <div className="container mx-auto px-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h2 className="font-fantasy text-3xl sm:text-4xl font-semibold text-foreground glow-text">
                  Games in This World
                </h2>
                <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                  Discover the adventures waiting for you in {world.name}
                </p>
              </motion.div>

              {/* Games Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {gamesInWorld.map((game) => (
                  <motion.div
                    key={game.id}
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      to={`/games/${game.id}`}
                      className="block cosmic-card overflow-hidden group h-full"
                    >
                      {/* Game Image */}
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={game.image}
                          alt={game.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                        {/* Status Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-medium rounded-full">
                            {game.status}
                          </span>
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
                      </div>

                      {/* Game Info */}
                      <div className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Gamepad2 className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-fantasy text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                              {game.title}
                            </h3>
                            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                              {game.shortDescription}
                            </p>
                          </div>
                        </div>

                        {/* View Game Link */}
                        <div className="flex items-center gap-2 mt-4 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>View Game</span>
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Back to Worlds Link */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-16 text-center"
            >
              <Link
                to="/worlds"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to All Worlds
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default WorldDetail;

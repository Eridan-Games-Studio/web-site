import { motion } from 'framer-motion';
import { GameCard, Game } from './GameCard';

// Sample data - replace with your actual data
const games: Game[] = [
  {
    id: 'haven-rpg',
    title: 'H.A.V.E.N RPG',
    description: 'A tabletop role-playing game set in a cyberpunk world where your calling defines your destiny.',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=340&fit=crop',
    status: 'In Development',
    platforms: ['Tabletop', 'Web'],
    tags: ['RPG', 'Cyberpunk', 'Narrative'],
    worldId: 'haven',
  },
  {
    id: 'engines-discord',
    title: 'Engines of Discord',
    description: 'Navigate political intrigue and mechanical marvels in this strategic adventure game.',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=340&fit=crop',
    status: 'Coming Soon',
    platforms: ['PC', 'Steam'],
    tags: ['Strategy', 'Steampunk', 'Adventure'],
    worldId: 'engines-discord',
  },
  {
    id: 'veiled-shores',
    title: 'Veiled Shores',
    description: 'Explore mysterious islands and uncover ancient secrets in this exploration-focused adventure.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=340&fit=crop',
    status: 'In Development',
    platforms: ['PC', 'Console'],
    tags: ['Exploration', 'Mystery', 'Fantasy'],
    worldId: 'veiled-shores',
  },
];

export const GamesSection = () => {
  return (
    <section id="games" className="relative py-24 px-6">
      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-fantasy text-4xl sm:text-5xl font-semibold mb-4">
            Featured <span className="text-cosmic-gradient">Games</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Worlds in development, stories in motion.
          </p>
        </motion.div>

        {/* Games grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <a
            href="#all-games"
            className="inline-flex items-center gap-2 px-6 py-3 border border-primary/50 text-foreground hover:bg-primary/10 hover:border-primary rounded-lg transition-all duration-300"
          >
            View All Games
            <span>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

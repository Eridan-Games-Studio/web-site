import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Starfield } from '@/components/Starfield';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { CharacterSheet } from '@/components/CharacterSheet';
import { teamMembers, TeamMember } from '@/data/team';

const values = [
  {
    icon: '❤️',
    title: 'Player-First',
    description: "We design around the player's journey—experience, agency, and meaningful choices at every turn.",
  },
  {
    icon: '⚡',
    title: 'Innovation',
    description: 'We explore mechanical limits and bold worlds, crafting fresh frontiers for both new and experienced players.',
  },
  {
    icon: '👥',
    title: 'Community',
    description: 'We build games together with our community—sharing ideas, playtesting openly, and refining together.',
  },
  {
    icon: '🌍',
    title: 'Approachability',
    description: 'Our tables give you space to learn, then space to shine.',
  },
];

const timeline = [
  {
    year: '2022',
    title: 'The Fated Meeting',
    events: [
      'On a cold winter night, at 21:00 Tom contacts Dino.',
      'Soon after, they meet up at an old railway-station café and Dino presents his concept to Tom.',
      'Tom exclaims "I see it!"',
      'In the coming days, Tom writes the initial fiction for the Akvira and the world.',
      'Dino spearheads the development of the game with Tom as his lead narrative designer.',
    ],
  },
  {
    year: '2023',
    title: 'First Playtest',
    events: [
      'Borjan and Tina join the Arena (code name) design group.',
      'Tom writes the initial thirty pages of fiction, creating the foundational setting and the primary eleven races.',
      'Arena, the Board Game, has its first proof-of-concept playtest in the RiRoll community.',
      'Two famous Filips are attending.',
      'Another playtest of the game, now with the Liguni and Akvira, is accomplished later in the year.',
      'All major four races now have a complete concept for the board game: Akvira, Liguni, Dindrae, and Zo Har.',
    ],
  },
  {
    year: '2024',
    title: 'Arena RPG',
    events: [
      'Dino, Borjan and Tom continue the development of the Arena board game.',
      'Tom initiates the formation of the Arena RPG group.',
      'Nikola and Sven join.',
      'They begin forming the Arena, a therapeutically inspired RPG.',
      'The third major playtest of the Arena Board Game is accomplished in this year.',
    ],
  },
  {
    year: '2025',
    title: 'Eridan Games and "The Rule of Rika"',
    events: [
      'Tina leaves the group early 2025.',
      'Through Sven, we contact Vuk who joins us in March as a freelancer.',
      'Soon after, in June, the Eridan Game Studio is born.',
      'Founding members, alphabetically: Borjan, Dino, Nikola, Sven and Tom.',
      'Vuk officially joins the Eridan Game Studio.',
      'In September, Matija, Siniša and Maki join the Eridan Game Studio with their own games and worlds.',
      "The Eridan website is launched and the Arena universe is baptized into the 'Rule of Rika'.",
      'And so begins the story of high adventure, our new era!',
    ],
  },
];

const About = () => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  return (
    <div className="min-h-screen bg-cosmic-gradient">
      <Starfield />
      <Navigation />

      <main className="relative pt-32 pb-20">
        {/* Hero Header */}
        <section className="relative px-6 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-fantasy text-5xl sm:text-6xl font-semibold mb-6"
            >
              About <span className="text-cosmic-gradient">Eridan Games</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto"
            >
              We create challenging gaming experiences that emphasize player's agency in worlds filled with wonder and contrastive realities.
            </motion.p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="px-6 mb-20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              <div>
                <h2 className="font-fantasy text-3xl font-semibold mb-6">Our Mission</h2>
                <p className="text-muted-foreground text-lg mb-4">
                  At Eridan Games, we believe that games have the power to empower, inspire, connect, and transform.
                </p>
                <p className="text-muted-foreground text-lg">
                  We're committed to pushing the boundaries of systems and storytelling while maintaining a player-first design.
                </p>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden border-glow">
                <img
                  src="/content/images/galaxy.jpg"
                  alt="Galaxy background"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="px-6 mb-20">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-fantasy text-3xl font-semibold text-center mb-12"
            >
              Our Values
            </motion.h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="cosmic-card p-6 text-center"
                >
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="font-fantasy text-xl font-semibold text-primary mb-3">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="px-6 mb-20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-fantasy text-3xl font-semibold mb-4">Meet the Team</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The creative minds behind Eridan Games, bringing diverse talents and shared passion to every project. In order of joining:
              </p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
              {teamMembers.map((member, index) => (
                <motion.button
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedMember(member)}
                  className="group flex flex-col items-center transition-transform hover:scale-105"
                >
                  {/* Avatar Circle */}
                  <div className="mb-3 h-[120px] w-[120px] overflow-hidden rounded-full border-3 border-primary/50 transition-colors group-hover:border-secondary">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {/* Name */}
                  <h3 className="font-fantasy text-lg font-semibold text-primary transition-colors group-hover:text-secondary">
                    {member.name}
                  </h3>
                  {/* Class */}
                  <p className="max-w-[150px] text-center text-sm italic text-muted-foreground">
                    {member.class}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Character Sheet Modal */}
        <CharacterSheet
          member={selectedMember}
          isOpen={selectedMember !== null}
          onClose={() => setSelectedMember(null)}
        />

        {/* Journey Timeline */}
        <section className="px-6 mb-20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-fantasy text-3xl font-semibold mb-4">Our Journey</h2>
              <p className="text-muted-foreground">
                From two friends to a growing studio, here's how we've evolved over the years.
              </p>
            </motion.div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/50 to-transparent" />

              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative pl-12 sm:pl-0 pb-12 ${
                    index % 2 === 0 ? 'sm:pr-[calc(50%+2rem)]' : 'sm:pl-[calc(50%+2rem)]'
                  }`}
                >
                  {/* Year dot */}
                  <div className="absolute left-0 sm:left-1/2 -translate-x-1/2 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center z-10">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                  </div>

                  {/* Content */}
                  <div className="cosmic-card p-6">
                    <span className="text-primary font-fantasy text-2xl font-bold">{item.year}</span>
                    <h3 className="font-fantasy text-xl font-semibold text-foreground mt-2 mb-4">
                      {item.title}
                    </h3>
                    <ul className="space-y-2">
                      {item.events.map((event, i) => (
                        <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{event}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
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

export default About;

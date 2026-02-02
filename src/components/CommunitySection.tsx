import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

const socialLinks = [
  { name: 'Discord', href: 'https://discord.gg/Xtf2ehPPt4', color: 'hover:bg-[#5865F2]' },
  { name: 'Youtube', href: 'https://www.youtube.com/@EridanGamesStudio', color: 'hover:bg-[#FF0000]' },
  { name: 'Instagram', href: '#', color: 'hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737]' },
  { name: 'X', href: '#', color: 'hover:bg-black' },
];

export const CommunitySection = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <section id="community" className="relative py-16 px-6 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Newsletter */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="font-fantasy text-4xl sm:text-5xl font-semibold leading-tight">
              <span className="text-cosmic-gradient">JOIN THE </span>
              <br />
              <span className="text-cosmic-gradient">COMMUNITY</span>
            </h2>

            <p className="text-muted-foreground text-sm max-w-sm">
              Join our community and get the major announcements from Eridan Games Studio straight in your inbox.
            </p>

            <form onSubmit={handleSubmit} className="flex max-w-sm">
              <Input
                type="email"
                placeholder="Email address…"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                name="email"
                className="flex-1 bg-background/50 border-border/50 rounded-r-none focus:border-primary"
                required
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="px-4 bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-colors rounded-r-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </form>
          </motion.div>

          {/* Right side - Social Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow us on ${social.name}`}
                className={`group flex items-center justify-center aspect-[2/1] bg-card/50 border border-border/30 rounded-lg transition-all duration-300 ${social.color} hover:border-transparent hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
              >
                <span className="font-fantasy text-xl sm:text-2xl font-bold text-white group-hover:scale-110 transition-transform tracking-wider">
                  {social.name}
                </span>
              </a>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
};

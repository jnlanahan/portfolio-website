import { motion } from "framer-motion";
import { Link } from "wouter";
import { trackEvent } from "@/lib/analytics";
import { GlowingCard } from "@/components/ui/glowing-card";

const HomeTile = ({ 
  title, 
  description, 
  icon, 
  linkTo, 
  delay = 0 
}: { 
  title: string; 
  description: string; 
  icon: string; 
  linkTo: string; 
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Link 
        href={linkTo}
        onClick={() => trackEvent('homepage_tile_click', { 
          tile: title, 
          destination: linkTo 
        })}
      >
        <GlowingCard 
          className="bg-background/50 backdrop-blur-md rounded-xl border-2 border-secondary/20 hover:border-secondary hover:bg-background/80 hover:shadow-lg hover:shadow-secondary/20 p-6 transition-all duration-300 h-full cursor-pointer group"
          glowColor="rgba(67, 186, 147, 0.6)"
        >
          <div className="flex items-center mb-4">
            <div className="bg-secondary/20 p-3 rounded-full mr-3">
              <i className={`${icon} text-secondary text-xl`}></i>
            </div>
            <h3 className="text-xl font-space font-semibold">{title}</h3>
          </div>
          <p className="text-muted-foreground mb-6">{description}</p>
          <div className="inline-flex items-center text-secondary group-hover:underline">
            <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform"></i>
          </div>
        </GlowingCard>
      </Link>
    </motion.div>
  );
};

const HomePage = () => {
  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold font-space mb-6">
            Welcome to My Portfolio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore my work, thoughts, and experiences through the sections below
          </p>
        </motion.div>

        {/* Navigation Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <HomeTile
            title="About"
            description="Learn more about my background, skills, and journey"
            icon="ri-user-line"
            linkTo="/about"
            delay={0.1}
          />
          <HomeTile
            title="Portfolio"
            description="Browse my latest projects and technical work"
            icon="ri-briefcase-line"
            linkTo="/portfolio"
            delay={0.2}
          />
          <HomeTile
            title="Blog"
            description="Read my thoughts on technology, development, and more"
            icon="ri-article-line"
            linkTo="/blog"
            delay={0.3}
          />
          <HomeTile
            title="Top 5 Lists"
            description="Curated lists of my favorite tools, resources, and recommendations"
            icon="ri-list-check-line"
            linkTo="/top5"
            delay={0.4}
          />
          <HomeTile
            title="Contact"
            description="Get in touch with me for collaborations or inquiries"
            icon="ri-mail-line"
            linkTo="/contact"
            delay={0.5}
          />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
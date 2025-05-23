import { motion } from "framer-motion";
import { Link } from "wouter";
import { BlogPostType } from "@/data/blog";

interface BlogProps {
  posts: BlogPostType[];
}

export const Blog: React.FC<BlogProps> = ({ posts }) => {
  // Only show the latest 3 posts on the homepage
  const latestPosts = posts.slice(0, 3);

  return (
    <section id="blog" className="py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-space mb-4">Blog</h2>
          <div className="w-24 h-1 bg-secondary mb-8"></div>
          <p className="text-lg text-muted-foreground text-center max-w-3xl">
            Thoughts, tutorials, and insights from my journey in tech.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestPosts.map((post, index) => (
            <motion.article
              key={post.id}
              className="bg-[#1E1E1E] rounded-xl overflow-hidden border border-border hover:border-secondary transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={`/blog/${post.id}`}>
                <a className="block">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                </a>
              </Link>
              <div className="p-6">
                <div className="flex items-center text-muted-foreground text-sm mb-3">
                  <i className="ri-calendar-line mr-2"></i>
                  <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                  <span className="mx-2">•</span>
                  <span>{post.readTime} min read</span>
                </div>
                <h3 className="text-xl font-space font-semibold mb-3">
                  <Link href={`/blog/${post.id}`}>
                    <a className="hover:text-secondary transition-colors">
                      {post.title}
                    </a>
                  </Link>
                </h3>
                <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                <Link href={`/blog/${post.id}`}>
                  <a className="inline-flex items-center text-secondary hover:underline">
                    Read More <i className="ri-arrow-right-line ml-2"></i>
                  </a>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/blog">
            <a className="inline-flex items-center px-6 py-3 bg-[#1E1E1E] border border-border hover:border-secondary text-foreground font-medium rounded-md transition-colors">
              View All Posts <i className="ri-arrow-right-line ml-2"></i>
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

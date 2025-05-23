import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getBlogPosts } from "@/data/blog";

const BlogPage = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/blog"],
    initialData: getBlogPosts(),
  });

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6">My Blog</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Thoughts, tutorials, and insights from my journey in tech.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <motion.article
            key={post.id}
            className="bg-background/30 backdrop-blur-sm rounded-xl overflow-hidden border border-border hover:border-secondary transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link href={`/blog/${post.id}`}>
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
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
    </div>
  );
};

export default BlogPage;
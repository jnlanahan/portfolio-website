import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { getBlogPostById } from "@/data/blog";
import { motion } from "framer-motion";

export const BlogDetail: React.FC = () => {
  const { id } = useParams();
  const { data: post, isLoading, error } = useQuery({
    queryKey: [`/api/blog/${id}`],
    queryFn: () => getBlogPostById(parseInt(id || "0")),
  });

  if (isLoading) {
    return (
      <div className="page-container relative">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-muted rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="page-container relative">
        <h1 className="text-3xl font-bold mb-4">Post not found</h1>
        <p className="mb-6">Sorry, the blog post you're looking for doesn't exist.</p>
        <Link href="/blog">
          <a className="text-secondary hover:underline">← Back to blog</a>
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container relative">
      <Link href="/blog" className="inline-flex items-center text-muted-foreground hover:text-secondary mb-8 transition-colors">
        <i className="ri-arrow-left-line mr-2"></i> Back to all posts
      </Link>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-background/30 backdrop-blur-sm p-8 rounded-xl border border-border"
      >
        <h1 className="text-3xl md:text-4xl font-bold font-space mb-4">{post.title}</h1>

        <div className="flex items-center text-muted-foreground mb-6">
          <div className="flex items-center">
            <img
              src="https://images.unsplash.com/photo-1555952517-2e8e729e0b44?q=80&w=1964&auto=format&fit=crop"
              alt="Alex Chen"
              className="w-10 h-10 rounded-full mr-3"
            />
            <span>Alex Chen</span>
          </div>
          <span className="mx-2">•</span>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
          <span className="mx-2">•</span>
          <span>{post.readTime} min read</span>
        </div>

        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-auto rounded-xl mb-8"
        />

        <div 
          className="blog-content text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-xl font-space font-semibold mb-4">Share this post</h3>
          <div className="flex space-x-4">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-background/40 backdrop-blur-sm rounded-full text-muted-foreground hover:text-secondary transition-colors"
              aria-label="Share on Twitter"
            >
              <i className="ri-twitter-fill text-lg"></i>
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-background/40 backdrop-blur-sm rounded-full text-muted-foreground hover:text-secondary transition-colors"
              aria-label="Share on LinkedIn"
            >
              <i className="ri-linkedin-fill text-lg"></i>
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-background/40 backdrop-blur-sm rounded-full text-muted-foreground hover:text-secondary transition-colors"
              aria-label="Share on Facebook"
            >
              <i className="ri-facebook-fill text-lg"></i>
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }}
              className="p-3 bg-background/40 backdrop-blur-sm rounded-full text-muted-foreground hover:text-secondary transition-colors"
              aria-label="Copy link"
            >
              <i className="ri-link text-lg"></i>
            </button>
          </div>
        </div>
      </motion.article>
    </div>
  );
};
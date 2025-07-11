import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { BlogTag, formatBlogDate } from "@/data/blog";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

// BlogTag component for consistent styling (same as in BlogPage)
const BlogTagBadge = ({ tag }: { tag: BlogTag }) => {
  const style = {
    backgroundColor: tag.color ? `${tag.color}15` : 'rgba(34, 197, 94, 0.1)',
    color: tag.color || '#22c55e',
  };

  return (
    <span
      className="px-3 py-1 text-xs rounded-full transition-all duration-300 hover:scale-105"
      style={style}
    >
      {tag.name}
    </span>
  );
};

export const BlogDetail: React.FC = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const [readingProgress, setReadingProgress] = useState(0);
  
  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["/api/blog"],
  });

  const post = posts?.find((p: any) => p.slug === slug);
  const isLoading = isLoadingPosts;

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-6 pt-16 md:pt-24">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!post && !isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-6 pt-16 md:pt-24">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to blog
          </Link>
          <h1 className="text-4xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            Post not found
          </h1>
          <p className="text-gray-600" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            Sorry, the blog post you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  // Calculate reading time
  const calculateReadingTime = (content: string) => {
    const words = content.replace(/<[^>]*>/g, '').split(' ').length;
    return Math.ceil(words / 200); // Average reading speed
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gray-900 z-50 transition-all duration-300"
        style={{ width: `${readingProgress}%` }}
      />

      {/* Article Header */}
      <div className="max-w-3xl mx-auto px-6 pt-16 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to blog
          </Link>

          <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            {post.title}
          </h1>

          <div className="mt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold">
              NL
            </div>
            <div>
              <p className="font-medium text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Nick Lanahan
              </p>
              <time className="text-sm text-gray-500" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                {formatBlogDate(post.createdAt)} • {calculateReadingTime(post.content)} min read
              </time>
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <img 
              src={post.coverImage} 
              alt={post.title}
              className="mt-10 w-full h-72 md:h-96 object-cover rounded-lg shadow-sm"
            />
          )}
        </motion.div>
      </div>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-6 mt-16 space-y-8 leading-7" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-2 pt-8 border-t border-gray-200"
          >
            {post.tags.map((tag: BlogTag, index: number) => (
              <BlogTagBadge key={`${tag.name}-${index}`} tag={tag} />
            ))}
          </motion.div>
        )}
      </article>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-6 mt-24 pb-16 border-t border-gray-200">
        <div className="pt-8 text-center">
          <p className="text-gray-600" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            Thanks for reading! Have thoughts or questions?{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-800 transition-colors">
              Get in touch
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
};
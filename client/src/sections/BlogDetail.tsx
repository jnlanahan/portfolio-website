import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { BlogTag, formatBlogDate } from "@/data/blog";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { FaXTwitter, FaLinkedin, FaFacebook, FaLink } from 'react-icons/fa6';

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
  const [hasLiked, setHasLiked] = useState(false);
  
  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["/api/blog"],
  });

  const post = posts?.find((p: any) => p.slug === slug);
  const isLoading = isLoadingPosts;

  // Loading skeleton
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

  // Error state
  if (!post && !isLoading) {
    return (
      <div className="page-container relative">
        <h1 className="text-3xl font-bold mb-4 text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Post not found</h1>
        <p className="mb-6 text-gray-600" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Sorry, the blog post you're looking for doesn't exist.</p>
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 inline-flex items-center transition-colors" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
          <i className="ri-arrow-left-line mr-2"></i> Back to blog
        </Link>
      </div>
    );
  }

  // Handle like button click
  const handleLike = () => {
    if (!hasLiked) {
      setHasLiked(true);
      toast({
        title: "Thanks for the love!",
        description: "Your appreciation has been noted.",
      });
    }
  };

  // Copy link to clipboard
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "The link to this article has been copied to your clipboard.",
    });
  };

  return (
    <div className="page-container relative">
      {/* Back button */}
      <Link href="/blog" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
        <i className="ri-arrow-left-line mr-2"></i> Back to all posts
      </Link>

      {/* Article container */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-background/30 backdrop-blur-sm p-6 md:p-8 rounded-xl border border-border"
      >
        {/* Category badge (if available) */}
        {post.category && (
          <Link href={`/blog/category/${post.category.slug}`} className="inline-block mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              {post.category.name}
            </span>
          </Link>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
          {post.title}
        </h1>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map((tag: BlogTag, index: number) => (
            <BlogTagBadge key={`${tag.id}-${index}`} tag={tag} />
          ))}
        </div>

        {/* Author and meta information */}
        <div className="flex flex-wrap items-center text-gray-500 mb-8 gap-y-3" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
          {post.author && (
            <div className="flex items-center mr-4">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full mr-3 border-2 border-secondary/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-secondary/20 text-secondary flex items-center justify-center mr-3">
                  {post.author.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-medium text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>{post.author.name}</div>
                {post.author.role && <div className="text-xs text-gray-500" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>{post.author.role}</div>}
              </div>
            </div>
          )}

          <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
            <div className="flex items-center">
              <i className="ri-calendar-line mr-1"></i>
              <time dateTime={post.date}>
                {formatBlogDate(post.date)}
              </time>
            </div>
            <span className="mx-1">•</span>
            <div className="flex items-center">
              <i className="ri-time-line mr-1"></i>
              <span>{post.readTime} min read</span>
            </div>
            {post.views && (
              <>
                <span className="mx-1">•</span>
                <div className="flex items-center">
                  <i className="ri-eye-line mr-1"></i>
                  <span>{post.views} views</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Cover image */}
        <div className="relative rounded-xl overflow-hidden mb-8">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-auto object-cover rounded-xl"
          />
          {post.featured && (
            <div className="absolute top-4 right-4 bg-secondary px-3 py-1 rounded text-xs font-medium text-secondary-foreground">
              Featured
            </div>
          )}
        </div>

        {/* Article content */}
        <div 
          className="blog-content prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
          style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Action and share section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            {/* Like button */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                hasLiked 
                  ? "bg-red-500/10 text-red-500" 
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              <i className={`${hasLiked ? "ri-heart-fill" : "ri-heart-line"} text-lg`}></i>
              <span>{hasLiked ? (post.likes || 0) + 1 : post.likes || 0} likes</span>
            </button>

            {/* Last updated */}
            {post.lastUpdated && (
              <div className="text-sm text-gray-500" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Updated: {formatBlogDate(post.lastUpdated)}
              </div>
            )}
          </div>

          {/* Share section */}
          <h3 className="text-xl font-semibold mb-4 text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Share this post</h3>
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="Share on X (Twitter)"
            >
              <FaXTwitter className="w-5 h-5" />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-[#0A66C2] text-white rounded-lg hover:bg-[#004182] transition-colors"
              aria-label="Share on LinkedIn"
            >
              <FaLinkedin className="w-5 h-5" />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
              aria-label="Share on Facebook"
            >
              <FaFacebook className="w-5 h-5" />
            </a>
            <button
              onClick={copyLinkToClipboard}
              className="flex items-center justify-center w-12 h-12 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              aria-label="Copy link"
            >
              <FaLink className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Related posts section would go here */}
      </motion.article>
    </div>
  );
};

import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatBlogDate, BlogTag } from "@/data/blog";
import { useState, useMemo } from "react";

// BlogTag component for consistent styling
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

// Blog Card component for clean separation
const BlogCard = ({ post, index }: { post: any; index: number }) => {
  return (
    <motion.article
      key={post.id}
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-300"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Link href={`/blog/${post.slug}`}>
        <div className="relative overflow-hidden h-48">
          <img
            src={post.coverImage}
            alt={post.title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              post.status === "coming_soon" ? "filter brightness-50" : ""
            }`}
            style={{ 
              filter: post.status === "coming_soon" 
                ? 'brightness(0.5) contrast(1.05)' 
                : 'brightness(1.02) contrast(1.05)'
            }}
          />
          {/* Coming Soon overlay */}
          {post.status === "coming_soon" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="text-center">
                <div className="text-red-500 text-2xl font-bold mb-2 drop-shadow-lg">
                  COMING SOON
                </div>
                <div className="text-white text-sm font-medium drop-shadow-md">
                  This post is in development
                </div>
              </div>
            </div>
          )}
          {/* Status badge - only show for in_progress, coming_soon has overlay */}
          {post.status && post.status === "in_progress" && (
            <div className={`absolute top-2 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 ${post.featured ? 'right-20' : 'right-2'}`}>
              In Progress
            </div>
          )}
          {post.featured && (
            <div className={`absolute top-2 bg-secondary px-2 py-1 rounded text-xs font-medium text-secondary-foreground ${
              post.status && post.status !== "published" ? 'right-32' : 'right-2'
            }`}>
              Featured
            </div>
          )}
        </div>
      </Link>
      <div className="p-6">
        {/* Meta information */}
        <div className="flex flex-wrap items-center text-gray-500 text-sm mb-3" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
          <i className="ri-calendar-line mr-2"></i>
          <time dateTime={post.date}>
            {formatBlogDate(post.date)}
          </time>
          <span className="mx-2">•</span>
          <span>{post.readTime} min read</span>
          
          {post.views && (
            <>
              <span className="mx-2">•</span>
              <span className="flex items-center">
                <i className="ri-eye-line mr-1"></i> {post.views}
              </span>
            </>
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-semibold mb-3 line-clamp-2 text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
          <Link href={`/blog/${post.slug}`} className="text-gray-900 hover:text-blue-600 transition-colors">
            {post.title}
          </Link>
        </h3>
        
        {/* Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>{post.excerpt}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {post.tags.map((tag: BlogTag, index: number) => (
            <BlogTagBadge key={`${tag.id}-${index}`} tag={tag} />
          ))}
        </div>
        
        {/* Author (if available) */}
        {post.author && (
          <div className="flex items-center mt-4 pt-4 border-t border-border/50">
            {post.author.avatar ? (
              <img 
                src={post.author.avatar} 
                alt={post.author.name}
                className="w-8 h-8 rounded-full mr-3" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center mr-3">
                {post.author.name.charAt(0)}
              </div>
            )}
            <span className="text-sm text-gray-700" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>{post.author.name}</span>
          </div>
        )}
      </div>
    </motion.article>
  );
};

// Main Blog Page Component
const BlogPage = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/blog"],
  });

  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags from posts
  const allTags = useMemo(() => {
    if (!posts) return [];
    const tagMap = new Map<string, BlogTag>();
    posts.forEach(post => {
      post.tags.forEach(tag => {
        if (!tagMap.has(tag.id)) {
          tagMap.set(tag.id, tag);
        }
      });
    });
    return Array.from(tagMap.values());
  }, [posts]);

  // Filter posts by selected tag
  const filteredPosts = useMemo(() => {
    if (!posts || !selectedTag) return posts || [];
    return posts.filter(post => 
      post.tags.some(tag => tag.id === selectedTag)
    );
  }, [posts, selectedTag]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
        </div>
      </div>
    );
  }

  // Featured posts at the top if any
  const featuredPosts = posts ? posts.filter(post => post.featured) : [];
  const regularPosts = posts ? posts.filter(post => !post.featured) : [];

  return (
    <div className="page-container">
      {/* Page Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-gray-900 mb-6" style={{ 
          fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
          fontWeight: '700',
          fontSize: 'clamp(32px, 5vw, 48px)',
          lineHeight: '1.2'
        }}>My Blog</h1>
        <p className="text-gray-600 max-w-3xl mx-auto mb-8" style={{ 
          fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '17px',
          lineHeight: '1.5'
        }}>
          Thoughts, tutorials, and insights from my journey in tech.
        </p>
        
        {/* Tag filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            key="all"
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              !selectedTag
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
            style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedTag === tag.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Featured posts section */}
      {featuredPosts.length > 0 && !selectedTag && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif', color: '#1a1a1a' }}>
            <span className="text-blue-600 mr-2"><i className="ri-star-fill"></i></span> Featured Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredPosts.map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* All posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(selectedTag ? filteredPosts : regularPosts).map((post, index) => (
          <BlogCard key={post.id} post={post} index={index} />
        ))}
      </div>
      
      {/* Empty state */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>No posts found with this tag.</p>
          <button
            key="view-all-posts"
            onClick={() => setSelectedTag(null)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            View all posts
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogPage;


import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getBlogPosts, formatBlogDate, BlogTag } from "@/data/blog";
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
      className="group bg-background/30 backdrop-blur-sm rounded-xl overflow-hidden border border-border hover:border-secondary hover:shadow-lg hover:shadow-secondary/5 transition-all duration-300"
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
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {post.featured && (
            <div className="absolute top-2 right-2 bg-secondary px-2 py-1 rounded text-xs font-medium text-secondary-foreground">
              Featured
            </div>
          )}
        </div>
      </Link>
      <div className="p-6">
        {/* Meta information */}
        <div className="flex flex-wrap items-center text-muted-foreground text-sm mb-3">
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
        <h3 className="text-xl font-space font-semibold mb-3 line-clamp-2">
          <Link href={`/blog/${post.slug}`} className="hover:text-secondary transition-colors">
            {post.title}
          </Link>
        </h3>
        
        {/* Excerpt */}
        <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {post.tags.map((tag: BlogTag) => (
            <BlogTagBadge key={tag.id} tag={tag} />
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
            <span className="text-sm">{post.author.name}</span>
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
    initialData: getBlogPosts(),
  });

  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags from posts
  const allTags = useMemo(() => {
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
    if (!selectedTag) return posts;
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
  const featuredPosts = posts.filter(post => post.featured);
  const regularPosts = posts.filter(post => !post.featured);

  return (
    <div className="page-container">
      {/* Page Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6">My Blog</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
          Thoughts, tutorials, and insights from my journey in tech.
        </p>
        
        {/* Tag filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              !selectedTag
                ? "bg-secondary text-secondary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={`px-4 py-2 rounded-full text-sm transition-colors`}
              style={{
                backgroundColor: selectedTag === tag.id 
                  ? tag.color || '#22c55e'
                  : 'var(--muted)',
                color: selectedTag === tag.id 
                  ? 'white' 
                  : 'var(--foreground)',
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Featured posts section */}
      {featuredPosts.length > 0 && !selectedTag && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="text-secondary mr-2"><i className="ri-star-fill"></i></span> Featured Posts
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
          <p className="text-muted-foreground text-lg">No posts found with this tag.</p>
          <button
            onClick={() => setSelectedTag(null)}
            className="mt-4 px-6 py-2 bg-secondary text-secondary-foreground rounded-md"
          >
            View all posts
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogPage;

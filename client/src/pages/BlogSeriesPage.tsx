import { motion } from "framer-motion";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, Clock, CheckCircle, Circle, Eye } from "lucide-react";
import { formatBlogDate } from "@/data/blog";
import { useState } from "react";

export default function BlogSeriesPage() {
  const [match, params] = useRoute("/blog/series/:slug");
  const [readPosts, setReadPosts] = useState<number[]>([]);
  const slug = params?.slug;

  // Fetch series data
  const { data: series, isLoading, error } = useQuery({
    queryKey: [`/api/blog/series/${slug}`],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading series...</div>
        </div>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Series Not Found</h1>
            <p className="text-gray-600 mb-8">The blog series you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/blog">Back to Blog</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const publishedPosts = series.posts?.filter((post: any) => post.published) || [];
  const totalPosts = publishedPosts.length;
  const completedPosts = readPosts.length;
  const progressPercentage = totalPosts > 0 ? (completedPosts / totalPosts) * 100 : 0;

  const togglePostRead = (postId: number) => {
    setReadPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>

          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {series.title}
              </h1>
              
              {series.description && (
                <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
                  {series.description}
                </p>
              )}

              {series.coverImage && (
                <div className="mb-6">
                  <img
                    src={series.coverImage}
                    alt={series.title}
                    className="w-full h-64 object-cover rounded-lg shadow-lg"
                  />
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <Badge variant="secondary" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  {totalPosts} Article{totalPosts !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline" className="gap-2">
                  <Clock className="h-4 w-4" />
                  {publishedPosts.reduce((total: number, post: any) => total + (post.readTime || 5), 0)} min total
                </Badge>
                {series.featured && (
                  <Badge className="gap-2">
                    Featured Series
                  </Badge>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{completedPosts}/{totalPosts} completed</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Series Content */}
        <div className="space-y-6">
          {publishedPosts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles yet</h3>
                <p className="text-gray-600 text-center">
                  This series is still being written. Check back soon for new content!
                </p>
              </CardContent>
            </Card>
          ) : (
            publishedPosts.map((post: any, index: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => togglePostRead(post.id)}
                              className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              {readPosts.includes(post.id) ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Circle className="h-4 w-4" />
                              )}
                              {readPosts.includes(post.id) ? 'Completed' : 'Mark as read'}
                            </button>
                          </div>
                        </div>
                        <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {post.title}
                          </Link>
                        </CardTitle>
                        {post.excerpt && (
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {post.readTime || 5} min read
                          </div>
                          <div className="flex items-center gap-1">
                            <i className="ri-calendar-line"></i>
                            {formatBlogDate(post.date)}
                          </div>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.tags.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {post.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{post.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button asChild size="sm">
                          <Link href={`/blog/${post.slug}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Read
                          </Link>
                        </Button>
                        {post.featured && (
                          <Badge variant="secondary" className="text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Series Navigation */}
        {publishedPosts.length > 1 && (
          <div className="mt-12 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publishedPosts.map((post: any, index: number) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm line-clamp-1">
                      {post.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {post.readTime || 5} min read
                    </p>
                  </div>
                  {readPosts.includes(post.id) && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Tech badge component with custom color theming
const TechBadge = ({ tech, customColor = "#007AFF" }: { tech: string; customColor?: string }) => (
  <span 
    className="px-3 py-1 text-sm rounded-full font-medium transition-all duration-300 hover:scale-105"
    style={{ 
      fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
      backgroundColor: `${customColor}15`,
      color: customColor,
      border: `1px solid ${customColor}30`
    }}
  >
    {tech}
  </span>
);

export const ProjectDetail: React.FC = () => {
  const { slug } = useParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/portfolio"],
  });

  const project = projects?.find((p: any) => p.slug === slug);

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-muted rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page-container">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4 text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Project not found</h1>
          <p className="text-gray-600 mb-6" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            Sorry, the project you're looking for doesn't exist.
          </p>
          <Link href="/portfolio">
            <Button className="bg-blue-600 text-white hover:bg-blue-700" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              <i className="ri-arrow-left-line mr-2"></i>
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = project.mediaFiles && project.mediaFiles.length > 0 
    ? project.mediaFiles 
    : [project.image];

  return (
    <div className="page-container">
      {/* Back navigation */}
      <div className="mb-8">
        <Link href="/portfolio" className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
          <i className="ri-arrow-left-line mr-2"></i>
          Back to Projects
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Project Images */}
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={images[selectedImageIndex]}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Image thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === selectedImageIndex 
                      ? 'border-secondary' 
                      : 'border-transparent hover:border-muted-foreground'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${project.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Project Info */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            {project.featured && (
              <Badge className="bg-yellow-500 text-white" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                <i className="ri-star-fill mr-1"></i>
                Featured
              </Badge>
            )}
            {project.category && (
              <Badge className="bg-blue-100 text-blue-800" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                {project.category.name}
              </Badge>
            )}
          </div>

          <h1 className="text-4xl font-bold mb-4 text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>{project.title}</h1>
          
          <div className="text-gray-500 mb-6" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            <i className="ri-calendar-line mr-2"></i>
            {new Date(project.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long'
            })}
          </div>

          <div className="mb-8">
            <div 
              className="text-lg leading-relaxed text-gray-700 prose prose-lg max-w-none"
              style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          </div>

          {/* Technologies */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Technologies Used</h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech: string, index: number) => (
                <TechBadge key={index} tech={tech} customColor={project.customColor} />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            {project.demoUrl && (
              <Button 
                asChild 
                className="flex-1 text-white transition-all duration-300 hover:scale-105" 
                style={{ 
                  fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
                  backgroundColor: project.customColor || "#007AFF",
                  borderColor: project.customColor || "#007AFF"
                }}
              >
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                  <i className="ri-eye-line mr-2"></i>
                  Live Demo
                </a>
              </Button>
            )}
            {project.codeUrl && (
              <Button 
                variant="outline" 
                asChild 
                className="flex-1 transition-all duration-300 hover:scale-105" 
                style={{ 
                  fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
                  borderColor: project.customColor || "#007AFF",
                  color: project.customColor || "#007AFF"
                }}
              >
                <a href={project.codeUrl} target="_blank" rel="noopener noreferrer">
                  <i className="ri-github-line mr-2"></i>
                  View Code
                </a>
              </Button>
            )}
          </div>

          {/* Lessons Learned */}
          {project.lessonsLearned && (
            <Card className="mb-8 bg-white border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2 text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Lessons Learned</h3>
                <p className="text-gray-600" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>{project.lessonsLearned}</p>
              </CardContent>
            </Card>
          )}

          {/* Project sections */}
          {project.challenge && (
            <Card className="mb-6 bg-white border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Challenge</h3>
                <p className="text-gray-600" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>{project.challenge}</p>
              </CardContent>
            </Card>
          )}

          {project.solution && (
            <Card className="mb-6 bg-white border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Solution</h3>
                <p className="text-gray-600" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>{project.solution}</p>
              </CardContent>
            </Card>
          )}

          {project.results && (
            <Card className="mb-6 bg-white border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Results</h3>
                <p className="text-gray-600" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>{project.results}</p>
              </CardContent>
            </Card>
          )}

          {/* Testimonial */}
          {project.testimonial && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <blockquote className="text-lg italic mb-4 text-gray-700" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  "{project.testimonial.quote}"
                </blockquote>
                <div className="flex items-center">
                  <div>
                    <p className="font-semibold text-gray-900" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>{project.testimonial.author}</p>
                    {project.testimonial.role && (
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>{project.testimonial.role}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
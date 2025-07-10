import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Tech badge component
const TechBadge = ({ tech }: { tech: string }) => (
  <span className="px-3 py-1 bg-secondary/10 text-secondary text-sm rounded-full transition-all duration-300 hover:scale-105">
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
          <h1 className="text-3xl font-bold mb-4">Project not found</h1>
          <p className="text-muted-foreground mb-6">
            Sorry, the project you're looking for doesn't exist.
          </p>
          <Link href="/portfolio">
            <Button>
              <i className="ri-arrow-left-line mr-2"></i>
              Back to Portfolio
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
      <Link href="/portfolio" className="inline-flex items-center text-muted-foreground hover:text-secondary mb-8 transition-colors">
        <i className="ri-arrow-left-line mr-2"></i>
        Back to Portfolio
      </Link>

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
              <Badge className="bg-yellow-500 text-white">
                <i className="ri-star-fill mr-1"></i>
                Featured
              </Badge>
            )}
            {project.category && (
              <Badge variant="secondary">
                {project.category.name}
              </Badge>
            )}
          </div>

          <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
          
          <div className="text-muted-foreground mb-6">
            <i className="ri-calendar-line mr-2"></i>
            {new Date(project.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long'
            })}
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
            <p className="text-lg leading-relaxed">{project.description}</p>
          </div>

          {/* Technologies */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Technologies Used</h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech: string, index: number) => (
                <TechBadge key={index} tech={tech} />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            {project.demoUrl && (
              <Button asChild className="flex-1">
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                  <i className="ri-eye-line mr-2"></i>
                  Live Demo
                </a>
              </Button>
            )}
            {project.codeUrl && (
              <Button variant="outline" asChild className="flex-1">
                <a href={project.codeUrl} target="_blank" rel="noopener noreferrer">
                  <i className="ri-github-line mr-2"></i>
                  View Code
                </a>
              </Button>
            )}
          </div>

          {/* Lessons Learned */}
          {project.lessonsLearned && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Lessons Learned</h3>
                <p className="text-muted-foreground">{project.lessonsLearned}</p>
              </CardContent>
            </Card>
          )}

          {/* Project sections */}
          {project.challenge && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Challenge</h3>
                <p className="text-muted-foreground">{project.challenge}</p>
              </CardContent>
            </Card>
          )}

          {project.solution && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Solution</h3>
                <p className="text-muted-foreground">{project.solution}</p>
              </CardContent>
            </Card>
          )}

          {project.results && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Results</h3>
                <p className="text-muted-foreground">{project.results}</p>
              </CardContent>
            </Card>
          )}

          {/* Testimonial */}
          {project.testimonial && (
            <Card className="bg-secondary/5 border-secondary/20">
              <CardContent className="p-6">
                <blockquote className="text-lg italic mb-4">
                  "{project.testimonial.quote}"
                </blockquote>
                <div className="flex items-center">
                  <div>
                    <p className="font-semibold">{project.testimonial.author}</p>
                    {project.testimonial.role && (
                      <p className="text-sm text-muted-foreground">{project.testimonial.role}</p>
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
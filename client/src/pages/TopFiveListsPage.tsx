import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getLists } from "@/data/lists";
import { GlowingCard } from "@/components/ui/glowing-card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const TopFiveListsPage = () => {
  const [expandedList, setExpandedList] = useState<number | null>(null);
  
  const { data: lists, isLoading } = useQuery({
    queryKey: ["/api/lists"],
    initialData: getLists(),
  });

  const toggleExpandList = (index: number) => {
    setExpandedList(expandedList === index ? null : index);
  };

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
        <h1 className="text-gray-900 mb-6" style={{ 
          fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
          fontWeight: '700',
          fontSize: 'clamp(32px, 5vw, 48px)',
          lineHeight: '1.2'
        }}>Top Five Lists</h1>
        <p className="text-gray-600 max-w-3xl mx-auto" style={{ 
          fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '17px',
          lineHeight: '1.5'
        }}>
          A glimpse into my favorite tools, resources, and inspirations that have shaped my journey.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {lists.map((list, listIndex) => {
          const isExpanded = expandedList === listIndex;
          
          return (
            <motion.div
              key={listIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: listIndex * 0.1 }}
              className="flex flex-col"
            >
              <GlowingCard 
                className={`bg-background/30 backdrop-blur-sm rounded-xl overflow-hidden border 
                          ${isExpanded ? 'border-secondary' : 'border-border'} 
                          hover:border-secondary transition-all duration-300 h-full`}
                glowColor={list.color || "#22c55e"}
                strength={isExpanded ? 0.5 : 0.3}
              >
                <div className={`p-6 ${isExpanded ? 'pb-4' : 'pb-6'}`}>
                  <div 
                    className={`flex items-center justify-between cursor-pointer mb-2`}
                    onClick={() => toggleExpandList(listIndex)}
                  >
                    <h3 className={`text-2xl font-space font-semibold flex items-center`}>
                      <span 
                        className="w-10 h-10 rounded-full flex items-center justify-center mr-3" 
                        style={{ backgroundColor: `${list.color}20`, color: list.color }}
                      >
                        <i className={`${list.icon} text-xl`}></i>
                      </span>
                      {list.title}
                    </h3>
                    <button 
                      className={`text-muted-foreground hover:text-secondary transition-colors`}
                      aria-label={isExpanded ? "Collapse list" : "Expand list"}
                    >
                      <i className={`ri-${isExpanded ? 'subtract-line' : 'add-line'} text-xl`}></i>
                    </button>
                  </div>
                  
                  {list.description && (
                    <p className="text-muted-foreground ml-12 mb-4">{list.description}</p>
                  )}

                  <ol className="space-y-6 mt-6">
                    {list.items.map((item, itemIndex) => (
                      <motion.li 
                        key={itemIndex} 
                        className={`flex items-start p-3 rounded-lg transition-all duration-300
                                  ${item.highlight ? 'bg-secondary/10 border border-secondary/20' : 'hover:bg-background/50'}
                                  ${isExpanded ? 'opacity-100' : itemIndex > 2 && !isExpanded ? 'hidden' : 'opacity-100'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * itemIndex, duration: 0.3 }}
                      >
                        <div 
                          className="rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0"
                          style={{ backgroundColor: `${list.color}20`, color: list.color }}
                        >
                          {itemIndex + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap justify-between items-start">
                            <h4 className={`font-medium font-space text-lg ${item.highlight ? 'text-secondary' : ''}`}>
                              {item.title}
                            </h4>
                            
                            {item.link && (
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="p-0 h-auto text-xs text-secondary"
                                asChild
                              >
                                <a href={item.link} target="_blank" rel="noopener noreferrer">
                                  {item.linkText || "Learn more"} <i className="ri-external-link-line ml-1"></i>
                                </a>
                              </Button>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
                          
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.title} 
                              className="mt-2 rounded-md w-full h-auto max-h-40 object-cover"
                            />
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </ol>
                  
                  {!isExpanded && list.items.length > 3 && (
                    <div className="text-center mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpandList(listIndex)}
                        className="text-muted-foreground hover:text-secondary"
                      >
                        Show all {list.items.length} items <i className="ri-arrow-down-s-line ml-1"></i>
                      </Button>
                    </div>
                  )}
                </div>
              </GlowingCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TopFiveListsPage;
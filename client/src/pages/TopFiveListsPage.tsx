import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getLists } from "@/data/lists";
import { useState } from "react";
import { X } from "lucide-react";

const TopFiveListsPage = () => {
  const [selectedList, setSelectedList] = useState<number | null>(null);
  
  const { data: lists, isLoading } = useQuery({
    queryKey: ["/api/lists"],
    initialData: getLists(),
  });

  const openModal = (index: number) => {
    setSelectedList(index);
  };

  const closeModal = () => {
    setSelectedList(null);
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
        className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-gray-900 mb-3" style={{ 
          fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
          fontWeight: '700',
          fontSize: 'clamp(28px, 4vw, 36px)',
          lineHeight: '1.2'
        }}>Top Five Lists</h1>
        <p className="text-gray-600 max-w-3xl mx-auto" style={{ 
          fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '15px',
          lineHeight: '1.4'
        }}>
          A glimpse into my favorite tools, resources, and inspirations that have shaped my journey.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden 
                          ${isExpanded ? 'border-blue-200' : 'border-gray-200'} 
                          hover:border-blue-200 transition-all duration-300 h-full`}>
                
                {/* Main Image */}
                {list.mainImage && (
                  <div className="relative h-24 w-full overflow-hidden">
                    <img 
                      src={list.mainImage} 
                      alt={list.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  </div>
                )}
                
                <div className={`p-3 ${isExpanded ? 'pb-2' : 'pb-3'}`}>
                  <div 
                    className={`flex items-center justify-between cursor-pointer mb-1`}
                    onClick={() => toggleExpandList(listIndex)}
                  >
                    <h3 className={`text-base font-semibold flex items-center text-gray-900`} style={{ 
                      fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '16px'
                    }}>
                      <span 
                        className="w-6 h-6 rounded-full flex items-center justify-center mr-2 bg-blue-50" 
                      >
                        <i className={`${list.icon} text-sm text-blue-600`}></i>
                      </span>
                      {list.title}
                    </h3>
                    <button 
                      className={`text-gray-600 hover:text-blue-600 transition-colors`}
                      aria-label={isExpanded ? "Collapse list" : "Expand list"}
                    >
                      <i className={`ri-${isExpanded ? 'subtract-line' : 'add-line'} text-base`}></i>
                    </button>
                  </div>
                  
                  {list.description && (
                    <p className="text-gray-600 ml-8 mb-2" style={{ 
                      fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '13px'
                    }}>{list.description}</p>
                  )}

                  <ol className="space-y-2 mt-2">
                    {list.items.map((item, itemIndex) => (
                      <motion.li 
                        key={itemIndex} 
                        className={`flex items-start p-1.5 rounded-md transition-all duration-300
                                  ${item.highlight ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}
                                  ${isExpanded ? 'opacity-100' : itemIndex > 2 && !isExpanded ? 'hidden' : 'opacity-100'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * itemIndex, duration: 0.3 }}
                      >
                        <div 
                          className="rounded-full w-5 h-5 flex items-center justify-center font-bold mr-2 flex-shrink-0 bg-blue-100 text-blue-600 text-xs"
                          style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
                        >
                          {itemIndex + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap justify-between items-start">
                            <h4 className={`font-medium ${item.highlight ? 'text-blue-600' : 'text-gray-900'}`} style={{ 
                              fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
                              fontSize: '14px'
                            }}>
                              {item.title}
                            </h4>
                            
                            {item.link && (
                              <a 
                                href={item.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium ml-2"
                                style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
                              >
                                {item.linkText || "Learn more"} <i className="ri-external-link-line ml-1"></i>
                              </a>
                            )}
                          </div>
                          <p className="text-gray-600 text-xs mt-0.5" style={{ 
                            fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: '12px'
                          }}>{item.description}</p>
                          
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.title} 
                              className="mt-1 rounded-md w-20 h-12 object-cover border border-gray-200"
                            />
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </ol>
                  
                  {!isExpanded && list.items.length > 3 && (
                    <div className="text-center mt-2">
                      <button
                        onClick={() => toggleExpandList(listIndex)}
                        className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-xs"
                        style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
                      >
                        Show all {list.items.length} items <i className="ri-arrow-down-s-line ml-1"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TopFiveListsPage;
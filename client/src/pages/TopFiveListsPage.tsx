import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getLists } from "@/data/lists";
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
              <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden 
                          ${isExpanded ? 'border-blue-200' : 'border-gray-200'} 
                          hover:border-blue-200 transition-all duration-300 h-full`}>
                
                {/* Main Image */}
                {list.mainImage && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <img 
                      src={list.mainImage} 
                      alt={list.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  </div>
                )}
                
                <div className={`p-8 ${isExpanded ? 'pb-6' : 'pb-8'}`}>
                  <div 
                    className={`flex items-center justify-between cursor-pointer mb-4`}
                    onClick={() => toggleExpandList(listIndex)}
                  >
                    <h3 className={`text-2xl font-semibold flex items-center text-gray-900`} style={{ 
                      fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '20px'
                    }}>
                      <span 
                        className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-blue-50" 
                      >
                        <i className={`${list.icon} text-xl text-blue-600`}></i>
                      </span>
                      {list.title}
                    </h3>
                    <button 
                      className={`text-gray-600 hover:text-blue-600 transition-colors`}
                      aria-label={isExpanded ? "Collapse list" : "Expand list"}
                    >
                      <i className={`ri-${isExpanded ? 'subtract-line' : 'add-line'} text-xl`}></i>
                    </button>
                  </div>
                  
                  {list.description && (
                    <p className="text-gray-600 ml-12 mb-6" style={{ 
                      fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '16px'
                    }}>{list.description}</p>
                  )}

                  <ol className="space-y-6 mt-6">
                    {list.items.map((item, itemIndex) => (
                      <motion.li 
                        key={itemIndex} 
                        className={`flex items-start p-4 rounded-lg transition-all duration-300
                                  ${item.highlight ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}
                                  ${isExpanded ? 'opacity-100' : itemIndex > 2 && !isExpanded ? 'hidden' : 'opacity-100'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * itemIndex, duration: 0.3 }}
                      >
                        <div 
                          className="rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0 bg-blue-100 text-blue-600"
                          style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
                        >
                          {itemIndex + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap justify-between items-start">
                            <h4 className={`font-medium text-lg ${item.highlight ? 'text-blue-600' : 'text-gray-900'}`} style={{ 
                              fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
                              fontSize: '17px'
                            }}>
                              {item.title}
                            </h4>
                            
                            {item.link && (
                              <a 
                                href={item.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
                              >
                                {item.linkText || "Learn more"} <i className="ri-external-link-line ml-1"></i>
                              </a>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mt-1" style={{ 
                            fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: '15px'
                          }}>{item.description}</p>
                          
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.title} 
                              className="mt-3 rounded-lg w-32 h-20 object-cover border border-gray-200"
                            />
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </ol>
                  
                  {!isExpanded && list.items.length > 3 && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() => toggleExpandList(listIndex)}
                        className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
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
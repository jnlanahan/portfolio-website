import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { X } from "lucide-react";

const TopFiveListsPage = () => {
  const [selectedList, setSelectedList] = useState<number | null>(null);
  const [selectedListItems, setSelectedListItems] = useState<any[]>([]);
  
  const { data: lists = [], isLoading } = useQuery({
    queryKey: ["/api/lists"],
  });

  // Fetch items for the selected list
  const { data: items = [] } = useQuery({
    queryKey: ["/api/lists", selectedList, "items"],
    enabled: selectedList !== null,
    onSuccess: (data) => {
      setSelectedListItems(data || []);
    },
  });

  const openModal = (index: number) => {
    const listId = lists[index]?.id;
    if (listId) {
      setSelectedList(listId);
    }
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

      {lists.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <i className="ri-list-check-3 text-6xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ 
            fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            No Top 5 Lists Yet
          </h3>
          <p className="text-gray-600" style={{ 
            fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            Check back soon for curated lists of favorite tools, resources, and inspirations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {lists.map((list, listIndex) => (
            <motion.div
              key={listIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: listIndex * 0.1 }}
              className="flex flex-col"
            >
              <div 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-blue-200 transition-all duration-300 h-full cursor-pointer"
                onClick={() => openModal(listIndex)}
              >
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
                
                <div className="p-3">
                  <div className="flex items-center mb-1">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center mr-2 bg-blue-50">
                      <i className={`${list.icon} text-sm text-blue-600`}></i>
                    </span>
                    <h3 className="text-base font-semibold text-gray-900" style={{ 
                      fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '16px'
                    }}>
                      {list.title}
                    </h3>
                  </div>
                  
                  {list.description && (
                    <p className="text-gray-600 ml-8 text-sm" style={{ 
                      fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '13px'
                    }}>
                      {list.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedList !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center">
                {(() => {
                  const currentList = lists.find(list => list.id === selectedList);
                  return (
                    <>
                      <span className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-blue-50">
                        <i className={`${currentList?.icon || 'ri-list-line'} text-lg text-blue-600`}></i>
                      </span>
                      <h2 className="text-2xl font-bold text-gray-900" style={{ 
                        fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif'
                      }}>
                        {currentList?.title || 'List'}
                      </h2>
                    </>
                  );
                })()}
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {(() => {
                const currentList = lists.find(list => list.id === selectedList);
                return currentList?.description && (
                  <p className="text-gray-600 mb-6" style={{ 
                    fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '16px'
                  }}>
                    {currentList.description}
                  </p>
                );
              })()}
              
              <ol className="space-y-4">
                {selectedListItems.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300">
                    <div className="rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0 bg-blue-100 text-blue-600">
                      {itemIndex + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between items-start mb-2">
                        <h4 className={`font-medium text-lg ${item.highlight ? 'text-blue-600' : 'text-gray-900'}`} style={{ 
                          fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif'
                        }}>
                          {item.title}
                        </h4>
                        
                        {item.link && (
                          <a 
                            href={item.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium ml-2"
                            style={{ fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
                          >
                            {item.linkText || "Learn more"} <i className="ri-external-link-line ml-1"></i>
                          </a>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm" style={{ 
                        fontFamily: 'Work Sans, -apple-system, BlinkMacSystemFont, sans-serif'
                      }}>
                        {item.description}
                      </p>
                      
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="mt-3 rounded-lg w-32 h-24 object-cover border border-gray-200"
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopFiveListsPage;
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getLists } from "@/data/lists";
import { GlowingCard } from "@/components/ui/glowing-card";

const TopFiveListsPage = () => {
  const { data: lists, isLoading } = useQuery({
    queryKey: ["/api/lists"],
    initialData: getLists(),
  });

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
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Top 5 Lists</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          A glimpse into my favorite tools, resources, and inspirations.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {lists.map((list, listIndex) => (
          <motion.div
            key={listIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: listIndex * 0.1 }}
          >
            <GlowingCard className="bg-background/30 backdrop-blur-sm rounded-xl overflow-hidden border border-border hover:border-secondary transition-all duration-300">
              <div className="p-6">
                <h3 className="text-2xl font-space font-semibold mb-6 flex items-center">
                  <i className={`${list.icon} text-secondary mr-3`}></i>
                  {list.title}
                </h3>

                <ol className="space-y-4">
                  {list.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <span className="bg-primary/20 text-primary rounded-full w-7 h-7 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                        {itemIndex + 1}
                      </span>
                      <div>
                        <h4 className="font-medium font-space">{item.title}</h4>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </GlowingCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TopFiveListsPage;
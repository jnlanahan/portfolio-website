import { motion } from "framer-motion";
import { ListsType } from "@/data/lists";

interface TopFiveListsProps {
  lists: ListsType;
}

export const TopFiveLists: React.FC<TopFiveListsProps> = ({ lists }) => {
  return (
    <section id="top5" className="py-24 bg-[#1E1E1E]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-space mb-4">Top 5 Lists</h2>
          <div className="w-24 h-1 bg-secondary mb-8"></div>
          <p className="text-lg text-muted-foreground text-center max-w-3xl">
            A glimpse into my favorite tools, resources, and inspirations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {lists.map((list, listIndex) => (
            <motion.div
              key={listIndex}
              className="bg-background rounded-xl overflow-hidden border border-border hover:border-secondary transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: listIndex * 0.1 }}
            >
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

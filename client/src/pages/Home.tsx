import React from "react";
import { Hero } from "../sections/Hero";
import { About } from "../sections/About";
import { Experience } from "../sections/Experience";
import { Portfolio } from "../sections/Portfolio";
import { Blog } from "../sections/Blog";
import { TopFiveLists } from "../sections/TopFiveLists";
import { Contact } from "../sections/Contact";
import { useQuery } from "@tanstack/react-query";
import { getResume } from "@/data/resume";
import { getPortfolio } from "@/data/portfolio";
import { getBlogPosts } from "@/data/blog";
import { getLists } from "@/data/lists";

const Home: React.FC = () => {
  const { data: resume } = useQuery({
    queryKey: ["/api/resume"],
    initialData: getResume(),
  });

  const { data: portfolio } = useQuery({
    queryKey: ["/api/portfolio"],
    initialData: getPortfolio(),
  });

  const { data: blogPosts } = useQuery({
    queryKey: ["/api/blog"],
    initialData: getBlogPosts(),
  });

  const { data: lists } = useQuery({
    queryKey: ["/api/lists"],
    initialData: getLists(),
  });

  return (
    <>
      <Hero />
      <About />
      <Experience resume={resume} />
      <Portfolio projects={portfolio} />
      <Blog posts={blogPosts} />
      <TopFiveLists lists={lists} />
      <Contact />
    </>
  );
};

export default Home;

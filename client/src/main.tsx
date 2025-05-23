import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply dark mode class to html by default
document.documentElement.classList.add('dark');

createRoot(document.getElementById("root")!).render(<App />);

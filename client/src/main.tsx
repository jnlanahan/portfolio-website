import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initAnalytics } from "./lib/analytics";

// Apply dark mode class to html by default
document.documentElement.classList.add('dark');

// Initialize PostHog analytics
initAnalytics();

createRoot(document.getElementById("root")!).render(<App />);

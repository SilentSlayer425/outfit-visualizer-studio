import { createRoot } from "react-dom/client";
import { goToSubdomain } from '@/utils/navigation';
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

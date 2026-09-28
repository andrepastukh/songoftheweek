import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/caveat/latin-500.css";
import "@fontsource/dancing-script/latin-500.css";
import "@fontsource/patrick-hand/latin-400.css";
import "@fontsource/qwigley/latin-400.css";
import "@fontsource/sacramento/latin-400.css";
import { App } from "./app/App";
import "./styles/globals.css";

const root = createRoot(document.getElementById("root")!);
root.render(<StrictMode><App /></StrictMode>);

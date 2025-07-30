import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { analytics } from "./lib/analytics";
import { PostHogProvider } from "posthog-js/react";
import "./assets/shimmer.css";
import "./styles.css";

// Initialize analytics before rendering
analytics.initialize();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        defaults: '2025-05-24',
        capture_exceptions: true,
        debug: import.meta.env.MODE === "development",
      }}
    >
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </PostHogProvider>
  </React.StrictMode>,
);

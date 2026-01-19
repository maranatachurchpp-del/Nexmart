import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App.tsx";
import "./index.css";

// Performance monitoring (apenas em produção)
if (import.meta.env.PROD) {
  // Lazy load web-vitals apenas se necessário
  import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
    // Report to analytics service (can be extended to send to backend)
    const reportWebVitals = (metric: { name: string; value: number }) => {
      // In production, you could send this to an analytics endpoint
      // For now, we just silently collect the data
    };
    
    onCLS(reportWebVitals);
    onINP(reportWebVitals);
    onFCP(reportWebVitals);
    onLCP(reportWebVitals);
    onTTFB(reportWebVitals);
  }).catch(() => {
    // web-vitals não disponível - fail silently
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

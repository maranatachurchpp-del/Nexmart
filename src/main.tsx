import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App.tsx";
import "./index.css";

// Performance monitoring (apenas em produção)
if (import.meta.env.PROD) {
  // Web Vitals monitoring
  const reportWebVitals = (metric: any) => {
    console.log(metric);
    // Aqui você pode enviar para analytics
  };
  
  // Lazy load web-vitals apenas se necessário
  import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
    onCLS(reportWebVitals);
    onINP(reportWebVitals);
    onFCP(reportWebVitals);
    onLCP(reportWebVitals);
    onTTFB(reportWebVitals);
  }).catch(() => {
    // web-vitals não disponível
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

import React, { useState } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { RoutesApp } from "./routes";
import ToastViewport from "./components/UI/ToastViewport";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <RoutesApp />
        <ToastViewport />
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;

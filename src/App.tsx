import React, { useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Payslips from './components/Payslips';
import Documents from './components/Documents';
import FoodOrder from './components/FoodOrder';
import Support from './components/Support';
import Surveys from './components/Surveys';
import Login from './pages/Login';
import CalendarView from './components/CalendarView';
import OrganizationERP from './components/OrganizationERP';
import NewsPage from './components/NewsPage';
import NewsArticle from './components/NewsArticle';
import { Menu } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { dir } = useLanguage();

  // Don't show layout on login page
  if (location.pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-bmw-base transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className={`flex-1 transition-all duration-300 ${dir === 'rtl' ? 'lg:mr-64' : 'lg:ml-64'}`}>
        {/* Mobile Header */}
        <div className="lg:hidden h-16 bg-bmw-surface border-b border-bmw-border flex items-center px-4 sticky top-0 z-30 transition-colors duration-300">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="text-bmw-textSec hover:text-bmw-text"
          >
            <Menu size={24} />
          </button>
          <span className="mx-4 font-bold text-bmw-text">Persia Khodro</span>
        </div>

        {/* Page Content */}
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const AppContent: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/payslips" element={<Payslips />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/food" element={<FoodOrder />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/support" element={<Support />} />
          <Route path="/surveys" element={<Surveys />} />
          <Route path="/erp" element={<OrganizationERP />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsArticle />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
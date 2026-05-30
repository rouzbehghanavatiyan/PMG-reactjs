import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  CreditCard, 
  Utensils, 
  Ticket, 
  LogOut, 
  Settings,
  Menu,
  X,
  Globe,
  Sun,
  Moon,
  CalendarDays,
  ClipboardList,
  LayoutGrid
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { t, language, setLanguage, dir } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    // In a real app, clear auth tokens here
    navigate('/login');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fa' : 'en');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'dashboard', path: '/' },
    { icon: User, label: 'profile', path: '/profile' },
    { icon: CreditCard, label: 'payslips', path: '/payslips' },
    { icon: CalendarDays, label: 'calendar', path: '/calendar' },
    { icon: LayoutGrid, label: 'erp_title', path: '/erp' },
    { icon: FileText, label: 'documents', path: '/documents' },
    { icon: Utensils, label: 'food_order', path: '/food' },
    { icon: ClipboardList, label: 'surveys', path: '/surveys' },
    { icon: Ticket, label: 'support', path: '/support' },
  ];

  // Determine transform based on direction
  const hiddenTransform = dir === 'rtl' ? 'translate-x-full' : '-translate-x-full';

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 ${dir === 'rtl' ? 'right-0 border-s' : 'left-0 border-r'} h-full w-64 bg-bmw-surface border-bmw-border z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : hiddenTransform}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-bmw-border">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-900 to-bmw-blue flex items-center justify-center border border-white/20">
                  <span className="text-white font-bold text-xs">PK</span>
               </div>
               <span className="text-bmw-text font-semibold tracking-wide text-lg">PERSIA<span className="font-light">KHODRO</span></span>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-bmw-textSec hover:text-bmw-text">
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group
                  ${isActive 
                    ? 'bg-bmw-blue text-white shadow-lg shadow-blue-900/50' 
                    : 'text-bmw-textSec hover:bg-bmw-hover hover:text-bmw-text'
                  }
                `}
              >
                <item.icon size={20} className="stroke-[1.5]" />
                <span className="text-sm font-medium tracking-wide">{t(item.label)}</span>
              </NavLink>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-bmw-border space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2 px-3 py-3 text-bmw-textSec hover:text-bmw-text hover:bg-bmw-hover rounded-md transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button 
                onClick={toggleLanguage}
                className="flex items-center justify-center gap-2 px-3 py-3 text-bmw-textSec hover:text-bmw-text hover:bg-bmw-hover rounded-md transition-colors"
                title="Toggle Language"
              >
                <Globe size={20} />
                <span className="text-sm font-medium">{language === 'en' ? 'FA' : 'EN'}</span>
              </button>
            </div>
            
            <button className="flex items-center gap-3 px-4 py-3 w-full text-bmw-textSec hover:text-bmw-text hover:bg-bmw-hover rounded-md transition-colors">
              <Settings size={20} />
              <span className="text-sm font-medium">{t('settings')}</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors"
            >
              <LogOut size={20} className="rtl:rotate-180" />
              <span className="text-sm font-medium">{t('sign_out')}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
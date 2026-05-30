import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Gift } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Employee {
  id: string;
  name: string;
  department: string;
  day: number;
  imageUrl: string;
}

const mockBirthdays: Employee[] = [
  { id: '1', name: 'Behzad Naderloo', department: 'Sales', day: 5, imageUrl: '/assets/1002.jpg' },
  { id: '2', name: 'Sara Ahmadi', department: 'HR', day: 12, imageUrl: '/assets/1002.jpg' },
  { id: '3', name: 'Mohammad Karimi', department: 'IT', day: 24, imageUrl: '/assets/1002.jpg' },
];

const BirthdaysWidget: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentMonthEn = new Date().toLocaleString('en-US', { month: 'long' });
  // For Persian, we can hardcode or use Intl.DateTimeFormat if supported, but let's just use a generic or localized string
  const currentMonthFa = new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(new Date());
  
  const monthName = language === 'fa' ? currentMonthFa : currentMonthEn;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === mockBirthdays.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? mockBirthdays.length - 1 : prev - 1));
  };

  const currentEmployee = mockBirthdays[currentIndex];

  return (
    <div className="bg-bmw-surface border border-bmw-border rounded-lg p-5 shadow-sm flex flex-col min-h-[200px]">
      {/* Header */}
      <h3 className="text-lg font-bold text-bmw-text mb-4 flex items-center gap-2">
        <Gift size={18} className="text-bmw-blue" />
        {t('born_in_month')} {monthName}
      </h3>

      {/* Carousel Content */}
      <div className="flex-1 flex items-center justify-between">
        <button 
          onClick={dir === 'rtl' ? nextSlide : prevSlide}
          className="p-2 text-bmw-textSec hover:text-bmw-text hover:bg-bmw-hover rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in duration-300" key={currentEmployee.id}>
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-bmw-blue mb-3 shadow-sm">
            <img src={currentEmployee.imageUrl} alt={currentEmployee.name} className="w-full h-full object-cover" />
          </div>
          <h4 className="font-bold text-lg text-bmw-text">{currentEmployee.name}</h4>
          <p className="text-sm text-bmw-textSec">{currentEmployee.department}</p>
          <p className="text-xs font-medium bg-bmw-hover text-bmw-text px-2 py-1 rounded mt-2">
            {language === 'fa' ? `${currentEmployee.day} ${monthName}` : `${monthName} ${currentEmployee.day}`}
          </p>
        </div>

        <button 
          onClick={dir === 'rtl' ? prevSlide : nextSlide}
          className="p-2 text-bmw-textSec hover:text-bmw-text hover:bg-bmw-hover rounded-full transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default BirthdaysWidget;

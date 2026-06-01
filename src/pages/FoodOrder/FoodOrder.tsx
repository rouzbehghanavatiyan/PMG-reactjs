import React, { useState } from 'react';
import { Utensils, Calendar, Check, Leaf, Flame, Info } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

type MealType = 'A' | 'B' | 'None';

interface DailyMenu {
  dayKey: string;
  date: string;
  menuA: { nameKey: string; cals: number; tags: string[] };
  menuB: { nameKey: string; cals: number; tags: string[] };
}

const FoodOrder: React.FC = () => {
  const { t, language } = useLanguage();
  const [selections, setSelections] = useState<Record<string, MealType>>({
    'sat': 'None',
    'sun': 'None',
    'mon': 'None',
    'tue': 'None',
    'wed': 'None',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mock Menu Data
  const weeklyMenu: DailyMenu[] = [
    { 
      dayKey: 'sat', 
      date: 'Oct 28', 
      menuA: { nameKey: 'kebab', cals: 950, tags: ['Popular'] },
      menuB: { nameKey: 'salad', cals: 450, tags: ['Healthy'] }
    },
    { 
      dayKey: 'sun', 
      date: 'Oct 29', 
      menuA: { nameKey: 'stew', cals: 880, tags: ['Traditional'] },
      menuB: { nameKey: 'diet_chicken', cals: 500, tags: ['Protein'] }
    },
    { 
      dayKey: 'mon', 
      date: 'Oct 30', 
      menuA: { nameKey: 'chicken', cals: 920, tags: ['Popular'] },
      menuB: { nameKey: 'veggie', cals: 350, tags: ['Vegan'] }
    },
    { 
      dayKey: 'tue', 
      date: 'Oct 31', 
      menuA: { nameKey: 'pasta', cals: 850, tags: [] },
      menuB: { nameKey: 'salad', cals: 450, tags: ['Healthy'] }
    },
    { 
      dayKey: 'wed', 
      date: 'Nov 01', 
      menuA: { nameKey: 'fish', cals: 780, tags: ['Omega3'] },
      menuB: { nameKey: 'diet_chicken', cals: 500, tags: ['Protein'] }
    },
  ];

  const handleSelect = (day: string, type: MealType) => {
    setSelections(prev => ({ ...prev, [day]: type }));
    setSuccess(false);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      // Scroll to top or show toast in real app
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bmw-text flex items-center gap-2">
            <Utensils className="text-bmw-blue" />
            {t('food_title')}
          </h1>
          <p className="text-bmw-textSec text-sm mt-1">{t('food_sub')}</p>
        </div>
        <div className="flex items-center gap-2 bg-bmw-surface border border-bmw-border px-4 py-2 rounded-lg text-sm text-bmw-textSec">
          <Calendar size={16} className="text-bmw-blue" />
          <span>{t('week_start')}</span>
        </div>
      </div>

      {success && (
        <div className="bg-green-900/20 border border-green-800 text-green-500 p-4 rounded-lg flex items-center gap-3 animate-pulse shadow-sm">
          <Check size={20} />
          {t('order_success')}
        </div>
      )}

      {/* Days Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {weeklyMenu.map((day) => (
          <div key={day.dayKey} className="bg-bmw-surface border border-bmw-border rounded-xl overflow-hidden flex flex-col h-full hover:border-bmw-textSec transition-colors shadow-sm">
            {/* Date Header */}
            <div className="bg-bmw-base p-3 text-center border-b border-bmw-border">
              <h3 className="font-bold text-bmw-text text-lg">{t(`days.${day.dayKey}`)}</h3>
              <span className="text-xs text-bmw-textSec font-mono">{day.date}</span>
            </div>

            {/* Content */}
            <div className="p-3 flex-1 flex flex-col gap-3">
              {/* Menu A Selection */}
              <label className={`
                relative flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all
                ${selections[day.dayKey] === 'A' 
                  ? 'border-bmw-blue bg-blue-900/10' 
                  : 'border-transparent bg-bmw-hover hover:border-bmw-border'}
              `}>
                <input 
                  type="radio" 
                  name={`meal-${day.dayKey}`} 
                  className="hidden" 
                  checked={selections[day.dayKey] === 'A'} 
                  onChange={() => handleSelect(day.dayKey, 'A')}
                />
                <div className="flex justify-between items-start mb-1">
                   <span className="text-xs font-bold text-bmw-blue uppercase tracking-wider">{t('menu_a')}</span>
                   {selections[day.dayKey] === 'A' && <Check size={14} className="text-bmw-blue" />}
                </div>
                <p className="text-sm text-bmw-text font-medium leading-tight mb-2 h-10 flex items-center">
                   {t(`meals.${day.menuA.nameKey}`)}
                </p>
                <div className="flex items-center gap-2 mt-auto">
                   <span className="text-[10px] text-gray-500 flex items-center gap-1">
                     <Flame size={10} /> {day.menuA.cals} {t('calories')}
                   </span>
                </div>
              </label>

              {/* Menu B Selection */}
              <label className={`
                relative flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all
                ${selections[day.dayKey] === 'B' 
                  ? 'border-green-600 bg-green-900/10' 
                  : 'border-transparent bg-bmw-hover hover:border-bmw-border'}
              `}>
                <input 
                  type="radio" 
                  name={`meal-${day.dayKey}`} 
                  className="hidden" 
                  checked={selections[day.dayKey] === 'B'} 
                  onChange={() => handleSelect(day.dayKey, 'B')}
                />
                <div className="flex justify-between items-start mb-1">
                   <span className="text-xs font-bold text-green-500 uppercase tracking-wider">{t('menu_b')}</span>
                   {selections[day.dayKey] === 'B' && <Check size={14} className="text-green-500" />}
                </div>
                <p className="text-sm text-bmw-text font-medium leading-tight mb-2 h-10 flex items-center">
                   {t(`meals.${day.menuB.nameKey}`)}
                </p>
                <div className="flex items-center gap-2 mt-auto">
                   <span className="text-[10px] text-gray-500 flex items-center gap-1">
                     <Leaf size={10} /> {day.menuB.cals} {t('calories')}
                   </span>
                </div>
              </label>

               {/* None Selection */}
               <label className={`
                relative flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-all mt-auto
                ${selections[day.dayKey] === 'None' 
                  ? 'border-bmw-textSec bg-bmw-textSec text-bmw-base' 
                  : 'border-dashed border-bmw-textSec text-bmw-textSec hover:text-bmw-text'}
              `}>
                <input 
                  type="radio" 
                  name={`meal-${day.dayKey}`} 
                  className="hidden" 
                  checked={selections[day.dayKey] === 'None'} 
                  onChange={() => handleSelect(day.dayKey, 'None')}
                />
                <span className="text-xs font-medium">{t('no_food')}</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-bmw-surface border-t border-bmw-border lg:relative lg:border lg:rounded-xl lg:bg-bmw-surface lg:p-6 lg:mt-8 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-4 text-sm text-bmw-textSec">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-bmw-blue"></div>
                 <span>{Object.values(selections).filter(v => v === 'A').length} x {t('menu_a')}</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-green-500"></div>
                 <span>{Object.values(selections).filter(v => v === 'B').length} x {t('menu_b')}</span>
              </div>
           </div>
           
           <button 
             onClick={handleSubmit}
             disabled={isSubmitting}
             className={`
               w-full md:w-auto px-8 py-3 rounded-lg font-bold text-white transition-all shadow-lg shadow-blue-900/40
               ${isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-bmw-blue hover:bg-blue-600 transform hover:scale-105'}
             `}
           >
             {isSubmitting ? 'Processing...' : t('submit_order')}
           </button>
        </div>
      </div>
      {/* Spacer for fixed bottom bar on mobile */}
      <div className="h-20 lg:hidden"></div>
    </div>
  );
};

export default FoodOrder;
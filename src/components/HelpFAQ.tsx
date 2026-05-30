import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, BookOpen, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FAQItem {
  id: string;
  questionKey: string;
  answerKey: string;
  category: 'general' | 'hr' | 'it' | 'food';
}

const faqs: FAQItem[] = [
  {
    id: '1',
    questionKey: 'faq_q1',
    answerKey: 'faq_a1',
    category: 'general'
  },
  {
    id: '2',
    questionKey: 'faq_q2',
    answerKey: 'faq_a2',
    category: 'hr'
  },
  {
    id: '3',
    questionKey: 'faq_q3',
    answerKey: 'faq_a3',
    category: 'it'
  },
  {
    id: '4',
    questionKey: 'faq_q4',
    answerKey: 'faq_a4',
    category: 'food'
  },
  {
    id: '5',
    questionKey: 'faq_q5',
    answerKey: 'faq_a5',
    category: 'hr'
  }
];

const HelpFAQ: React.FC = () => {
  const { t, dir } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const categories = [
    { id: 'all', label: t('filters.all') },
    { id: 'general', label: t('categories.general') },
    { id: 'hr', label: t('categories.hr') },
    { id: 'it', label: t('categories.it') },
    { id: 'food', label: t('food_order') }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const questionText = t(faq.questionKey).toLowerCase();
    const answerText = t(faq.answerKey).toLowerCase();
    const matchesSearch = questionText.includes(searchQuery.toLowerCase()) || answerText.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bmw-text flex items-center gap-2">
            <HelpCircle className="text-bmw-blue" />
            {t('help_faq')}
          </h1>
          <p className="text-bmw-textSec text-sm mt-1">{t('help_sub')}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-bmw-surface border border-bmw-border rounded-xl p-4 md:p-6 shadow-sm space-y-4">
        <div className="relative w-full max-w-2xl mx-auto">
          <Search size={20} className={`absolute top-1/2 transform -translate-y-1/2 text-gray-500 ${dir === 'rtl' ? 'right-4' : 'left-4'}`} />
          <input 
            type="text" 
            placeholder={t('search_help')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-bmw-base border border-bmw-border rounded-full py-3 px-12 text-bmw-text focus:border-bmw-blue focus:outline-none focus:ring-1 focus:ring-bmw-blue transition-colors`}
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.id 
                  ? 'bg-bmw-blue text-white shadow-md shadow-blue-900/20' 
                  : 'bg-bmw-base text-bmw-textSec hover:bg-bmw-hover hover:text-bmw-text border border-bmw-border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQ List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-bmw-text mb-4">{t('frequently_asked')}</h2>
          
          {filteredFaqs.length > 0 ? (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => (
                <div 
                  key={faq.id} 
                  className="bg-bmw-surface border border-bmw-border rounded-xl overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-bmw-hover transition-colors"
                  >
                    <span className="font-semibold text-bmw-text pr-4">{t(faq.questionKey)}</span>
                    {openFaqId === faq.id ? (
                      <ChevronUp className="text-bmw-blue flex-shrink-0" size={20} />
                    ) : (
                      <ChevronDown className="text-bmw-textSec flex-shrink-0" size={20} />
                    )}
                  </button>
                  
                  <div 
                    className={`px-4 overflow-hidden transition-all duration-300 ease-in-out ${
                      openFaqId === faq.id ? 'max-h-96 pb-4 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-bmw-textSec text-sm leading-relaxed border-t border-bmw-border/50 pt-3">
                      {t(faq.answerKey)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-bmw-surface border border-bmw-border rounded-xl p-8 text-center">
              <HelpCircle className="mx-auto text-bmw-textSec/50 mb-3" size={48} />
              <p className="text-bmw-textSec">{t('no_results_found')}</p>
            </div>
          )}
        </div>

        {/* Quick Links & Contact */}
        <div className="space-y-6">
          <div className="bg-bmw-surface border border-bmw-border rounded-xl p-6">
            <h3 className="font-bold text-bmw-text mb-4 flex items-center gap-2">
              <BookOpen className="text-bmw-blue" size={20} />
              {t('quick_guides')}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-bmw-textSec hover:text-bmw-blue transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-bmw-blue"></div>
                  {t('guide_payslip')}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-bmw-textSec hover:text-bmw-blue transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-bmw-blue"></div>
                  {t('guide_food')}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-bmw-textSec hover:text-bmw-blue transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-bmw-blue"></div>
                  {t('guide_ticket')}
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-bmw-surface to-bmw-base border border-bmw-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="text-bmw-blue" size={24} />
            </div>
            <h3 className="font-bold text-bmw-text mb-2">{t('still_need_help')}</h3>
            <p className="text-sm text-bmw-textSec mb-4">{t('contact_support_desc')}</p>
            <a 
              href="#/support"
              className="inline-block w-full bg-bmw-blue hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {t('contact_support')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpFAQ;

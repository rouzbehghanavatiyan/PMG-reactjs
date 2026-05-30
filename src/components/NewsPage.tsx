import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, Search, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { allNewsData } from '../data/news';

const NewsPage: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const currentNews = allNewsData[language] || allNewsData['en'];
  
  const filteredNews = currentNews.filter(news => 
    news.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    news.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    news.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bmw-text flex items-center gap-2">
            <Newspaper className="text-bmw-blue" />
            {t('news_page_title')}
          </h1>
          <p className="text-bmw-textSec text-sm mt-1">{t('news_page_sub')}</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search size={18} className={`absolute top-1/2 transform -translate-y-1/2 text-gray-500 ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
          <input 
            type="text" 
            placeholder={t('search_news')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-bmw-surface border border-bmw-border rounded-full py-2 px-10 text-sm text-bmw-text focus:border-bmw-blue focus:outline-none focus:ring-1 focus:ring-bmw-blue transition-colors`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map((news) => (
          <div key={news.id} className="bg-bmw-surface border border-bmw-border rounded-xl overflow-hidden flex flex-col hover:shadow-xl hover:shadow-black/10 transition-all duration-300 group">
            <div className="h-48 relative overflow-hidden">
              <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 start-3 bg-bmw-blue text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-md">
                {news.category}
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-bmw-text mb-2 group-hover:text-bmw-blue transition-colors">{news.title}</h3>
                <p className="text-bmw-textSec text-sm line-clamp-3">{news.summary}</p>
              </div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-bmw-border">
                <span className="text-xs text-bmw-textSec font-medium">{news.date}</span>
                <button 
                  onClick={() => navigate(`/news/${news.id}`)}
                  className="text-sm text-bmw-blue font-medium flex items-center gap-1 hover:text-blue-400 transition-colors"
                >
                  {t('read_more')} <ArrowUpRight size={16} className="rtl:rotate-180" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredNews.length === 0 && (
          <div className="col-span-full py-12 text-center bg-bmw-surface border border-bmw-border rounded-xl">
            <Newspaper className="mx-auto text-bmw-textSec/50 mb-3" size={48} />
            <p className="text-bmw-textSec">{t('no_results_found')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;

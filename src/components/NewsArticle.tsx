import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { allNewsData } from '../data/news';

const NewsArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language, dir } = useLanguage();

  const currentNewsList = allNewsData[language] || allNewsData['en'];
  const article = currentNewsList.find(news => news.id === id);

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-2xl font-bold text-bmw-text">{t('no_results_found')}</h2>
        <button 
          onClick={() => navigate('/news')}
          className="bg-bmw-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          {t('back_to_news')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-bmw-textSec hover:text-bmw-blue transition-colors group"
      >
        <ArrowLeft size={20} className={`group-hover:-translate-x-1 transition-transform ${dir === 'rtl' ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
        <span className="font-medium">{t('back_to_news')}</span>
      </button>

      {/* Article Content */}
      <article className="bg-bmw-surface border border-bmw-border rounded-xl overflow-hidden shadow-sm">
        {/* Hero Image */}
        <div className="w-full h-64 md:h-96 relative">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 start-4 bg-bmw-blue text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-md">
            {article.category}
          </div>
        </div>

        {/* Article Body */}
        <div className="p-6 md:p-10">
          <h1 className="text-2xl md:text-4xl font-bold text-bmw-text mb-4 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-bmw-textSec mb-8 pb-6 border-b border-bmw-border">
            <div className="flex items-center gap-1.5">
              <Calendar size={16} />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag size={16} />
              <span>{article.category}</span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-bmw-textSec font-medium leading-relaxed mb-6">
              {article.summary}
            </p>
            
            {article.content?.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="text-bmw-text leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};

export default NewsArticle;

import React, { useState } from 'react';
import { ClipboardList, Clock, Trophy, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Question {
  id: string;
  text: string;
  options: string[];
}

interface Survey {
  id: string;
  title: string;
  description: string;
  points: number;
  questionsCount: number;
  timeEst: number; // minutes
  deadline: string;
  status: 'active' | 'completed' | 'expired';
  questions: Question[];
}

const Surveys: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Mock Data
  const surveys: Survey[] = [
    {
      id: '1',
      title: language === 'fa' ? 'رضایت شغلی سه ماهه سوم' : 'Q3 Job Satisfaction',
      description: language === 'fa' ? 'لطفاً نظرات خود را در مورد محیط کار و تعادل کار و زندگی به اشتراک بگذارید.' : 'Please share your feedback regarding the workplace environment and work-life balance.',
      points: 50,
      questionsCount: 5,
      timeEst: 3,
      deadline: '2023-11-15',
      status: 'active',
      questions: [
        { id: 'q1', text: 'How satisfied are you with your current role?', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'] },
        { id: 'q2', text: 'Do you feel valued by your manager?', options: ['Yes, always', 'Sometimes', 'Rarely', 'No'] },
        { id: 'q3', text: 'How would you rate the office facilities?', options: ['Excellent', 'Good', 'Average', 'Poor'] },
        { id: 'q4', text: 'Do you have the tools you need to do your job?', options: ['Yes', 'No'] },
        { id: 'q5', text: 'Would you recommend Persia Khodro as a place to work?', options: ['Yes', 'No'] },
      ]
    },
    {
      id: '2',
      title: language === 'fa' ? 'نظرسنجی کیفیت غذای رستوران' : 'Cafeteria Food Quality',
      description: language === 'fa' ? 'ما در حال برنامه‌ریزی منوی جدید هستیم. به ما بگویید چه چیزی را دوست دارید.' : 'We are planning the new menu. Tell us what you like.',
      points: 20,
      questionsCount: 3,
      timeEst: 2,
      deadline: '2023-11-10',
      status: 'active',
      questions: [
         { id: 'q1', text: 'Rate the quality of lunch meals.', options: ['⭐⭐⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐', '⭐⭐', '⭐'] },
         { id: 'q2', text: 'Which cuisine do you prefer?', options: ['Persian', 'International', 'Fast Food', 'Vegetarian'] },
         { id: 'q3', text: 'Is the portion size adequate?', options: ['Too big', 'Just right', 'Too small'] },
      ]
    },
    {
      id: '3',
      title: language === 'fa' ? 'بازخورد رویداد رونمایی X7' : 'X7 Launch Event Feedback',
      description: language === 'fa' ? 'بازخورد رویداد هفته گذشته.' : 'Feedback on last week\'s launch event.',
      points: 30,
      questionsCount: 4,
      timeEst: 2,
      deadline: '2023-10-25',
      status: 'completed',
      questions: []
    }
  ];

  const handleStartSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setAnswers({});
    setIsSubmitted(false);
  };

  const handleAnswer = (qId: string, optionIdx: number) => {
    setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    // Simulate API call
    setTimeout(() => {
      setSelectedSurvey(null);
      // In a real app, we would update the survey status locally or refetch
    }, 3000);
  };

  const filteredSurveys = surveys.filter(s => 
    activeTab === 'active' ? s.status === 'active' : s.status !== 'active'
  );

  // Render Survey Taking Mode
  if (selectedSurvey && !isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setSelectedSurvey(null)}
            className="text-bmw-textSec hover:text-bmw-text transition-colors flex items-center gap-2"
          >
             <ArrowRight size={20} className="rtl:rotate-180" /> {t('cancel')}
          </button>
          <div className="flex items-center gap-2 text-yellow-500 font-bold bg-yellow-500/10 px-3 py-1 rounded-full">
            <Trophy size={16} />
            <span>+{selectedSurvey.points} {t('points')}</span>
          </div>
        </div>

        <div className="bg-bmw-surface border border-bmw-border rounded-xl p-8 shadow-lg">
           <h2 className="text-2xl font-bold text-bmw-text mb-2">{selectedSurvey.title}</h2>
           <p className="text-bmw-textSec mb-8">{selectedSurvey.description}</p>

           <div className="space-y-8">
             {selectedSurvey.questions.map((q, qIdx) => (
               <div key={q.id} className="space-y-3">
                 <h3 className="text-bmw-text font-medium text-lg">
                   {qIdx + 1}. {q.text}
                 </h3>
                 <div className="space-y-2">
                   {q.options.map((opt, oIdx) => (
                     <label 
                       key={oIdx}
                       className={`
                         flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                         ${answers[q.id] === oIdx 
                           ? 'border-bmw-blue bg-blue-900/10' 
                           : 'border-bmw-border hover:border-bmw-textSec hover:bg-bmw-hover'}
                       `}
                     >
                       <input 
                         type="radio" 
                         name={q.id} 
                         checked={answers[q.id] === oIdx}
                         onChange={() => handleAnswer(q.id, oIdx)}
                         className="w-4 h-4 text-bmw-blue accent-bmw-blue bg-transparent"
                       />
                       <span className="text-bmw-text">{opt}</span>
                     </label>
                   ))}
                 </div>
               </div>
             ))}
           </div>

           <div className="mt-8 pt-6 border-t border-bmw-border flex justify-end">
             <button 
               onClick={handleSubmit}
               disabled={Object.keys(answers).length !== selectedSurvey.questions.length}
               className={`
                 px-6 py-3 rounded-lg font-bold text-white transition-all
                 ${Object.keys(answers).length === selectedSurvey.questions.length
                   ? 'bg-bmw-blue hover:bg-blue-600 shadow-lg shadow-blue-900/30'
                   : 'bg-gray-600 cursor-not-allowed'}
               `}
             >
               {t('submit_feedback')}
             </button>
           </div>
        </div>
      </div>
    );
  }

  // Render Success Message
  if (selectedSurvey && isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 animate-in fade-in zoom-in duration-300">
         <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-900/40">
           <CheckCircle size={40} className="text-white" />
         </div>
         <div>
           <h2 className="text-3xl font-bold text-bmw-text mb-2">{t('thank_you')}</h2>
           <p className="text-bmw-textSec">{t('survey_completed_msg')}</p>
         </div>
         <div className="flex items-center gap-2 text-yellow-500 font-bold bg-yellow-500/10 px-4 py-2 rounded-full text-lg">
            <Trophy size={20} />
            <span>+{selectedSurvey.points} {t('points')}</span>
         </div>
      </div>
    );
  }

  // Render List
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bmw-text flex items-center gap-2">
            <ClipboardList className="text-bmw-blue" />
            {t('surveys_title')}
          </h1>
          <p className="text-bmw-textSec text-sm mt-1">{t('surveys_sub')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bmw-surface p-1 rounded-lg border border-bmw-border w-fit">
        <button 
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'active' ? 'bg-bmw-blue text-white shadow' : 'text-bmw-textSec hover:text-bmw-text'}`}
        >
          {t('active_surveys')}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-bmw-blue text-white shadow' : 'text-bmw-textSec hover:text-bmw-text'}`}
        >
          {t('survey_history')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSurveys.map(survey => (
          <div key={survey.id} className="bg-bmw-surface border border-bmw-border rounded-xl overflow-hidden hover:border-bmw-blue/50 transition-all group flex flex-col h-full shadow-sm">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                 <div className="px-2 py-1 bg-bmw-base rounded border border-bmw-border text-xs text-bmw-textSec font-mono">
                   {survey.questionsCount} {t('questions_count')}
                 </div>
                 {survey.status === 'completed' ? (
                   <div className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-900/10 px-2 py-1 rounded">
                     <CheckCircle size={12} /> {t('completed')}
                   </div>
                 ) : (
                   <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold bg-yellow-900/10 px-2 py-1 rounded">
                     <Trophy size={12} /> {survey.points} {t('points')}
                   </div>
                 )}
              </div>
              
              <h3 className="text-xl font-bold text-bmw-text mb-2 line-clamp-2 group-hover:text-bmw-blue transition-colors">
                {survey.title}
              </h3>
              <p className="text-bmw-textSec text-sm line-clamp-3 mb-4">
                {survey.description}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-bmw-textSec">
                <div className="flex items-center gap-1">
                  <Clock size={14} /> {survey.timeEst} {t('minutes')}
                </div>
                <div>
                   Deadline: <span className="text-bmw-text font-medium">{survey.deadline}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-bmw-border bg-bmw-base/50">
              <button 
                onClick={() => handleStartSurvey(survey)}
                disabled={survey.status !== 'active'}
                className={`
                  w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2
                  ${survey.status === 'active' 
                    ? 'bg-bmw-blue text-white hover:bg-blue-600 shadow-lg shadow-blue-900/20' 
                    : 'bg-bmw-border text-bmw-textSec cursor-default'}
                `}
              >
                {survey.status === 'active' ? (
                  <>{t('start_survey')} <ArrowRight size={16} className="rtl:rotate-180" /></>
                ) : (
                  t('completed')
                )}
              </button>
            </div>
          </div>
        ))}

        {filteredSurveys.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-bmw-textSec opacity-60">
             <ClipboardList size={48} className="mb-4" />
             <p>No surveys found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Surveys;
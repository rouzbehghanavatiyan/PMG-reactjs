import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Event {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  title: string;
  type: 'company' | 'national_holiday' | 'company_holiday' | 'leave' | 'task';
  description?: string;
  time?: string;
  location?: string;
}

const CalendarView: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    location: ''
  });

  // Mock Data (In production, fetch from API)
  const currentYear = new Date().getFullYear();
  const currentMonthStr = String(new Date().getMonth() + 1).padStart(2, '0');

  const [events, setEvents] = useState<Event[]>([
    { id: '1', date: `${currentYear}-${currentMonthStr}-05`, title: 'Product Launch: X5 Facelift', type: 'company', time: '10:00 AM', location: 'Showroom A' },
    { id: '2', date: `${currentYear}-${currentMonthStr}-12`, title: 'National Holiday', type: 'national_holiday' },
    { id: '3', date: `${currentYear}-${currentMonthStr}-20`, title: 'Quarterly Town Hall', type: 'company', time: '02:00 PM', location: 'Conference Hall' },
    { id: '4', date: `${currentYear}-${currentMonthStr}-28`, title: 'Sick Leave', type: 'leave' },
    { id: '5', date: `${currentYear}-${currentMonthStr}-15`, title: 'Company Anniversary', type: 'company_holiday' },
    { id: '6', date: `${currentYear}-${currentMonthStr}-24`, title: 'Public Holiday', type: 'national_holiday' }
  ]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.date) return;

    const task: Event = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      date: newTask.date,
      time: newTask.time || undefined,
      location: newTask.location || undefined,
      type: 'task'
    };

    setEvents([...events, task]);
    setNewTask({ title: '', date: new Date().toISOString().split('T')[0], time: '', location: '' });
    setIsModalOpen(false);
  };

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Navigation Handlers
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Determine weekdays based on language (English: Sun-Sat, Persian: Sat-Fri)
  // Note: Standard Date.getDay() returns 0 for Sunday.
  // For Persian, we want Sat (6) to be first column.
  // For English, we usually want Sun (0) or Mon (1). Let's stick to standard Sun-Sat for EN.
  
  const weekdays = language === 'fa' 
    ? ['ش', '۱ش', '۲ش', '۳ش', '۴ش', '۵ش', 'ج'] // Sat to Fri
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate grid cells
  const cells = [];
  
  // Logic for Persian (Starts Saturday) vs English (Starts Sunday)
  let startOffset = firstDayOfMonth; 
  if (language === 'fa') {
    // In JS Date: Sun=0, Mon=1... Sat=6.
    // We want Sat to be index 0.
    // If first day is Sat (6), offset should be 0.
    // If first day is Sun (0), offset should be 1.
    // formula: (day + 1) % 7
    startOffset = (firstDayOfMonth + 1) % 7;
  }

  // Prev Month Padding
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({
      day: daysInPrevMonth - i,
      type: 'prev',
      dateStr: new Date(year, month - 1, daysInPrevMonth - i + 1).toISOString().split('T')[0]
    });
  }

  // Current Month Days
  for (let i = 1; i <= daysInMonth; i++) {
    // Pad month/day with 0 for comparison with ISO strings
    const currentMonthStr = (month + 1).toString().padStart(2, '0');
    const dayStr = i.toString().padStart(2, '0');
    cells.push({
      day: i,
      type: 'current',
      dateStr: `${year}-${currentMonthStr}-${dayStr}`
    });
  }

  // Next Month Padding
  const remainingCells = 42 - cells.length; // 6 rows * 7 cols
  for (let i = 1; i <= remainingCells; i++) {
    cells.push({
      day: i,
      type: 'next',
      dateStr: new Date(year, month + 1, i + 1).toISOString().split('T')[0] // rough approximation for unique key
    });
  }

  // Helper for Event Styles
  const getEventStyle = (type: string) => {
    switch(type) {
      case 'company': return 'bg-bmw-blue text-white';
      case 'national_holiday': return 'bg-red-500 text-white';
      case 'company_holiday': return 'bg-orange-500 text-white';
      case 'leave': return 'bg-green-600 text-white';
      case 'task': return 'bg-purple-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getEventDot = (type: string) => {
    switch(type) {
      case 'company': return 'bg-bmw-blue';
      case 'national_holiday': return 'bg-red-500';
      case 'company_holiday': return 'bg-orange-500';
      case 'leave': return 'bg-green-600';
      case 'task': return 'bg-purple-600';
      default: return 'bg-gray-500';
    }
  };

  // Filter events for current month list
  const currentMonthEvents = events.filter(e => {
    const eDate = new Date(e.date);
    return eDate.getMonth() === month && eDate.getFullYear() === year;
  }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
          <h1 className="text-2xl font-bold text-bmw-text flex items-center gap-2">
            <CalendarIcon className="text-bmw-blue" />
            {t('calendar_title')}
          </h1>
          <p className="text-bmw-textSec text-sm mt-1">{t('calendar_sub')}</p>
        </div>
        
        {/* Legend */}
        <div className="hidden md:flex gap-4 items-center">
           {['company', 'national_holiday', 'company_holiday', 'leave', 'task'].map(type => (
             <div key={type} className="flex items-center gap-2 text-xs">
                <div className={`w-3 h-3 rounded-full ${getEventDot(type)}`}></div>
                <span className="text-bmw-textSec">{t(`event_types.${type}`)}</span>
             </div>
           ))}
           <button 
             onClick={() => setIsModalOpen(true)}
             className="ml-4 bg-bmw-blue text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-lg"
             title={t('add_task')}
           >
             <ChevronRight className="rotate-90 rtl:-rotate-90" size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-bmw-surface border border-bmw-border rounded-xl p-6 shadow-sm">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-bmw-text capitalize">
              {currentDate.toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button onClick={dir === 'rtl' ? nextMonth : prevMonth} className="p-2 rounded-full border border-bmw-border hover:bg-bmw-hover text-bmw-text transition-colors">
                 <ChevronLeft size={20} className="rtl:rotate-180" />
              </button>
              <button onClick={dir === 'rtl' ? prevMonth : nextMonth} className="p-2 rounded-full border border-bmw-border hover:bg-bmw-hover text-bmw-text transition-colors">
                 <ChevronRight size={20} className="rtl:rotate-180" />
              </button>
            </div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 mb-2">
            {weekdays.map((day, idx) => (
              <div key={idx} className="text-center text-sm font-semibold text-bmw-textSec py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 lg:gap-2">
            {cells.map((cell, idx) => {
              const dayEvents = events.filter(e => e.date === cell.dateStr);
              return (
                <div 
                  key={idx} 
                  className={`
                    min-h-[80px] md:min-h-[100px] border rounded-lg p-2 flex flex-col justify-between transition-colors
                    ${cell.type === 'current' 
                      ? 'bg-bmw-base border-bmw-border hover:border-bmw-blue/50' 
                      : 'bg-bmw-hover border-transparent opacity-50'}
                  `}
                >
                  <span className={`text-sm font-medium ${cell.type === 'current' ? 'text-bmw-text' : 'text-bmw-textSec'}`}>
                    {cell.day.toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US')}
                  </span>
                  
                  {/* Event Dots/Bars */}
                  <div className="flex flex-col gap-1 mt-1">
                    {dayEvents.map(evt => (
                      <div 
                        key={evt.id} 
                        className={`text-[10px] truncate px-1.5 py-0.5 rounded ${getEventStyle(evt.type)}`}
                        title={evt.title}
                      >
                        {evt.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Upcoming Events */}
        <div className="space-y-6">
          <div className="bg-bmw-surface border border-bmw-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-bmw-text mb-4">{t('upcoming_events')}</h3>
            <div className="space-y-4">
              {currentMonthEvents.length > 0 ? (
                currentMonthEvents.map(evt => (
                  <div key={evt.id} className="flex gap-4 group">
                    <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg shrink-0 ${getEventStyle(evt.type)} bg-opacity-10 text-opacity-100`}>
                       <span className="text-xs font-bold uppercase">{new Date(evt.date).toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US', { month: 'short' })}</span>
                       <span className="text-lg font-bold">{new Date(evt.date).getDate().toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US')}</span>
                    </div>
                    <div>
                      <h4 className="text-bmw-text font-semibold text-sm group-hover:text-bmw-blue transition-colors">{evt.title}</h4>
                      <p className="text-xs text-bmw-textSec mt-1">{t(`event_types.${evt.type}`)}</p>
                      {(evt.time || evt.location) && (
                        <div className="flex gap-3 mt-2 text-[10px] text-bmw-textSec">
                           {evt.time && <span className="flex items-center gap-1"><Clock size={10} /> {evt.time}</span>}
                           {evt.location && <span className="flex items-center gap-1"><MapPin size={10} /> {evt.location}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-bmw-textSec italic">{t('no_events_month')}</p>
              )}
            </div>
          </div>
          
          {/* Legend Mobile (Visible only on small screens) */}
          <div className="md:hidden bg-bmw-surface border border-bmw-border rounded-xl p-4">
             <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-bmw-text">Legend</h4>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-bmw-blue text-white px-3 py-1 rounded text-xs font-bold"
                >
                  {t('add_task')}
                </button>
             </div>
             <div className="grid grid-cols-2 gap-2">
               {['company', 'national_holiday', 'company_holiday', 'leave', 'task'].map(type => (
                 <div key={type} className="flex items-center gap-2 text-xs">
                    <div className={`w-3 h-3 rounded-full ${getEventDot(type)}`}></div>
                    <span className="text-bmw-textSec">{t(`event_types.${type}`)}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bmw-surface border border-bmw-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-bmw-text mb-6">{t('add_task')}</h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-bmw-textSec mb-1">{t('task_title')}</label>
                <input 
                  type="text" 
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full bg-bmw-base border border-bmw-border rounded-lg px-4 py-2 text-bmw-text focus:border-bmw-blue outline-none transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bmw-textSec mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    value={newTask.date}
                    onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                    className="w-full bg-bmw-base border border-bmw-border rounded-lg px-4 py-2 text-bmw-text focus:border-bmw-blue outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bmw-textSec mb-1">Time (Optional)</label>
                  <input 
                    type="time" 
                    value={newTask.time}
                    onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                    className="w-full bg-bmw-base border border-bmw-border rounded-lg px-4 py-2 text-bmw-text focus:border-bmw-blue outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-bmw-textSec mb-1">Location (Optional)</label>
                <input 
                  type="text" 
                  value={newTask.location}
                  onChange={(e) => setNewTask({...newTask, location: e.target.value})}
                  className="w-full bg-bmw-base border border-bmw-border rounded-lg px-4 py-2 text-bmw-text focus:border-bmw-blue outline-none transition-colors"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-bmw-hover border border-bmw-border rounded-lg text-bmw-text hover:bg-opacity-80 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-bmw-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-bold"
                >
                  {t('save_task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
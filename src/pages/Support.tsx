import React, { useState } from 'react';
import { Ticket, Plus, Search, MessageSquare, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TicketData {
  id: string;
  subject: string;
  category: 'it' | 'hr' | 'facility' | 'general';
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'progress' | 'closed';
  date: string;
  description: string;
}

const mockTickets: TicketData[] = [
  {
    id: 'TK-902',
    subject: 'VPN Connection Issue',
    category: 'it',
    priority: 'high',
    status: 'open',
    date: '2023-10-25',
    description: 'Cannot connect to internal network from home.'
  },
  {
    id: 'TK-884',
    subject: 'Air Conditioning Maintenance',
    category: 'facility',
    priority: 'medium',
    status: 'progress',
    date: '2023-10-20',
    description: 'Room 404 is too warm.'
  },
  {
    id: 'TK-750',
    subject: 'Insurance Document Request',
    category: 'hr',
    priority: 'low',
    status: 'closed',
    date: '2023-10-15',
    description: 'Need copy of supplementary insurance contract.'
  }
];

const Support: React.FC = () => {
  const { t, dir } = useLanguage();
  const [tickets, setTickets] = useState<TicketData[]>(mockTickets);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('it');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: TicketData = {
      id: `TK-${Math.floor(Math.random() * 1000)}`,
      subject,
      category: category as any,
      priority: priority as any,
      status: 'open',
      date: new Date().toISOString().split('T')[0],
      description
    };
    
    setTickets([newTicket, ...tickets]);
    setIsFormOpen(false);
    // Reset form
    setSubject('');
    setDescription('');
    setCategory('it');
    setPriority('medium');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-500 bg-green-900/10 border-green-800/30';
      case 'progress': return 'text-blue-500 bg-blue-900/10 border-blue-800/30';
      case 'closed': return 'text-gray-500 bg-gray-800/20 border-gray-700/30';
      default: return 'text-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bmw-text flex items-center gap-2">
            <Ticket className="text-bmw-blue" />
            {t('support_title')}
          </h1>
          <p className="text-bmw-textSec text-sm mt-1">{t('support_sub')}</p>
        </div>
        
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-lg
            ${isFormOpen 
              ? 'bg-red-900/10 text-red-500 border border-red-900/30 hover:bg-red-900/20' 
              : 'bg-bmw-blue text-white hover:bg-blue-600 shadow-blue-900/40'}
          `}
        >
          {isFormOpen ? <X size={18} /> : <Plus size={18} />}
          {isFormOpen ? t('cancel') : t('new_ticket')}
        </button>
      </div>

      {/* Quick Register Form */}
      <div className={`
        bg-bmw-surface border border-bmw-blue/50 rounded-xl overflow-hidden transition-all duration-300 ease-in-out
        ${isFormOpen ? 'max-h-[600px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0 border-0'}
      `}>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
             <h3 className="text-bmw-text font-bold text-lg mb-1">{t('new_ticket')}</h3>
             <p className="text-bmw-textSec text-xs">Please provide detailed information for faster resolution.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-bmw-textSec text-xs mb-1 uppercase tracking-wider">{t('ticket_subject')}</label>
              <input 
                required
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-bmw-base border border-bmw-border rounded-lg p-3 text-bmw-text focus:border-bmw-blue focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-bmw-textSec text-xs mb-1 uppercase tracking-wider">{t('ticket_category')}</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-bmw-base border border-bmw-border rounded-lg p-3 text-bmw-text focus:border-bmw-blue focus:outline-none appearance-none"
                >
                  <option value="it">{t('categories.it')}</option>
                  <option value="hr">{t('categories.hr')}</option>
                  <option value="facility">{t('categories.facility')}</option>
                  <option value="general">{t('categories.general')}</option>
                </select>
               </div>
               <div>
                <label className="block text-bmw-textSec text-xs mb-1 uppercase tracking-wider">{t('ticket_priority')}</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-bmw-base border border-bmw-border rounded-lg p-3 text-bmw-text focus:border-bmw-blue focus:outline-none appearance-none"
                >
                  <option value="low">{t('priorities.low')}</option>
                  <option value="medium">{t('priorities.medium')}</option>
                  <option value="high">{t('priorities.high')}</option>
                </select>
               </div>
            </div>
          </div>

          <div className="flex flex-col h-full">
            <label className="block text-bmw-textSec text-xs mb-1 uppercase tracking-wider">{t('ticket_desc')}</label>
            <textarea 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-bmw-base border border-bmw-border rounded-lg p-3 text-bmw-text focus:border-bmw-blue focus:outline-none flex-1 resize-none"
            ></textarea>
            <button 
              type="submit" 
              className="mt-4 w-full bg-bmw-blue hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors"
            >
              {t('submit_request')}
            </button>
          </div>
        </form>
      </div>

      {/* Ticket List */}
      <div className="bg-bmw-surface border border-bmw-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-bmw-border flex justify-between items-center bg-bmw-hover">
          <h3 className="font-bold text-bmw-text">{t('recent_tickets')}</h3>
          <div className="relative hidden md:block w-64">
            <Search size={16} className={`absolute top-1/2 transform -translate-y-1/2 text-gray-500 ${dir === 'rtl' ? 'left-3' : 'right-3'}`} />
            <input 
              type="text" 
              placeholder={t('search_docs')} 
              className="w-full bg-bmw-base border-none rounded-full py-1.5 px-4 text-sm text-bmw-text focus:ring-1 focus:ring-bmw-blue"
            />
          </div>
        </div>

        <div className="divide-y divide-bmw-border">
           {tickets.map((ticket) => (
             <div key={ticket.id} className="p-4 hover:bg-bmw-hover transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-gray-500 text-xs font-mono">{ticket.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(ticket.status)}`}>
                          {t(`statuses.${ticket.status}`)}
                        </span>
                        <span className="text-bmw-textSec text-[10px] hidden md:inline-block">•</span>
                        <span className="text-bmw-textSec text-xs hidden md:inline-block">{t(`categories.${ticket.category}`)}</span>
                      </div>
                      <h4 className="text-bmw-text font-semibold text-base mb-1 group-hover:text-bmw-blue transition-colors">
                        {ticket.subject}
                      </h4>
                      <p className="text-bmw-textSec text-sm line-clamp-1">{ticket.description}</p>
                   </div>

                   <div className="flex items-center justify-between md:justify-end gap-6 text-sm">
                      <div className="flex items-center gap-1.5" title={t('ticket_priority')}>
                         <AlertCircle size={16} className={getPriorityColor(ticket.priority)} />
                         <span className={`text-xs capitalize ${getPriorityColor(ticket.priority)}`}>
                           {t(`priorities.${ticket.priority}`)}
                         </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-bmw-textSec" title={t('last_update')}>
                         <Clock size={16} />
                         <span className="text-xs">{ticket.date}</span>
                      </div>
                      <button className="p-2 rounded-full hover:bg-bmw-base text-bmw-textSec hover:text-bmw-text transition-colors">
                        <MessageSquare size={18} />
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Support;
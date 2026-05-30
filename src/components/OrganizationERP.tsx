import React from 'react';
import { 
  BarChart3, 
  UserCircle, 
  ClipboardList, 
  ListTodo, 
  Monitor, 
  GraduationCap, 
  MonitorPlay, 
  Utensils, 
  FolderOpen, 
  Network,
  LayoutGrid
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const OrganizationERP: React.FC = () => {
  const { t } = useLanguage();

  const systems = [
    { id: 'bi', icon: BarChart3, link: '#' },
    { id: 'employee_services', icon: UserCircle, link: '#' },
    { id: 'meetings', icon: ClipboardList, link: '#' },
    { id: 'tasks', icon: ListTodo, link: '#' },
    { id: 'rahkaran', icon: Monitor, link: '#' },
    { id: 'training', icon: GraduationCap, link: '#' },
    { id: 'seven_pro_pk', icon: MonitorPlay, link: '#' },
    { id: 'seven_pro_mk', icon: MonitorPlay, link: '#' },
    { id: 'food_menu', icon: Utensils, link: '/food' },
    { id: 'documents', icon: FolderOpen, link: '/documents' },
    { id: 'dealers', icon: Network, link: '#' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bmw-text flex items-center gap-2">
            <LayoutGrid className="text-bmw-blue" />
            {t('erp_title')}
          </h1>
          <p className="text-bmw-textSec text-sm mt-1">{t('erp_sub')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {systems.map((system) => {
          const Icon = system.icon;
          return (
            <a 
              key={system.id}
              href={system.link}
              className="bg-bmw-surface border border-bmw-border rounded-xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:border-bmw-blue hover:shadow-md transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-full bg-bmw-base flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <Icon size={32} className="text-bmw-blue" strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-bmw-text group-hover:text-bmw-blue transition-colors">
                {t(`erp_systems.${system.id}`)}
              </h3>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default OrganizationERP;

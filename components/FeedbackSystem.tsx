import React, { useState } from 'react';
import { 
  Lightbulb, 
  Send, 
  History, 
  UserCheck, 
  FileText, 
  Paperclip, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MessageSquare, 
  Plus, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Filter, 
  Calendar,
  X,
  Search,
  Download
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FeedbackStatusLog {
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  date: string;
  comment?: string;
}

interface FeedbackItem {
  id: string;
  title: string;
  category: string;
  type: 'suggestion' | 'critic';
  description: string;
  attachmentName?: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  createdAt: string;
  userEmployeeId: string;
  userName: string;
  logs: FeedbackStatusLog[];
  managerComment?: string;
}

// Initial realistic mock data in Persian and English
const initialFeedback: FeedbackItem[] = [
  {
    id: 'FB-4029',
    title: 'پیشنهاد نصب ایستگاه شارژ خودروهای برقی در پارکینگ همکاران',
    category: 'facility',
    type: 'suggestion',
    description: 'با توجه به افزایش روزافزون استفاده همکاران از خودروهای برقی و پلاگین‌هیبرید پرشیا خودرو، پیشنهاد می‌گردد ۲ ایستگاه شارژ AC در پارکینگ همکاران نصب شود تا بتوان در طول ساعات کاری خودروها را شارژ نمود.',
    attachmentName: 'electric_charging_plan.pdf',
    status: 'approved',
    createdAt: '2026-07-01 09:30',
    userEmployeeId: 'PK-1024',
    userName: 'امیرحسین رضایی',
    managerComment: 'طرح بسیار عالی و همسو با سیاست‌های سبز پرشیا خودرو است. بودجه تأمین تجهیزات تصویب شد و نصب ایستگاه‌ها تا انتهای ماه آینده توسط واحد پشتیبانی انجام خواهد شد.',
    logs: [
      { status: 'submitted', date: '2026-07-01 09:30', comment: 'پیشنهاد با موفقیت در سامانه ثبت شد.' },
      { status: 'under_review', date: '2026-07-03 14:15', comment: 'طرح جهت بررسی فنی و تخصیص بودجه به مدیریت پشتیبانی و مهندسی ارجاع گردید.' },
      { status: 'approved', date: '2026-07-05 11:00', comment: 'طرح مورد تأیید نهایی قرار گرفت.' }
    ]
  },
  {
    id: 'FB-3981',
    title: 'انتقاد از کندی سیستم تحویل کار در ساعات شلوغی تعمیرگاه مرکزی',
    category: 'processes',
    type: 'critic',
    description: 'در زمان بازه ساعت ۱۶ الی ۱۸ عصر به دلیل کمبود نیرو در بخش پذیرش و ثبت خروج، همکاران و مشتریان زمان زیادی را معطل می‌شوند. پیشنهاد می‌کنم چینش شیفت‌های کارکنان در این ساعات بازنگری شود.',
    status: 'under_review',
    createdAt: '2026-07-04 15:20',
    userEmployeeId: 'PK-1288',
    userName: 'سارا کریمی',
    managerComment: 'بررسی توزیع بار کاری تعمیرگاه مرکزی در ساعات مذکور آغاز شده است.',
    logs: [
      { status: 'submitted', date: '2026-07-04 15:20', comment: 'انتقاد ثبت و به واحد بهبود فرآیندها ارجاع شد.' },
      { status: 'under_review', date: '2026-07-06 10:00', comment: 'گزارش تردد مشتریان در بازه عصر در حال استخراج و تحلیل است.' }
    ]
  },
  {
    id: 'FB-3850',
    title: 'پیشنهاد برگزاری دوره‌های آموزشی تخصصی مدیریت استرس در محیط کار',
    category: 'hr',
    type: 'suggestion',
    description: 'برای بهبود سلامت روان کارکنان و ارتقای کیفیت روابط بین‌فردی، پیشنهاد می‌کنم دوره‌های کوتاه‌مدت یا وبینارهای روانشناختی با تمرکز بر مدیریت استرس و فرسودگی شغلی توسط دپارتمان سرمایه انسانی برگزار شود.',
    attachmentName: 'stress_management_course.pdf',
    status: 'submitted',
    createdAt: '2026-07-08 11:45',
    userEmployeeId: 'PK-1024',
    userName: 'امیرحسین رضایی',
    logs: [
      { status: 'submitted', date: '2026-07-08 11:45', comment: 'پیشنهاد ثبت شده و آماده بررسی توسط دپارتمان سرمایه انسانی است.' }
    ]
  }
];

const FeedbackSystem: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  // State
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(initialFeedback);
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
  const [role, setRole] = useState<'employee' | 'manager'>('employee');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('hr');
  const [type, setType] = useState<'suggestion' | 'critic'>('suggestion');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Admin/Manager Action State
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [statusComment, setStatusComment] = useState('');
  const [newStatus, setNewStatus] = useState<'submitted' | 'under_review' | 'approved' | 'rejected'>('under_review');

  // Filter State
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'hr', fa: 'منابع انسانی و رفاهی', en: 'HR & Welfare' },
    { id: 'processes', fa: 'فرآیندها و سیستم‌های سازمانی', en: 'Processes & Org Systems' },
    { id: 'facility', fa: 'محیط کاری و ایمنی', en: 'Workplace & Safety' },
    { id: 'it', fa: 'فنی و فناوری اطلاعات', en: 'IT & Technology' },
    { id: 'sales', fa: 'فروش و امور مشتریان', en: 'Sales & Customer Care' }
  ];

  const getCategoryLabel = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return catId;
    return isRtl ? cat.fa : cat.en;
  };

  // Helper to format any date or date string into Persian Shamsi format
  const formatPersianDate = (dateStr: string) => {
    try {
      if (!dateStr) return '';
      // Replace space with T to make it standard ISO
      const isoStr = dateStr.trim().replace(' ', 'T');
      const date = new Date(isoStr);
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  // Export to Excel/CSV function
  const handleExportExcel = () => {
    const headers = isRtl ? [
      'کد پیگیری',
      'نوع',
      'عنوان',
      'حوزه / دپارتمان',
      'نام فرستنده',
      'کد پرسنلی',
      'شرح درخواست',
      'فایل ضمیمه',
      'وضعیت فعلی',
      'تاریخ ایجاد',
      'پاسخ و کامنت مدیریت',
      'تاریخچه و تایم‌لاین تغییرات'
    ] : [
      'Tracking ID',
      'Type',
      'Title',
      'Category/Department',
      'Submitter Name',
      'Employee ID',
      'Description',
      'Attachment',
      'Current Status',
      'Creation Date',
      'Manager Feedback',
      'History & Logs Timeline'
    ];

    const rows = feedbackList.map(item => {
      const typeLabel = item.type === 'suggestion' 
        ? (isRtl ? 'پیشنهاد' : 'Suggestion') 
        : (isRtl ? 'انتقاد' : 'Critic');
      
      const categoryLabel = getCategoryLabel(item.category);
      
      const statusLabel = item.status === 'submitted' ? (isRtl ? 'ثبت اولیه' : 'Submitted')
        : item.status === 'under_review' ? (isRtl ? 'در دست بررسی' : 'Under Review')
        : item.status === 'approved' ? (isRtl ? 'تأیید شده' : 'Approved')
        : (isRtl ? 'رد شده' : 'Rejected');

      // Format logs timeline in a single string
      const logsTimeline = item.logs.map((log, index) => {
        const logStatusLabel = log.status === 'submitted' ? (isRtl ? 'ثبت اولیه' : 'Submitted')
          : log.status === 'under_review' ? (isRtl ? 'در دست بررسی' : 'Under Review')
          : log.status === 'approved' ? (isRtl ? 'تأیید شده' : 'Approved')
          : (isRtl ? 'رد شده' : 'Rejected');
        
        return `${index + 1}) [${formatPersianDate(log.date)}] - ${logStatusLabel}${log.comment ? `: ${log.comment}` : ''}`;
      }).join(' | ');

      const clean = (text?: string) => {
        if (!text) return '';
        // Replace all double quotes with double-double quotes for CSV standard escaping
        return `"${text.replace(/"/g, '""')}"`;
      };

      return [
        clean(item.id),
        clean(typeLabel),
        clean(item.title),
        clean(categoryLabel),
        clean(item.userName),
        clean(item.userEmployeeId),
        clean(item.description),
        clean(item.attachmentName || (isRtl ? 'ندارد' : 'None')),
        clean(statusLabel),
        clean(formatPersianDate(item.createdAt)),
        clean(item.managerComment || ''),
        clean(logsTimeline)
      ];
    });

    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Add UTF-8 BOM so Excel opens Persian text with correct encoding
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PersiaKhodro_Feedback_Export_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setAttachment(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  // Submit Feedback
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    const newItem: FeedbackItem = {
      id: `FB-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      category,
      type,
      description,
      attachmentName: attachment ? attachment.name : undefined,
      status: 'submitted',
      createdAt: dateStr,
      userEmployeeId: 'PK-1024',
      userName: 'امیرحسین رضایی',
      logs: [
        {
          status: 'submitted',
          date: dateStr,
          comment: isRtl ? 'درخواست جدید با موفقیت ثبت گردید.' : 'New request successfully registered.'
        }
      ]
    };

    setFeedbackList([newItem, ...feedbackList]);
    
    // Clear Form
    setTitle('');
    setDescription('');
    setAttachment(null);
    setShowSuccessToast(true);
    
    // Auto-dismiss toast and switch tab
    setTimeout(() => {
      setShowSuccessToast(false);
      setActiveTab('history');
    }, 2500);
  };

  // Handle Manager Change Status
  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedback) return;

    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    const statusLogsMap = {
      submitted: isRtl ? 'بازگشت وضعیت به ثبت اوليه' : 'Status reverted to Submitted',
      under_review: isRtl ? 'تغییر وضعیت به در دست بررسی' : 'Status changed to Under Review',
      approved: isRtl ? 'طرح مورد تأیید نهایی قرار گرفت' : 'Proposal Approved',
      rejected: isRtl ? 'درخواست یا پیشنهاد رد شد' : 'Proposal Rejected'
    };

    const updated = feedbackList.map(item => {
      if (item.id === selectedFeedback.id) {
        const newLogs = [...item.logs, {
          status: newStatus,
          date: dateStr,
          comment: statusComment || statusLogsMap[newStatus]
        }];

        return {
          ...item,
          status: newStatus,
          managerComment: statusComment || item.managerComment,
          logs: newLogs
        };
      }
      return item;
    });

    setFeedbackList(updated);
    setSelectedFeedback(null);
    setStatusComment('');
  };

  const getStatusBadge = (status: FeedbackItem['status']) => {
    const styles = {
      submitted: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
      under_review: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
      approved: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
      rejected: 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
    };

    const faLabels = {
      submitted: 'ثبت شده',
      under_review: 'در دست بررسی',
      approved: 'تأیید شده',
      rejected: 'رد شده'
    };

    const enLabels = {
      submitted: 'Submitted',
      under_review: 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected'
    };

    return (
      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${styles[status]}`}>
        {isRtl ? faLabels[status] : enLabels[status]}
      </span>
    );
  };

  const filteredList = feedbackList.filter(item => {
    // If role is employee, we only show items submitted by PK-1024
    if (role === 'employee' && item.userEmployeeId !== 'PK-1024') {
      return false;
    }

    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesType = filterType === 'all' || item.type === filterType;

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      item.id.toLowerCase().includes(query) ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.userName.toLowerCase().includes(query) ||
      item.userEmployeeId.toLowerCase().includes(query) ||
      (item.managerComment && item.managerComment.toLowerCase().includes(query));

    return matchesCategory && matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-bmw-border pb-6">
        <div className="text-start">
          <h1 className="text-2xl font-black text-bmw-text flex items-center gap-3">
            <div className="p-2 bg-bmw-blue/10 text-bmw-blue rounded-xl border border-bmw-blue/20">
              <Lightbulb size={24} className="animate-pulse" />
            </div>
            {isRtl ? 'نظام پیشنهادات و انتقادات همکاران' : 'Suggestions & Feedback System'}
          </h1>
          <p className="text-bmw-textSec text-sm mt-2 font-medium">
            {isRtl 
              ? 'بستری برای مشارکت فعال همکاران پرشیا خودرو در جهت ارتقای فرآیندها و بهبود مستمر محیط کاری.' 
              : 'A platform for active participation of Persia Khodro staff to improve processes and workplace environment.'}
          </p>
        </div>

        {/* Role Switcher & Tab selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role switcher toggle */}
          <div className="bg-bmw-surface p-1 rounded-xl border border-bmw-border flex gap-1 shadow-inner">
            <button
              onClick={() => { setRole('employee'); setExpandedId(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${role === 'employee' ? 'bg-bmw-blue text-white shadow' : 'text-bmw-textSec hover:text-bmw-text'}`}
            >
              <UserCheck size={14} />
              <span>{isRtl ? 'نمای همکار' : 'Employee View'}</span>
            </button>
            <button
              onClick={() => { setRole('manager'); setExpandedId(null); setActiveTab('history'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${role === 'manager' ? 'bg-amber-600 text-white shadow' : 'text-bmw-textSec hover:text-bmw-text'}`}
            >
              <ShieldAlert size={14} />
              <span>{isRtl ? 'نمای مدیر ارشد' : 'Manager View'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation & Info Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-bmw-surface border border-bmw-border rounded-xl p-4 shadow-sm text-start">
            <h3 className="text-xs font-bold text-bmw-textSec uppercase tracking-wider mb-3">
              {isRtl ? 'منوی ناوبری' : 'Navigation Menu'}
            </h3>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setActiveTab('submit')}
                className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all text-start cursor-pointer ${
                  activeTab === 'submit' 
                    ? 'bg-bmw-blue text-white shadow' 
                    : 'text-bmw-textSec hover:bg-bmw-hover hover:text-bmw-text'
                }`}
              >
                <Plus size={16} />
                <span>{isRtl ? 'ثبت ایده یا انتقاد جدید' : 'Submit New Proposal'}</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all text-start cursor-pointer ${
                  activeTab === 'history' 
                    ? 'bg-bmw-blue text-white shadow' 
                    : 'text-bmw-textSec hover:bg-bmw-hover hover:text-bmw-text'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <History size={16} />
                  <span>{isRtl ? 'تاریخچه و رهگیری درخواست‌ها' : 'Track Status & History'}</span>
                </div>
                <span className="bg-bmw-base text-bmw-text border border-bmw-border px-2 py-0.5 rounded-md text-[10px]">
                  {role === 'employee' ? feedbackList.filter(item => item.userEmployeeId === 'PK-1024').length : feedbackList.length}
                </span>
              </button>
            </div>
          </div>

          {/* Guide Card */}
          <div className="bg-bmw-surface/50 border border-bmw-border rounded-xl p-5 shadow-sm text-start">
            <h3 className="text-xs font-black text-bmw-text mb-2.5 flex items-center gap-2">
              <span>ℹ️</span>
              {isRtl ? 'راهنمای ثبت ایده' : 'Proposal Guide'}
            </h3>
            <ul className="text-[11px] text-bmw-textSec space-y-2.5 list-disc list-inside">
              <li>{isRtl ? 'پیشنهادها باید شفاف، مشخص و دارای ابعاد اجرایی باشند.' : 'Suggestions should be clear and realistic to execute.'}</li>
              <li>{isRtl ? 'ثبت انتقادها باید با رعایت اخلاق حرفه‌ای و ارائه راهکار پیشنهادی همراه باشد.' : 'Critiques should remain constructive and suggest solutions.'}</li>
              <li>{isRtl ? 'در صورت نیاز به بررسی عمیق‌تر، مستندات مرتبط را ضمیمه کنید.' : 'Attach any research, slides, or PDF if deeper analysis is needed.'}</li>
              <li>{isRtl ? 'وضعیت‌های پیشنهادات شما لحظه به لحظه از دپارتمان مربوطه قابل پیگیری است.' : 'Track the review pipeline and manager actions directly in real time.'}</li>
            </ul>
          </div>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-9 space-y-6">
          {activeTab === 'submit' ? (
            /* Submission Form Form */
            <div className="bg-bmw-surface border border-bmw-border rounded-2xl p-6 md:p-8 shadow-sm text-start">
              <div className="border-b border-bmw-border pb-4 mb-6">
                <h2 className="text-lg font-extrabold text-bmw-text">
                  {isRtl ? 'ثبت پیشنهاد یا انتقاد سازنده جدید' : 'Register a New Constructive Idea / Critique'}
                </h2>
                <p className="text-xs text-bmw-textSec mt-1">
                  {isRtl ? 'لطفاً فرم زیر را پر کرده و دپارتمان مربوطه را انتخاب کنید.' : 'Please fill the details below and select the relevant department.'}
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-5">
                {/* Type selection */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setType('suggestion')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-center gap-1.5 cursor-pointer ${
                      type === 'suggestion' 
                        ? 'bg-bmw-blue/10 border-bmw-blue text-bmw-blue' 
                        : 'bg-bmw-base border-bmw-border text-bmw-textSec hover:border-bmw-text/30'
                    }`}
                  >
                    <Lightbulb size={20} />
                    <span className="text-xs font-bold">{isRtl ? 'پیشنهاد و نوآوری' : 'Suggestion & Innovation'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('critic')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-center gap-1.5 cursor-pointer ${
                      type === 'critic' 
                        ? 'bg-amber-600/10 border-amber-600 text-amber-500' 
                        : 'bg-bmw-base border-bmw-border text-bmw-textSec hover:border-bmw-text/30'
                    }`}
                  >
                    <AlertCircle size={20} />
                    <span className="text-xs font-bold">{isRtl ? 'انتقاد سازنده و بهبود' : 'Constructive Criticism'}</span>
                  </button>
                </div>

                {/* Subject Title */}
                <div>
                  <label className="block text-xs font-bold text-bmw-textSec mb-2 uppercase tracking-wider">
                    {isRtl ? 'عنوان موضوع' : 'Subject Title'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={isRtl ? 'مثال: بهینه‌سازی فرآیند ترخیص خودرو' : 'e.g. Speeding up car delivery process'}
                    className="w-full bg-bmw-base border border-bmw-border rounded-xl p-3.5 text-xs text-bmw-text focus:border-bmw-blue focus:outline-none transition-colors"
                  />
                </div>

                {/* Category department selection */}
                <div>
                  <label className="block text-xs font-bold text-bmw-textSec mb-2 uppercase tracking-wider">
                    {isRtl ? 'حوزه و دپارتمان مرتبط' : 'Relevant Area / Department'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-bmw-base border border-bmw-border rounded-xl p-3.5 text-xs text-bmw-text focus:border-bmw-blue focus:outline-none appearance-none cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {isRtl ? cat.fa : cat.en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Detailed Description */}
                <div>
                  <label className="block text-xs font-bold text-bmw-textSec mb-2 uppercase tracking-wider">
                    {isRtl ? 'شرح و جزئیات اجرایی' : 'Description & Operational Details'} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={isRtl ? 'لطفاً جزئیات، مشکلات فعلی و راه‌حل پیشنهادی خود را با دقت شرح دهید...' : 'Describe the background, issue, and proposed solution...'}
                    className="w-full bg-bmw-base border border-bmw-border rounded-xl p-3.5 text-xs text-bmw-text focus:border-bmw-blue focus:outline-none transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* Drag and Drop File Attachment */}
                <div>
                  <label className="block text-xs font-bold text-bmw-textSec mb-2 uppercase tracking-wider">
                    {isRtl ? 'ضمیمه فایل یا سند پشتیبان (اختیاری)' : 'Attachment or Support Document (Optional)'}
                  </label>
                  
                  {!attachment ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2.5 ${
                        dragActive 
                          ? 'border-bmw-blue bg-bmw-blue/10 scale-[0.99]' 
                          : 'border-bmw-border hover:border-bmw-blue/40 bg-bmw-base/50'
                      }`}
                    >
                      <Paperclip className="text-bmw-textSec w-7 h-7" />
                      <div className="space-y-1">
                        <p className="text-xs text-bmw-text font-bold">
                          {isRtl ? 'فایل را به اینجا بکشید یا دکمه زیر را بزنید' : 'Drag file here or select'}
                        </p>
                        <p className="text-[10px] text-bmw-textSec">
                          {isRtl ? 'فرمت‌های مجاز: PDF, Images, Word تا سقف ۵ مگابایت' : 'Supported format: PDF, Images, Word up to 5MB'}
                        </p>
                      </div>
                      <label className="inline-flex items-center px-4 py-2 bg-bmw-hover hover:bg-bmw-base border border-bmw-border text-[11px] font-bold text-bmw-text rounded-lg cursor-pointer transition-colors mt-2">
                        <span>{isRtl ? 'انتخاب فایل' : 'Choose File'}</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="bg-bmw-base border border-bmw-border rounded-xl p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-bmw-blue/10 text-bmw-blue rounded-lg">
                          <FileText size={18} />
                        </div>
                        <div className="text-start">
                          <p className="text-xs font-bold text-bmw-text truncate max-w-[200px] md:max-w-[400px]">
                            {attachment.name}
                          </p>
                          <p className="text-[10px] text-bmw-textSec">
                            {(attachment.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeAttachment}
                        className="p-1.5 rounded-md hover:bg-red-500/10 text-bmw-textSec hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 bg-bmw-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/40 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Send size={15} />
                    <span>{isRtl ? 'ارسال و ثبت نهایی پیشنهاد' : 'Submit Final Proposal'}</span>
                  </button>
                </div>
              </form>

              {/* Custom Success Toast */}
              {showSuccessToast && (
                <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[350px] z-50 bg-emerald-500 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
                  <div className="p-1 bg-white/20 rounded-full shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="text-start">
                    <p className="text-xs font-bold">
                      {isRtl ? 'ثبت موفقیت‌آمیز!' : 'Registered Successfully!'}
                    </p>
                    <p className="text-[10px] opacity-90 mt-0.5">
                      {isRtl ? 'پیشنهاد یا انتقاد شما با موفقیت در سیستم ثبت گردید.' : 'Your proposal/critique is stored in the portal.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Track Status & History Tab */
            <div className="space-y-4">
              {/* Search Control */}
              <div className="bg-bmw-surface border border-bmw-border rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between text-start shadow-sm">
                <div className="flex items-center gap-2">
                  <Search size={16} className="text-bmw-blue shrink-0" />
                  <span className="text-xs font-bold text-bmw-text">
                    {isRtl ? 'جستجو در پیشنهادات و انتقادات:' : 'Search Proposals & Critiques:'}
                  </span>
                </div>

                <div className="relative w-full sm:max-w-md">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isRtl 
                        ? 'بر اساس کد پیگیری، عنوان، متن پیشنهاد، نام همکار و...' 
                        : 'By tracker ID, title, details, staff name...'
                    }
                    className={`w-full bg-bmw-base border border-bmw-border rounded-lg py-2 text-xs text-bmw-text focus:border-bmw-blue focus:outline-none transition-all placeholder:text-bmw-textSec/60 ${
                      isRtl ? 'pl-9 pr-3.5 text-right' : 'pr-9 pl-3.5 text-left'
                    }`}
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className={`absolute top-1/2 -translate-y-1/2 p-1 text-bmw-textSec hover:text-bmw-text rounded-md transition-colors ${
                        isRtl ? 'left-2.5' : 'right-2.5'
                      }`}
                    >
                      <X size={14} />
                    </button>
                  ) : (
                    <Search className={`absolute top-1/2 -translate-y-1/2 text-bmw-textSec/70 w-3.5 h-3.5 pointer-events-none ${
                      isRtl ? 'left-3' : 'right-3'
                    }`} />
                  )}
                </div>
              </div>

              {searchQuery && (
                <div className="flex items-center justify-between text-[11px] text-bmw-textSec px-1">
                  <span>
                    {isRtl 
                      ? `نتایج یافت شده: ${filteredList.length} مورد منطبق بر "${searchQuery}"` 
                      : `Found ${filteredList.length} items matching "${searchQuery}"`}
                  </span>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-bmw-blue hover:underline font-bold text-[11px]"
                  >
                    {isRtl ? 'حذف فیلتر متنی' : 'Clear Search Query'}
                  </button>
                </div>
              )}

              {/* Filter controls */}
              <div className="bg-bmw-surface border border-bmw-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-start shadow-sm">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter size={15} className="text-bmw-blue" />
                    <span className="text-xs font-bold text-bmw-text">
                      {isRtl ? 'فیلتر کردن موارد تاریخچه:' : 'Filter History Items:'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {/* Category Filter */}
                    <div>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-bmw-base border border-bmw-border text-[11px] rounded-lg p-2 text-bmw-text focus:outline-none cursor-pointer"
                      >
                        <option value="all">{isRtl ? 'همه حوزه‌ها' : 'All Areas'}</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{isRtl ? cat.fa : cat.en}</option>
                        ))}
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-bmw-base border border-bmw-border text-[11px] rounded-lg p-2 text-bmw-text focus:outline-none cursor-pointer"
                      >
                        <option value="all">{isRtl ? 'همه وضعیت‌ها' : 'All Statuses'}</option>
                        <option value="submitted">{isRtl ? 'ثبت شده' : 'Submitted'}</option>
                        <option value="under_review">{isRtl ? 'در دست بررسی' : 'Under Review'}</option>
                        <option value="approved">{isRtl ? 'تأیید شده' : 'Approved'}</option>
                        <option value="rejected">{isRtl ? 'رد شده' : 'Rejected'}</option>
                      </select>
                    </div>

                    {/* Type Filter */}
                    <div>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-bmw-base border border-bmw-border text-[11px] rounded-lg p-2 text-bmw-text focus:outline-none cursor-pointer"
                      >
                        <option value="all">{isRtl ? 'همه انواع' : 'All Types'}</option>
                        <option value="suggestion">{isRtl ? 'پیشنهاد' : 'Suggestion'}</option>
                        <option value="critic">{isRtl ? 'انتقاد' : 'Critique'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Manager Export Button */}
                {role === 'manager' && (
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0"
                  >
                    <Download size={14} />
                    <span>{isRtl ? 'خروجی اکسل (با جزئیات)' : 'Export Excel (Detailed)'}</span>
                  </button>
                )}
              </div>

              {/* No items found state */}
              {filteredList.length === 0 && (
                <div className="bg-bmw-surface border border-bmw-border rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2">
                  <span className="text-3xl">📭</span>
                  <p className="text-xs font-bold text-bmw-text mt-2">
                    {isRtl ? 'هیچ پیشنهادی یا انتقادی یافت نشد.' : 'No suggestions or critiques found.'}
                  </p>
                  <p className="text-[10px] text-bmw-textSec">
                    {isRtl ? 'با استفاده از منوی ناوبری سمت چپ می‌توانید اولین پیشنهاد خود را ثبت کنید.' : 'You can submit your first idea using the left navigation.'}
                  </p>
                </div>
              )}

              {/* Feedback list */}
              {filteredList.map((item) => {
                const isExpanded = expandedId === item.id;
                return (
                  <div 
                    key={item.id}
                    className="bg-bmw-surface border border-bmw-border hover:border-bmw-blue/20 rounded-xl overflow-hidden transition-all shadow-sm"
                  >
                    {/* Item Header Banner */}
                    <div 
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-bmw-hover transition-colors text-start"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-mono text-bmw-textSec font-bold tracking-wider">
                            {item.id}
                          </span>
                          <span className="text-[10px] bg-bmw-base border border-bmw-border text-bmw-text px-2 py-0.5 rounded-md font-medium">
                            {getCategoryLabel(item.category)}
                          </span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                            item.type === 'suggestion' 
                              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                              : 'bg-amber-600/10 text-amber-500 border border-amber-600/20'
                          }`}>
                            {item.type === 'suggestion' ? (isRtl ? 'پیشنهاد' : 'Suggestion') : (isRtl ? 'انتقاد سازنده' : 'Critique')}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-bmw-text truncate leading-snug">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-bmw-textSec mt-1">
                          <Calendar size={11} />
                          <span>{formatPersianDate(item.createdAt)}</span>
                          {role === 'manager' && (
                            <>
                              <span className="mx-1">•</span>
                              <span>{isRtl ? `توسط: ${item.userName} (${item.userEmployeeId})` : `By: ${item.userName} (${item.userEmployeeId})`}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 select-none">
                        {getStatusBadge(item.status)}
                        <div>
                          {isExpanded ? <ChevronUp size={16} className="text-bmw-textSec" /> : <ChevronDown size={16} className="text-bmw-textSec" />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable details area */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-bmw-border bg-bmw-base/20 text-start space-y-4">
                        {/* Summary / Detailed text */}
                        <div className="space-y-1.5">
                          <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
                            {isRtl ? 'شرح کامل درخواست:' : 'Complete Description:'}
                          </h4>
                          <p className="text-xs text-bmw-text leading-relaxed whitespace-pre-line font-medium">
                            {item.description}
                          </p>
                        </div>

                        {/* File Attachment */}
                        {item.attachmentName && (
                          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-bmw-surface border border-bmw-border rounded-lg text-xs">
                            <FileText size={14} className="text-bmw-blue" />
                            <span className="font-bold text-bmw-text text-[11px]">
                              {item.attachmentName}
                            </span>
                            <span className="text-[10px] text-bmw-textSec">
                              (PDF / 1.2 MB)
                            </span>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded">
                              ✓ {isRtl ? 'پیوست شد' : 'Attached'}
                            </span>
                          </div>
                        )}

                        {/* Manager Comment Section */}
                        {item.managerComment && (
                          <div className="p-4 bg-bmw-surface border border-bmw-border rounded-xl space-y-2 relative overflow-hidden">
                            <div className="absolute top-0 right-0 h-1 w-20 bg-amber-500" />
                            <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                              <MessageSquare size={13} />
                              <span>{isRtl ? 'پاسخ و نظر مدیریت سرمایه انسانی:' : 'Human Capital Management Response:'}</span>
                            </div>
                            <p className="text-xs text-bmw-text leading-relaxed leading-relaxed whitespace-pre-line font-medium">
                              {item.managerComment}
                            </p>
                          </div>
                        )}

                        {/* Interactive Timeline of States */}
                        <div className="space-y-3 pt-3 border-t border-bmw-border/50">
                          <h4 className="text-[11px] font-bold text-bmw-textSec uppercase tracking-wider flex items-center gap-1.5">
                            <Clock size={13} className="text-bmw-blue" />
                            <span>{isRtl ? 'مراحل و روند تغییر وضعیت (تایم‌لاین):' : 'Status Transition Timeline Log:'}</span>
                          </h4>

                          <div className="relative border-r border-bmw-border/80 mr-2.5 rtl:mr-2.5 ltr:ml-2.5 ltr:border-l space-y-4 pt-1">
                            {item.logs.map((log, lIdx) => {
                              const isLast = lIdx === item.logs.length - 1;
                              const statusStyles = {
                                submitted: 'bg-blue-500 border-blue-500/20 text-blue-500',
                                under_review: 'bg-amber-500 border-amber-500/20 text-amber-500',
                                approved: 'bg-emerald-500 border-emerald-500/20 text-emerald-500',
                                rejected: 'bg-rose-500 border-rose-500/20 text-rose-500'
                              };

                              const faStateName = {
                                submitted: 'ثبت اولیه پیشنهاد',
                                under_review: 'ارجاع به کارشناس ارزیاب و در دست بررسی',
                                approved: 'تأیید نهایی و ارجاع جهت اجرا',
                                rejected: 'بررسی ایده و رد طرح'
                              };

                              const enStateName = {
                                submitted: 'Initial submission registered',
                                under_review: 'Assigned & Under active review',
                                approved: 'Approved & Passed for action',
                                rejected: 'Closed & Rejected'
                              };

                              return (
                                <div key={lIdx} className="relative pr-6 rtl:pr-6 ltr:pl-6 pb-1">
                                  {/* Timeline marker icon/dot */}
                                  <span className={`absolute right-[-6.5px] top-1 rtl:right-[-6.5px] ltr:left-[-6.5px] flex h-3.5 w-3.5 items-center justify-center rounded-full bg-bmw-surface border-2 ${
                                    isLast ? 'border-bmw-blue shadow-lg shadow-blue-500/30' : 'border-bmw-border'
                                  }`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${isLast ? 'bg-bmw-blue animate-ping' : 'bg-bmw-textSec'}`} />
                                  </span>

                                  <div className="bg-bmw-base/50 border border-bmw-border rounded-lg p-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1 text-xs">
                                      <span className="font-extrabold text-bmw-text">
                                        {isRtl ? faStateName[log.status] : enStateName[log.status]}
                                      </span>
                                      <span className="text-[10px] text-bmw-textSec font-mono">
                                        {formatPersianDate(log.date)}
                                      </span>
                                    </div>
                                    {log.comment && (
                                      <p className="text-[11px] text-bmw-textSec font-medium mt-0.5 leading-relaxed">
                                        {log.comment}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Manager Admin Action Trigger Button */}
                        {role === 'manager' && (
                          <div className="pt-4 border-t border-bmw-border/50 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFeedback(item);
                                setNewStatus(item.status);
                                setStatusComment(item.managerComment || '');
                              }}
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <ShieldAlert size={13} />
                              <span>{isRtl ? 'بررسی و تغییر وضعیت درخواست' : 'Review & Adjust Status'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Admin Action Overlay Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setSelectedFeedback(null)} 
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />
          <div 
            className="relative w-full max-w-lg bg-bmw-surface border border-bmw-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-start" 
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-bmw-border p-4 bg-bmw-base/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-600/10 text-amber-500 rounded-lg">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-bmw-text">
                    {isRtl ? 'بررسی پیشنهاد / انتقاد توسط مدیر ارشد' : 'Manager Proposal / Critique Review'}
                  </h3>
                  <p className="text-[10px] text-bmw-textSec mt-0.5">
                    ID: {selectedFeedback.id} • {selectedFeedback.userName}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedFeedback(null)}
                className="p-1 rounded-md text-bmw-textSec hover:bg-bmw-hover hover:text-bmw-text transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleUpdateStatus} className="p-5 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
                  {isRtl ? 'عنوان موضوع پیشنهادی همکار' : 'Employee Suggested Theme'}
                </h4>
                <p className="text-xs text-bmw-text font-bold">
                  {selectedFeedback.title}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
                  {isRtl ? 'شرح کامل ثبت شده' : 'Registered Description'}
                </h4>
                <div className="bg-bmw-base/50 border border-bmw-border/80 rounded-lg p-3 text-xs text-bmw-textSec max-h-[120px] overflow-y-auto custom-scrollbar leading-relaxed">
                  {selectedFeedback.description}
                </div>
              </div>

              {/* Status Radio Choice */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-bmw-text uppercase tracking-wider">
                  {isRtl ? 'تعیین وضعیت نهایی طرح' : 'Approve / Transition Status'}
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewStatus('under_review')}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-bold transition-all ${
                      newStatus === 'under_review'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                        : 'bg-bmw-base border-bmw-border text-bmw-textSec'
                    }`}
                  >
                    <Clock size={14} />
                    <span>{isRtl ? 'در دست بررسی' : 'Under Review'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewStatus('approved')}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-bold transition-all ${
                      newStatus === 'approved'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                        : 'bg-bmw-base border-bmw-border text-bmw-textSec'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    <span>{isRtl ? 'تأیید طرح و اجرا' : 'Approve & Execute'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewStatus('rejected')}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-bold transition-all col-span-2 ${
                      newStatus === 'rejected'
                        ? 'bg-rose-500/10 border-rose-500 text-rose-500'
                        : 'bg-bmw-base border-bmw-border text-bmw-textSec'
                    }`}
                  >
                    <XCircle size={14} />
                    <span>{isRtl ? 'رد طرح / عدم امکان اجرا' : 'Reject Proposal / Impractical'}</span>
                  </button>
                </div>
              </div>

              {/* Status Comment */}
              <div>
                <label className="block text-xs font-bold text-bmw-text mb-2 uppercase tracking-wider">
                  {isRtl ? 'توضیحات و بازخورد مدیریت (کامنت)' : 'Manager Comment & Feedback Notes'}
                </label>
                <textarea
                  rows={4}
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder={isRtl ? 'دلایل تایید/رد طرح یا نحوه پیگیری را در این بخش بنویسید...' : 'Enter feedback reasons or implementation schedule details...'}
                  className="w-full bg-bmw-base border border-bmw-border rounded-xl p-3 text-xs text-bmw-text focus:border-bmw-blue focus:outline-none transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Submit Review action */}
              <div className="flex justify-end gap-3 pt-3 border-t border-bmw-border">
                <button
                  type="button"
                  onClick={() => setSelectedFeedback(null)}
                  className="px-4 py-2 bg-bmw-hover text-bmw-text border border-bmw-border rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  {isRtl ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {isRtl ? 'ثبت و اعمال تغییرات' : 'Submit Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackSystem;

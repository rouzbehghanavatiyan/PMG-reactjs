export interface FeedbackStatusLog {
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  date: string;
  comment?: string;
}

export interface FeedbackItem {
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

export const initialFeedback: FeedbackItem[] = [
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

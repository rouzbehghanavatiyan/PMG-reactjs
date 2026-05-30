import type { NewsItem } from "../utils/masterTypes";

export const allNewsData: Record<string, NewsItem[]> = {
  en: [
    { 
      id: '1', 
      title: 'New BMW X7 Unveiled at Tehran Showroom', 
      summary: 'Experience the new pinnacle of luxury. The X7 is now available for internal viewing.', 
      content: 'We are thrilled to announce that the highly anticipated BMW X7 has officially arrived at our Tehran showroom. This flagship SAV (Sports Activity Vehicle) represents the pinnacle of luxury, performance, and cutting-edge technology. \n\nAll employees are invited to an exclusive internal viewing event this Thursday. Come and experience the spacious interior, premium materials, and state-of-the-art infotainment system firsthand. Refreshments will be provided.',
      date: '2023-10-24', 
      imageUrl: '/assets/news1.png', 
      category: 'Product Launch' 
    },
    { 
      id: '2', 
      title: 'Q4 Performance Review Schedule', 
      summary: 'HR has released the timeline for end-of-year performance assessments. Please check your inbox.', 
      content: 'As we approach the end of the year, the Human Resources department has finalized the schedule for the Q4 Performance Reviews. \n\nSelf-assessments will open on November 1st and must be completed by November 15th. Manager reviews will follow, with final discussions scheduled for early December. Detailed instructions and links to the assessment forms have been sent to your corporate email. Please ensure you meet all deadlines.',
      date: '2023-10-22', 
      imageUrl: '/assets/news2.png', 
      category: 'HR' 
    },
    { 
      id: '3', 
      title: 'Cafeteria Menu Update', 
      summary: 'We have partnered with a new catering service to provide healthier options starting next month.', 
      content: 'Based on your feedback from the recent employee satisfaction survey, we are excited to announce a partnership with a new catering service for our corporate cafeteria. \n\nStarting next month, the menu will feature a wider variety of healthy, organic, and vegetarian options. We will also be introducing a daily salad bar and fresh juice station. The new weekly menus will be available on the Food Order portal soon.',
      date: '2023-10-20', 
      imageUrl: '/assets/news3.png', 
      category: 'Facility' 
    },
    { 
      id: '4', 
      title: 'Annual Company Picnic', 
      summary: 'Join us for a day of fun, food, and team-building activities at the corporate park.', 
      content: 'It is that time of the year again! Our Annual Company Picnic will be held on Friday, November 10th, at the corporate park. \n\nThis is a great opportunity to unwind, connect with colleagues outside the office, and enjoy some delicious food. There will be team-building games, live music, and activities for all ages. Family members are welcome to join. Please RSVP through the internal portal by November 1st.',
      date: '2023-10-15', 
      imageUrl: '/assets/news4.png', 
      category: 'Events' 
    },
    { 
      id: '5', 
      title: 'IT Infrastructure Upgrade', 
      summary: 'Scheduled maintenance will occur this weekend to upgrade our internal servers.', 
      content: 'The IT department will be conducting a major infrastructure upgrade this weekend to improve the speed and reliability of our internal systems. \n\nMaintenance will begin on Friday at 10:00 PM and is expected to conclude by Sunday at 6:00 AM. During this time, access to the ERP, Rahkaran, and internal email may be intermittent. We apologize for any inconvenience and appreciate your patience as we work to enhance our systems.',
      date: '2023-10-10', 
      imageUrl: '/assets/news5.png', 
      category: 'IT' 
    },
    { 
      id: '6', 
      title: 'New Sales Targets Announced', 
      summary: 'The Q4 sales targets have been finalized and distributed to all regional managers.', 
      content: 'The executive team has finalized the sales targets for the fourth quarter. These targets reflect our ambitious growth plans and the introduction of new models to the market. \n\nRegional managers have received the detailed breakdowns and will be holding team meetings this week to discuss strategies and action plans. Let us finish the year strong and achieve our goals together!',
      date: '2023-10-05', 
      imageUrl: '/assets/news6.png', 
      category: 'Sales' 
    },
  ],
  fa: [
    { 
      id: '1', 
      title: 'رونمایی از BMW X7 جدید در شوروم تهران', 
      summary: 'تجربه اوج تجمل. خودروی X7 هم‌اکنون برای بازدید داخلی کارکنان در دسترس است.', 
      content: 'ما با هیجان اعلام می‌کنیم که BMW X7 بسیار مورد انتظار رسماً به شوروم تهران ما رسیده است. این خودروی پرچمدار SAV (خودروی فعالیت ورزشی) نشان‌دهنده اوج تجمل، عملکرد و فناوری پیشرفته است.\n\nاز تمامی کارکنان دعوت می‌شود تا در یک رویداد بازدید داخلی اختصاصی در این پنجشنبه شرکت کنند. بیایید و فضای داخلی جادار، مواد درجه یک و سیستم سرگرمی پیشرفته را از نزدیک تجربه کنید. پذیرایی نیز انجام خواهد شد.',
      date: '۱۴۰۲/۰۸/۰۲', 
      imageUrl: '/assets/news1.png', 
      category: 'معرفی محصول' 
    },
    { 
      id: '2', 
      title: 'زمان‌بندی ارزیابی عملکرد سه ماهه چهارم', 
      summary: 'واحد منابع انسانی جدول زمانی ارزیابی‌های پایان سال را منتشر کرد. لطفاً ایمیل خود را چک کنید.', 
      content: 'با نزدیک شدن به پایان سال، واحد منابع انسانی جدول زمانی ارزیابی‌های عملکرد سه ماهه چهارم را نهایی کرده است.\n\nخودارزیابی‌ها از اول آبان آغاز شده و باید تا پانزدهم آبان تکمیل شوند. بررسی‌های مدیران پس از آن انجام می‌شود و بحث‌های نهایی برای اوایل آذر برنامه‌ریزی شده است. دستورالعمل‌های دقیق و لینک‌های فرم‌های ارزیابی به ایمیل سازمانی شما ارسال شده است. لطفاً اطمینان حاصل کنید که تمام مهلت‌ها را رعایت می‌کنید.',
      date: '۱۴۰۲/۰۷/۳۰', 
      imageUrl: '/assets/news2.png', 
      category: 'منابع انسانی' 
    },
    { 
      id: '3', 
      title: 'به‌روزرسانی منوی رستوران', 
      summary: 'ما با یک پیمانکار جدید برای ارائه گزینه‌های غذایی سالم‌تر از ماه آینده قرارداد بسته‌ایم.', 
      content: 'بر اساس بازخوردهای شما در نظرسنجی اخیر رضایت کارکنان، ما با خوشحالی اعلام می‌کنیم که با یک پیمانکار جدید برای رستوران شرکت قرارداد بسته‌ایم.\n\nاز ماه آینده، منو شامل تنوع بیشتری از گزینه‌های سالم، ارگانیک و گیاهی خواهد بود. ما همچنین یک سالاد بار روزانه و ایستگاه آبمیوه تازه معرفی خواهیم کرد. منوهای هفتگی جدید به زودی در پرتال سفارش غذا در دسترس خواهند بود.',
      date: '۱۴۰۲/۰۷/۲۸', 
      imageUrl: '/assets/news3.png', 
      category: 'امکانات' 
    },
    { 
      id: '4', 
      title: 'پیک‌نیک سالانه شرکت', 
      summary: 'برای یک روز پر از سرگرمی، غذا و فعالیت‌های تیم‌سازی در پارک شرکتی به ما بپیوندید.', 
      content: 'دوباره آن زمان از سال فرا رسیده است! پیک‌نیک سالانه شرکت ما در روز جمعه، ۱۹ آبان در پارک شرکتی برگزار خواهد شد.\n\nاین یک فرصت عالی برای استراحت، ارتباط با همکاران در خارج از دفتر و لذت بردن از غذاهای خوشمزه است. بازی‌های تیم‌سازی، موسیقی زنده و فعالیت‌هایی برای تمام سنین وجود خواهد داشت. اعضای خانواده نیز می‌توانند شرکت کنند. لطفاً تا اول آبان از طریق پرتال داخلی حضور خود را اعلام کنید.',
      date: '۱۴۰۲/۰۷/۲۳', 
      imageUrl: '/assets/news4.png', 
      category: 'رویدادها' 
    },
    { 
      id: '5', 
      title: 'ارتقاء زیرساخت فناوری اطلاعات', 
      summary: 'تعمیر و نگهداری برنامه‌ریزی شده در این آخر هفته برای ارتقاء سرورهای داخلی انجام خواهد شد.', 
      content: 'بخش فناوری اطلاعات در این آخر هفته یک ارتقاء زیرساخت عمده را برای بهبود سرعت و قابلیت اطمینان سیستم‌های داخلی ما انجام خواهد داد.\n\nتعمیر و نگهداری از ساعت ۲۲:۰۰ روز جمعه آغاز می‌شود و انتظار می‌رود تا ساعت ۰۶:۰۰ روز یکشنبه به پایان برسد. در این مدت، دسترسی به ERP، راهکاران و ایمیل داخلی ممکن است با قطعی همراه باشد. ما از هرگونه ناراحتی پیش آمده عذرخواهی می‌کنیم و از صبر شما در حالی که برای بهبود سیستم‌هایمان تلاش می‌کنیم، سپاسگزاریم.',
      date: '۱۴۰۲/۰۷/۱۸', 
      imageUrl: '/assets/news5.png', 
      category: 'فناوری اطلاعات' 
    },
    { 
      id: '6', 
      title: 'اعلام اهداف فروش جدید', 
      summary: 'اهداف فروش سه ماهه چهارم نهایی شده و به تمام مدیران منطقه‌ای ابلاغ گردید.', 
      content: 'تیم اجرایی اهداف فروش را برای سه ماهه چهارم نهایی کرده است. این اهداف نشان‌دهنده برنامه‌های رشد جاه‌طلبانه ما و معرفی مدل‌های جدید به بازار است.\n\nمدیران منطقه‌ای جزئیات دقیق را دریافت کرده‌اند و در این هفته جلسات تیمی را برای بحث در مورد استراتژی‌ها و برنامه‌های عملیاتی برگزار خواهند کرد. بیایید سال را با قدرت به پایان برسانیم و با هم به اهداف خود برسیم!',
      date: '۱۴۰۲/۰۷/۱۳', 
      imageUrl: '/assets/news6.png', 
      category: 'فروش' 
    },
  ]
};

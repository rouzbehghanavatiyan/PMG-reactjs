import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "fa";
type Direction = "ltr" | "rtl";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: Direction;
}

const translations: Record<Language, Record<string, any>> = {
  en: {
    // Sidebar
    dashboard: "Dashboard",
    introductionOrganization: "IntroductionOrganization",
    profile: "Profile",
    payslips: "Payslips",
    documents: "Documents",
    food_order: "Food Order",
    calendar: "Calendar",
    support: "Support",
    surveys: "Surveys",
    settings: "Settings",
    sign_out: "Sign Out",
    // Login
    employee_id: "Employee ID",
    password: "Password",
    sign_in: "Sign In",
    auth_only: "Authorized Personnel Only",
    login_subtitle: "Employee Secure Access",
    // Dashboard
    welcome: "Welcome",
    welcome_sub: "Here is what's happening at Persia Khodro today.",
    latest_news: "Latest News",
    view_all: "View All",
    read_more: "Read More",
    notifications: "Notifications",
    born_in_month: "Born in the month",
    corporate_links: "Corporate Links",
    quick_actions: {
      food: "Food Order",
      food_desc: "Reserve lunch",
      it: "IT Support",
      it_desc: "Submit ticket",
      ricoh: "PersiaQuest",
      ricoh_desc: "Appreciation System",
      surveys: "Surveys",
      surveys_desc: "Voice your opinion",
    },
    // Documents
    docs_title: "Documents Center",
    docs_sub: "Access organizational policies, forms, and contracts.",
    upload_pdf: "Upload PDF",
    search_docs: "Search documents...",
    filters: {
      all: "All",
      policy: "Policy",
      contract: "Contract",
      form: "Form",
      other: "Other",
    },
    table: {
      name: "Name",
      category: "Category",
      date: "Date",
      size: "Size",
      actions: "Actions",
    },
    // Payslips
    salary_title: "My Salary & Payslips",
    salary_sub: "Integrated with Rahkaran System",
    password_protected: "Password Protected",
    income_overview: "Income Overview (Last 6 Months)",
    last_net_salary: "Last Net Salary",
    base_salary: "Base Salary",
    overtime_bonus: "Overtime & Bonus",
    deductions: "Deductions",
    history_title: "Payslip History",
    view_history: "View All History",
    processed_via: "Processed via Rahkaran",
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    // Calendar
    calendar_title: "Company Calendar",
    calendar_sub: "Track holidays, events, and your leave schedule.",
    event_types: {
      company: "Company Event",
      national_holiday: "National Holiday",
      company_holiday: "Company Holiday",
      leave: "Personal Leave",
      task: "Personal Task",
    },
    add_task: "Add Task",
    task_title: "Task Title",
    save_task: "Save Task",
    upcoming_events: "Upcoming Events",
    no_events_month: "No events scheduled for this month.",
    weekdays_short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    // Profile
    edit_profile: "Edit Profile",
    contact_info: "Contact Information",
    employment_details: "Employment Details",
    job_desc: "Job Description",
    org_chart: "Organization Chart",
    senior_manager: "Senior Sales Manager",
    vp_sales: "VP of Sales",
    sales_exec: "Sales Executive",
    active: "Active",
    dept: "Department",
    joined: "Joined Date",
    // Food Order (Phase 2)
    food_title: "Weekly Meal Reservation",
    food_sub: "Select your preferred meals for the upcoming week.",
    week_start: "Week starting October 28",
    submit_order: "Register Orders",
    order_success: "Orders successfully registered!",
    menu_a: "Main Menu",
    menu_b: "Diet Menu",
    no_food: "No Lunch",
    calories: "cal",
    days: {
      sat: "Saturday",
      sun: "Sunday",
      mon: "Monday",
      tue: "Tuesday",
      wed: "Wednesday",
    },
    meals: {
      kebab: "Chelo Kubideh Kebab",
      chicken: "Grilled Chicken Breast",
      stew: "Ghormeh Sabzi Stew",
      fish: "Fried Trout Fish",
      pasta: "Beef Pasta",
      salad: "Caesar Salad",
      veggie: "Steamed Vegetables",
      diet_chicken: "Boiled Chicken",
    },
    // Support (Phase 3)
    support_title: "Support & Ticketing",
    support_sub: "Submit technical, facility, or HR requests.",
    new_ticket: "Create New Ticket",
    recent_tickets: "Recent Tickets",
    ticket_subject: "Subject",
    ticket_category: "Category",
    ticket_priority: "Priority",
    ticket_desc: "Description",
    submit_request: "Submit Request",
    cancel: "Cancel",
    ticket_id: "Ticket ID",
    last_update: "Last Update",
    categories: {
      it: "IT & Network",
      hr: "Human Resources",
      facility: "Facility & Maintenance",
      general: "General Inquiry",
    },
    priorities: {
      high: "High",
      medium: "Medium",
      low: "Low",
    },
    statuses: {
      open: "Open",
      progress: "In Progress",
      closed: "Closed",
    },
    // Surveys (Phase 4)
    surveys_title: "Surveys & Feedback",
    surveys_sub: "Help us improve Persia Khodro by sharing your thoughts.",
    active_surveys: "Active Surveys",
    survey_history: "Survey History",
    start_survey: "Start Survey",
    completed: "Completed",
    points: "Points",
    questions_count: "Questions",
    submit_feedback: "Submit Feedback",
    thank_you: "Thank you!",
    survey_completed_msg: "Your feedback has been recorded successfully.",
    survey_time: "Est. Time",
    minutes: "min",
    // Help & FAQ
    help_faq: "Help & FAQ",
    help_sub:
      "Find answers to common questions and learn how to use the portal.",
    search_help: "Search for help...",
    frequently_asked: "Frequently Asked Questions",
    no_results_found: "No results found for your search.",
    quick_guides: "Quick Guides",
    guide_payslip: "How to view and download payslips",
    guide_food: "How to order weekly meals",
    guide_ticket: "How to submit a support ticket",
    still_need_help: "Still need help?",
    contact_support_desc:
      "If you cannot find the answer you are looking for, please contact our support team.",
    contact_support: "Contact Support",
    faq_q1: "How do I reset my password?",
    faq_a1:
      'To reset your password, please contact the IT department or use the "Forgot Password" link on the login page if available.',
    faq_q2: "Where can I find my employment contract?",
    faq_a2:
      'You can find your employment contract and other HR documents in the "Documents Center" under the "Contract" filter.',
    faq_q3: "How do I connect to the company VPN?",
    faq_a3:
      "Please submit an IT Support ticket requesting VPN access. Once approved, you will receive an email with instructions and credentials.",
    faq_q4: "What is the deadline for ordering food?",
    faq_a4:
      "Food orders for the upcoming week must be submitted by Wednesday at 2:00 PM.",
    faq_q5: "How do I request annual leave?",
    faq_a5:
      "Annual leave requests should be submitted through the Rahkaran system. You can view your approved leaves in the Company Calendar.",
    // ERP
    erp_title: "Organization ERP",
    erp_sub: "Access all internal systems and portals.",
    erp_systems: {
      bi: "BI System",
      employee_services: "Employee Electronic Services",
      meetings: "Meeting Minutes System",
      tasks: "Task & Project Management",
      rahkaran: "Rahkaran System",
      training: "Training System",
      seven_pro_pk: "Seven Pro Persia Khodro",
      seven_pro_mk: "Seven Pro Manian Khodro",
      food_menu: "Food Menu",
      documents: "Persia Khodro Documents",
      dealers: "Dealer Network Communication",
    },
    // News Page
    news_page_title: "Company News",
    news_page_sub: "Stay updated with the latest announcements and events.",
    search_news: "Search news...",
    back_to_news: "Back to News",
  },
  fa: {
    // Sidebar
    introductionOrganization: "معرفی سازمان",
    dashboard: "داشبورد",
    profile: "پروفایل",
    payslips: "فیش حقوقی",
    documents: "اسناد و مدارک",
    food_order: "رزرو غذا",
    calendar: "تقویم سازمانی",
    support: "پشتیبانی",
    surveys: "نظرسنجی",
    settings: "تنظیمات",
    sign_out: "خروج",
    // Login
    employee_id: "کدپرسنلی",
    password: "رمز عبور",
    sign_in: "ورود",
    auth_only: "فقط پرسنل مجاز",
    login_subtitle: "دسترسی امن کارکنان",
    // Dashboard
    welcome: "خوش آمدید",
    welcome_sub: "اخبار و رویدادهای امروز پرشیا خودرو.",
    latest_news: "آخرین اخبار",
    view_all: "مشاهده همه",
    read_more: "بیشتر بخوانید",
    notifications: "اعلانات",
    born_in_month: "متولدین ماه",
    corporate_links: "لینک‌های سازمانی",
    quick_actions: {
      food: "رزرو غذا",
      food_desc: "ناهار خود را رزرو کنید",
      it: "پشتیبانی IT",
      it_desc: "ثبت تیکت",
      ricoh: "سیستم قدردانی پرشیاکوئست",
      ricoh_desc: "سامانه پاداش و امتیازدهی",
      surveys: "نظرسنجی",
      surveys_desc: "نظر خود را ثبت کنید",
    },
    // Documents
    docs_title: "مرکز اسناد",
    docs_sub: "دسترسی به بخشنامه‌ها، فرم‌ها و قراردادها.",
    upload_pdf: "آپلود PDF",
    search_docs: "جستجوی اسناد...",
    filters: {
      all: "همه",
      policy: "بخشنامه",
      contract: "قرارداد",
      form: "فرم",
      other: "سایر",
    },
    table: {
      name: "نام فایل",
      category: "دسته‌بندی",
      date: "تاریخ",
      size: "حجم",
      actions: "عملیات",
    },
    // Payslips
    salary_title: "حقوق و دستمزد",
    salary_sub: "یکپارچه با سیستم راهکاران",
    password_protected: "محافظت شده",
    income_overview: "نمودار درآمد (۶ ماه گذشته)",
    last_net_salary: "آخرین دریافتی",
    base_salary: "حقوق پایه",
    // overtime_bonus: "اضافه کار و پاداش",
    overtime_bonus: "جمع مزایا",
    deductions: "کسورات",
    history_title: "تاریخچه فیش‌ها",
    view_history: "مشاهده همه",
    processed_via: "پردازش شده توسط راهکاران",
    months: ["دی", "بهمن", "اسفند", "فروردین", "اردیبهشت", "خرداد"],
    // Calendar
    calendar_title: "تقویم سازمانی",
    calendar_sub: "مشاهده تعطیلات، رویدادها و مرخصی‌ها.",
    event_types: {
      company: "رویداد شرکت",
      national_holiday: "تعطیل رسمی",
      company_holiday: "تعطیلات شرکتی",
      leave: "مرخصی شخصی",
      task: "کار شخصی",
    },
    add_task: "افزودن کار",
    task_title: "عنوان کار",
    save_task: "ذخیره کار",
    upcoming_events: "رویدادهای پیش‌رو",
    no_events_month: "رویدادی برای این ماه ثبت نشده است.",
    weekdays_short: ["۱ش", "۲ش", "۳ش", "۴ش", "۵ش", "ج", "ش"],
    // Profile
    edit_profile: "ویرایش پروفایل",
    contact_info: "اطلاعات تماس",
    employment_details: "اطلاعات شغلی",
    job_desc: "شرح وظایف",
    org_chart: "چارت سازمانی",
    senior_manager: "مدیر ارشد فروش",
    vp_sales: "معاونت فروش",
    sales_exec: "کارشناس فروش",
    active: "فعال",
    dept: "واحد سازمانی",
    joined: "تاریخ استخدام",
    // Food Order (Phase 2)
    food_title: "رزرو هفتگی غذا",
    food_sub: "انتخاب برنامه غذایی برای هفته آینده.",
    week_start: "هفته منتهی به ۱۰ آبان",
    submit_order: "ثبت سفارشات",
    order_success: "سفارشات با موفقیت ثبت شد!",
    menu_a: "منوی الف (اصلی)",
    menu_b: "منوی ب (رژیمی)",
    no_food: "بدون غذا",
    calories: "کالری",
    days: {
      sat: "شنبه",
      sun: "یک‌شنبه",
      mon: "دوشنبه",
      tue: "سه‌شنبه",
      wed: "چهارشنبه",
    },
    meals: {
      kebab: "چلو کباب کوبیده زعفرانی",
      chicken: "چلو جوجه کباب مخصوص",
      stew: "خورشت قورمه‌سبزی با پلو",
      fish: "خوراک ماهی قزل‌آلا",
      pasta: "پاستا بیف آلفردو",
      salad: "سالاد سزار با مرغ گریل",
      veggie: "بشقاب سبزیجات بخارپز",
      diet_chicken: "خوراک مرغ آب‌پز و قارچ",
    },
    // Support (Phase 3)
    support_title: "پشتیبانی و تیکتینگ",
    support_sub: "ثبت درخواست‌های فنی، تأسیسات یا منابع انسانی.",
    new_ticket: "ثبت تیکت جدید",
    recent_tickets: "تیکت‌های اخیر",
    ticket_subject: "موضوع",
    ticket_category: "دسته‌بندی",
    ticket_priority: "اولویت",
    ticket_desc: "توضیحات",
    submit_request: "ارسال درخواست",
    cancel: "انصراف",
    ticket_id: "شماره تیکت",
    last_update: "آخرین بروزرسانی",
    categories: {
      it: "فناوری اطلاعات و شبکه",
      hr: "منابع انسانی",
      facility: "تأسیسات و نگهداری",
      general: "عمومی",
    },
    priorities: {
      high: "بالا",
      medium: "متوسط",
      low: "پایین",
    },
    statuses: {
      open: "باز",
      progress: "در حال بررسی",
      closed: "بسته شده",
    },
    // Surveys (Phase 4)
    surveys_title: "نظرسنجی و بازخورد",
    surveys_sub:
      "با به اشتراک گذاشتن نظرات خود به ما در بهبود پرشیا خودرو کمک کنید.",
    active_surveys: "نظرسنجی‌های فعال",
    survey_history: "تاریخچه",
    start_survey: "شروع نظرسنجی",
    completed: "تکمیل شده",
    points: "امتیاز",
    questions_count: "سوال",
    submit_feedback: "ثبت بازخورد",
    thank_you: "سپاسگزاریم!",
    survey_completed_msg: "بازخورد شما با موفقیت ثبت شد.",
    survey_time: "زمان تقریبی",
    minutes: "دقیقه",
    // Help & FAQ
    help_faq: "راهنما و سوالات متداول",
    help_sub:
      "پاسخ سوالات رایج را بیابید و نحوه استفاده از پورتال را بیاموزید.",
    search_help: "جستجو در راهنما...",
    frequently_asked: "سوالات متداول",
    no_results_found: "نتیجه‌ای برای جستجوی شما یافت نشد.",
    quick_guides: "راهنماهای سریع",
    guide_payslip: "نحوه مشاهده و دانلود فیش حقوقی",
    guide_food: "نحوه سفارش غذای هفتگی",
    guide_ticket: "نحوه ثبت تیکت پشتیبانی",
    still_need_help: "هنوز نیاز به کمک دارید؟",
    contact_support_desc:
      "اگر پاسخ سوال خود را پیدا نکردید، لطفاً با تیم پشتیبانی ما تماس بگیرید.",
    contact_support: "تماس با پشتیبانی",
    faq_q1: "چگونه رمز عبور خود را تغییر دهم؟",
    faq_a1:
      'برای تغییر رمز عبور، لطفاً با بخش IT تماس بگیرید یا در صورت وجود از لینک "فراموشی رمز عبور" در صفحه ورود استفاده کنید.',
    faq_q2: "قرارداد استخدامی خود را کجا می‌توانم پیدا کنم؟",
    faq_a2:
      'شما می‌توانید قرارداد استخدامی و سایر مدارک منابع انسانی خود را در "مرکز اسناد" تحت فیلتر "قرارداد" پیدا کنید.',
    faq_q3: "چگونه به VPN شرکت متصل شوم؟",
    faq_a3:
      "لطفاً یک تیکت پشتیبانی IT برای درخواست دسترسی به VPN ثبت کنید. پس از تایید، ایمیلی حاوی دستورالعمل‌ها و اطلاعات ورود دریافت خواهید کرد.",
    faq_q4: "مهلت سفارش غذا تا چه زمانی است؟",
    faq_a4: "سفارشات غذای هفته آینده باید تا روز چهارشنبه ساعت ۱۴:۰۰ ثبت شوند.",
    faq_q5: "چگونه مرخصی سالانه درخواست کنم؟",
    faq_a5:
      "درخواست‌های مرخصی سالانه باید از طریق سیستم راهکاران ثبت شوند. می‌توانید مرخصی‌های تایید شده خود را در تقویم سازمانی مشاهده کنید.",
    // ERP
    erp_title: "سامانه‌های سازمانی",
    erp_sub: "دسترسی به تمامی سیستم‌ها و پرتال‌های داخلی.",
    erp_systems: {
      bi: "سامانه BI",
      employee_services: "خدمات الکترونیک پرسنل",
      meetings: "سامانه صورتجلسات",
      tasks: "مدیریت وظایف و پروژه‌ها",
      rahkaran: "راهکاران سیستم",
      training: "سامانه آموزش",
      seven_pro_pk: "سون پرو پرشیا خودرو",
      seven_pro_mk: "سون پرو مانیان خودرو",
      food_menu: "منوی غذا",
      documents: "مدارک و مستندات پرشیا خودرو",
      dealers: "سامانه ارتباط با شبکه نمایندگان",
    },
    // News Page
    news_page_title: "اخبار شرکت",
    news_page_sub: "از آخرین اطلاعیه‌ها و رویدادها مطلع شوید.",
    search_news: "جستجوی اخبار...",
    back_to_news: "بازگشت به اخبار",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("fa");

  const dir = language === "fa" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    // Set font based on language
    if (language === "fa") {
      document.body.style.fontFamily = "Vazirmatn, sans-serif";
    } else {
      document.body.style.fontFamily = "Inter, sans-serif";
    }
  }, [language, dir]);

  const t = (key: string): any => {
    const keys = key.split(".");
    let value: any = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

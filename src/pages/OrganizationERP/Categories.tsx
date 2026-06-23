type PortalItem = {
  title: string;
  href: string;
  icon: string;
};

type PortalCategory = {
  title: string;
  icon: string;
  items: PortalItem[];
};

export const categories: PortalCategory[] = [
  {
    title: "فروش خودرو",
    icon: "ti text-bmw-blue font-mono font22 ti-car ",
    items: [
      {
        title: "فروش خودروی پرشیا خودرو",
        href: "http://172.16.10.22/",
        icon: "ti text-bmw-blue font-mono font22 ti-file-text",
      },
      {
        title: "فروش واسطه‌گری پرشیاخودرو",
        href: "http://172.16.10.22/",
        icon: "ti text-bmw-blue font-mono font22 ti-users",
      },
      {
        title: "فروش آنلاین پرشیا خودرو",
        href: "https://sales.persiakhodro.ir/",
        icon: "ti text-bmw-blue font-mono font22 ti-world",
      },
      {
        title: "انبار خودرویی و تحویل پرشیاخودرو",
        href: "http://172.16.10.22/",
        icon: "ti text-bmw-blue font-mono font22 ti-box",
      },
      {
        title: "فروش خودروی مانیان خودرو",
        href: "http://172.16.10.39/",
        icon: "ti text-bmw-blue font-mono font22 ti-file-text",
      },
      {
        title: "فروش واسطه‌گری مانیان خودرو",
        href: "http://172.16.10.39/",
        icon: "ti text-bmw-blue font-mono font22 ti-users",
      },
      {
        title: "فروش آنلاین مانیان خودرو",
        href: "https://sales.maaniankhodro.com",
        icon: "ti text-bmw-blue font-mono font22 ti-world",
      },
      {
        title: "انبار خودرویی و تحویل مانیان خودرو",
        href: "http://172.16.10.39/",
        icon: "ti text-bmw-blue font-mono font22 ti-box",
      },
    ],
  },
  {
    title: "خدمات پس از فروش",
    icon: "ti text-bmw-blue font-mono font22 ti-tool",
    items: [
      {
        title: "پذیرش تا ترخیص پرشیاخودرو",
        href: "http://172.16.10.22/",
        icon: "ti text-bmw-blue font-mono font22 ti-clipboard-list",
      },
      {
        title: "سامانه نوبت‌دهی",
        href: "http://172.16.10.22/",
        icon: "ti text-bmw-blue font-mono font22 ti-calendar",
      },
      {
        title: "فروش خدمات ویژه",
        href: "http://172.16.10.22/",
        icon: "ti text-bmw-blue font-mono font22 ti-star",
      },
      {
        title: "گارانتی - کلیم - PDI",
        href: "http://172.16.10.22/",
        icon: "ti text-bmw-blue font-mono font22 ti-shield",
      },
      {
        title: "ظرفیت‌سنجی و برنامه‌ریزی تعمیرات",
        href: "http://172.16.10.22/",
        icon: "ti text-bmw-blue font-mono font22 ti-clock",
      },
    ],
  },
  {
    title: "انبار کالا",
    icon: "ti text-bmw-blue font-mono font22 ti-package",
    items: [
      {
        title: "سفارش و درخواست کالا",
        href: "http://172.16.10.22/",
        icon: "ti text-bmw-blue font-mono font22 ti-file-plus",
      },
      {
        title: "فروش کالا به مشتری و نمایندگان",
        href: "http://172.16.10.22/",
        icon: "ti text-bmw-blue font-mono font22 ti-users",
      },
      {
        title: "بسته‌بندی و ارسال کالا",
        href: "http://172.16.10.22/",
        icon: "ti text-bmw-blue font-mono font22 ti-truck",
      },
      {
        title: "انبارگردانی",
        href: "http://172.16.10.22/",
        icon: "ti text-bmw-blue font-mono font22 ti-check",
      },
      {
        title: "کنترل موجودی",
        href: "http://172.16.10.22/",
        icon: "ti text-bmw-blue  ti-stack-2font-mono font22",
      },
      {
        title: "مدیریت قیمت‌گذاری کالا",
        href: "http://172.16.10.22/",
        icon: "ti text-bmw-blue font-mono font22 ti-tag",
      },
    ],
  },
  {
    title: "بازرگانی کالا و خودرو",
    icon: "ti text-bmw-blue font-mono font22 ti-world",
    items: [
      {
        title: "برنامه‌ریزی خرید",
        href: "http://172.16.10.22/",
        icon: "ti text-bmw-blue font-mono font22 ti-calendar",
      },
      {
        title: "استعلام خرید",
        href: "http://172.16.10.22/",
        icon: "ti text-bmw-blue font-mono font22 ti-search",
      },
      {
        title: "سفارش خرید",
        href: "http://172.16.10.22/",
        icon: "ti text-bmw-blue font-mono font22 ti-shopping-cart",
      },
      {
        title: "بسته‌بندی - حمل - بارنامه",
        href: "http://172.16.10.22/",
        icon: "ti text-bmw-blue font-mono font22 ti-truck",
      },
    ],
  },
  {
    title: "مالی، اداری و پشتیبانی",
    icon: "ti text-bmw-blue font-mono font22 ti-cash",
    items: [
      {
        title: "دریافت و پرداخت",
        href: "http://172.16.10.43/persiakhodro/",
        icon: "ti text-bmw-blue font-mono font22 ti-credit-card",
      },
      {
        title: "صندوق و خزانه‌داری",
        href: "http://172.16.10.43/persiakhodro/",
        icon: "ti text-bmw-blue font-mono font22 ti-lock",
      },
      {
        title: "دفتر کل و حسابداری",
        href: "http://172.16.10.43/persiakhodro/",
        icon: "ti text-bmw-blue font-mono font22 ti-book",
      },
      {
        title: "دارایی‌های ثابت",
        href: "http://172.16.10.43/persiakhodro/",
        icon: " text-bmw-blue font-mono font22 ti ti-stack-2",
      },
      {
        title: "حسابداری مالیاتی",
        href: "http://172.16.10.43/persiakhodro/",
        icon: "ti text-bmw-blue font-mono font22 ti-file-text",
      },
      {
        title: "مدیریت وصول مطالبات",
        href: "http://172.16.10.43/persiakhodro/",
        icon: "ti text-bmw-blue font-mono font22 ti-activity",
      },
      {
        title: "تسهیلات مالی",
        href: "http://172.16.10.43/persiakhodro/",
        icon: "ti text-bmw-blue font-mono font22 ti-currency-dollar",
      },
      {
        title: "بودجه‌ریزی",
        href: "http://172.16.10.43/persiakhodro/",
        icon: "ti text-bmw-blue font-mono font22 ti-chart-bar",
      },
      {
        title: "سرمایه‌های انسانی و کارگزینی",
        href: "http://172.16.10.43/persiakhodro/",
        icon: "ti text-bmw-blue font-mono font22 ti-users",
      },
      {
        title: "جبران خدمات (حقوق دستمزد)",
        href: "http://172.16.10.43/persiakhodro/",
        icon: "ti text-bmw-blue font-mono font22 ti-briefcase",
      },
      {
        title: "خدمات الکترونیک پرسنل",
        href: "http://172.16.10.43/EPersonalServiceFanoos",
        icon: "ti text-bmw-blue font-mono font22 ti-user",
      },
      {
        title: "تدارکات و لجستیک",
        href: "http://172.16.10.43/persiakhodro/",
        icon: "ti text-bmw-blue font-mono font22 ti-truck",
      },
      {
        title: "مکاتبات سازمانی",
        href: "http://172.16.10.43/EPersonalServiceFanoos",
        icon: "ti text-bmw-blue font-mono font22 ti-mail",
      },
      {
        title: "فرم‌های سفارشی سازمان",
        href: "http://172.16.10.43/persiakhodro/",
        icon: "ti text-bmw-blue font-mono font22 ti-file",
      },
    ],
  },
  {
    title: "هوش تجاری BI",
    icon: "ti text-bmw-blue font-mono font22 ti-chart-pie",
    items: [
      {
        title: "داشبوردهای فروش شبکه نمایندگان",
        href: "http://172.16.10.20/BIReports/browse/%DA%AF%D8%B2%D8%A7%D8%B1%D8%B4%20%D9%81%D8%B1%D9%88%D8%B4%20%D8%B4%D8%A8%DA%A9%D9%87",
        icon: "ti text-bmw-blue font-mono font22 ti-chart-bar",
      },
      {
        title: "داشبوردهای منابع انسانی",
        href: "http://172.16.10.20/BIReports/powerbi/BI-ServenPro-Rahkaran/EmployeeCount",
        icon: "ti text-bmw-blue font-mono font22 ti-users",
      },
      {
        title: "داشبوردهای مالی",
        href: "http://172.16.10.20/BIReports/powerbi/BI-ServenPro-Rahkaran/Financial",
        icon: "ti text-bmw-blue font-mono font22 ti-currency-dollar",
      },
      {
        title: "داشبوردهای بودجه و عملکرد",
        href: "http://172.16.10.20/BIReports/powerbi/BI-ServenPro-Rahkaran/Financial_Budget",
        icon: "ti text-bmw-blue font-mono font22 ti-activity",
      },
      {
        title: "داشبورد فروش خودرو",
        href: "http://172.16.10.20/BIReports/powerbi/%D9%81%D8%B1%D9%88%D8%B4%20%D8%AE%D9%88%D8%AF%D8%B1%D9%88%20%DB%B1",
        icon: "ti text-bmw-blue font-mono font22 ti-car",
      },
      {
        title: "داشبورد فروش خدمات",
        href: "http://172.16.10.20/BIReports/powerbi/%D9%81%D8%B1%D9%88%D8%B4%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%DB%B1",
        icon: "ti text-bmw-blue font-mono font22 ti-heart-rate-monitor",
      },
      {
        title: "داشبورد فروش کالا",
        href: "http://172.16.10.20/BIReports/powerbi/%D9%81%D8%B1%D9%88%D8%B4%20%D9%82%D8%B7%D8%B9%D8%A7%D8%AA%20%DB%B2",
        icon: "ti text-bmw-blue font-mono font22 ti-tag",
      },
      {
        title: "داشبورد تأمین خودرو",
        href: "http://172.16.10.20/BIReports/powerbi/%D8%AA%D8%A3%D9%85%DB%8C%D9%86%20%D8%AE%D9%88%D8%AF%D8%B1%D9%88%20%DB%B1",
        icon: "ti text-bmw-blue font-mono font22 ti-truck",
      },
      {
        title: "داشبورد فروش گارانتی",
        href: "http://172.16.10.20/BIReports/powerbi/%D9%81%D8%B1%D9%88%D8%B4%20%DA%AF%D8%A7%D8%B1%D8%A7%D9%86%D8%AA%DB%8C",
        icon: "ti text-bmw-blue font-mono font22 ti-shield",
      },
      {
        title: "داشبورد تحلیل روند انبارها",
        href: "http://172.16.10.20/BIReports/powerbi/%DA%AF%D8%B2%D8%A7%D8%B1%D8%B4%20%D8%B1%D9%88%D9%86%D8%AF%20%D8%B1%DB%8C%D8%A7%D9%84%DB%8C-%D8%AA%D8%B9%D8%AF%D8%A7%D8%AF%DB%8C%20%D8%A7%D9%86%D8%A8%D8%A7%D8%B1%D9%87%D8%A7%DB%8C%20%D9%82%D8%B7%D8%B9%D8%A7%D8%AA",
        icon: "ti text-bmw-blue font-mono font22 ti-trending-up",
      },
      {
        title: "داشبورد گزارشات جامع",
        href: "http://172.16.10.20/BIReports/powerbi/%DA%AF%D8%B2%D8%A7%D8%B1%D8%B4%20%D8%AC%D8%A7%D9%85%D8%B9",
        icon: "ti text-bmw-blue font-mono font22 ti-layout-grid",
      },
      {
        title: "داشبورد سامانه‌های شیرپوینت",
        href: "http://172.16.10.20/BIReports/browse/%DA%AF%D8%B2%D8%A7%D8%B1%D8%B4%D8%A7%D8%AA%20%D8%B4%DB%8C%D8%B1%D9%BE%D9%88%DB%8C%D9%86%D8%AA",
        icon: "ti text-bmw-blue font-mono font22 ti-clipboard-list",
      },
      {
        title: "آمار فروش مانیان و پرشیاخودرو",
        href: "http://172.16.10.20/BIReports/powerbi/%D8%A2%D9%85%D8%A7%D8%B1%20%D9%81%D8%B1%D9%88%D8%B4%20%D8%AE%D9%88%D8%AF%D8%B1%D9%88%DB%8C%DB%8C",
        icon: "ti text-bmw-blue font-mono font22 ti-chart-bar",
      },
    ],
  },
  {
    title: "شرکت‌های تابعه",
    icon: "ti text-bmw-blue font-mono font22 ti-building",
    items: [
      {
        title: "نیتا خودرو",
        href: "http://172.16.10.22/",
        icon: "ti text-bmw-blue font-mono font22 ti-car",
      },
      {
        title: "منطقه آزاد ارس",
        href: "#",
        icon: "ti text-bmw-blue font-mono font22 ti-map-pin",
      },
      {
        title: "منطقه آزاد اروند",
        href: "#",
        icon: "ti text-bmw-blue font-mono font22 ti-map-pin",
      },
      {
        title: "منطقه آزاد انزلی",
        href: "#",
        icon: "ti text-bmw-blue font-mono font22 ti-world",
      },
      {
        title: "منطقه آزاد کیش",
        href: "#",
        icon: "ti text-bmw-blue font-mono font22 ti-building-store",
      },
    ],
  },
  {
    title: "ERP خودروسازی",
    icon: "ti text-bmw-blue font-mono font22 ti-building-factory-2",
    items: [
      {
        title: "مالی و اداری",
        href: "http://192.168.123.14:5001",
        icon: "ti text-bmw-blue font-mono font22 ti-cash",
      },
      {
        title: "منابع انسانی",
        href: "http://192.168.123.14:5001",
        icon: "ti text-bmw-blue font-mono font22 ti-users",
      },
      {
        title: "جبران خدمات",
        href: "http://192.168.123.14:5001",
        icon: "ti text-bmw-blue font-mono font22 ti-briefcase",
      },
      {
        title: "تولید",
        href: "http://192.168.123.14:5001",
        icon: "ti text-bmw-blue font-mono font22 ti-settings",
      },
      {
        title: "انبار",
        href: "http://192.168.123.14:5001",
        icon: "ti text-bmw-blue font-mono font22 ti-package",
      },
      {
        title: "برنامه‌ریزی تولید",
        href: "http://192.168.123.14:5001",
        icon: "ti text-bmw-blue font-mono font22 ti-calendar",
      },
      {
        title: "کنترل کیفیت",
        href: "http://192.168.123.14:5001",
        icon: "ti text-bmw-blue font-mono font22 ti-shield-check",
      },
      {
        title: "زنجیره تامین و لجستیک",
        href: "http://192.168.123.14:5001",
        icon: "ti text-bmw-blue font-mono font22 ti-truck",
      },
      {
        title: "مهندسی محصول",
        href: "http://192.168.123.14:5001",
        icon: "ti text-bmw-blue  ti-stack-2font-mono font22",
      },
      {
        title: "نگهداری و تعمیرات (نت)",
        href: "http://192.168.123.14:5001",
        icon: "ti text-bmw-blue font-mono font22 ti-tool",
      },
    ],
  },
  {
    title: "سایر سامانه‌های کاربردی",
    icon: "ti text-bmw-blue font-mono font22 ti-apps",
    items: [
      {
        title: "اسناد سازمانی",
        href: "http://172.16.10.15/",
        icon: "ti text-bmw-blue font-mono font22 ti-folder",
      },
      {
        title: "مدیریت صورتجلسات",
        href: "http://srv-portal:70/Account/Login?ReturnUrl=%2F",
        icon: "ti text-bmw-blue font-mono font22 ti-calendar",
      },
      {
        title: "چارت سازمانی",
        href: "http://172.16.10.15/",
        icon: "ti text-bmw-blue font-mono font22 ti-sitemap",
      },
      {
        title: "آموزش مجازی",
        href: "http://lms.persiakhodro.ir/",
        icon: "ti text-bmw-blue font-mono font22 ti-school",
      },
      {
        title: "مدیریت وظایف و پروژه‌ها",
        href: "http://sp.persiakhodro.ir/sites/tasks/SitePages/new.aspx",
        icon: "ti text-bmw-blue font-mono font22 ti-check",
      },
      {
        title: "ارتباط با شبکه نمایندگان فروش",
        href: "https://sp.persiakhodro.ir/salesdealers",
        icon: "ti text-bmw-blue font-mono font22 ti-message",
      },
      {
        title: "ارتباط با نمایندگان خدمات پس از فروش",
        href: "https://sp.persiakhodro.ir/dealers",
        icon: "ti text-bmw-blue font-mono font22 ti-headset",
      },
      {
        title: "سیستم رستوران",
        href: "http://172.16.10.43/restaurant/",
        icon: "ti text-bmw-blue font-mono font22 ti-coffee",
      },
    ],
  },
  {
    title: "سایر دسترسی‌ها",
    icon: "ti text-bmw-blue font-mono font22 ti-plus",
    items: [
      {
        title: "منوی غذا",
        href: "http://172.16.10.15/",
        icon: "ti text-bmw-blue font-mono font22 ti-salad",
      },
      {
        title: "دفترچه تلفن",
        href: "http://172.16.10.15/دفترچه-تلفن",
        icon: "ti text-bmw-blue font-mono font22 ti-phone",
      },
      {
        title: "گالری تصاویر",
        href: "http://172.16.10.15/",
        icon: "ti text-bmw-blue font-mono font22 ti-photo",
      },
    ],
  },
];

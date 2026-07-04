import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default class StringHelpers {
  static baseURL: string | undefined = import.meta.env.VITE_API_URL;

  static getImage = (data: any, code?: string | number) => {
    const fix = `${StringHelpers.baseURL}/${data}`;
    return fix;
  };
  static toPersianDateTime = (date: string) => {
    return new DateObject({
      date: new Date(date),
      calendar: persian,
      locale: persian_fa,
    }).format("YYYY/MM/DD");
  };
  static filterIsActive = (data: any) => {
    return data?.filter((item: any) => item?.isActive);
  };
  static toPersianMonthName = (month: string | number): string => {
    if (!month) return "";

    const monthNumber = parseInt(month.toString(), 10);

    const months: Record<number, string> = {
      1: "فروردین",
      2: "اردیبهشت",
      3: "خرداد",
      4: "تیر",
      5: "مرداد",
      6: "شهریور",
      7: "مهر",
      8: "آبان",
      9: "آذر",
      10: "دی",
      11: "بهمن",
      12: "اسفند",
    };

    return months[monthNumber] ?? "";
  };
  static getDaysInPersianMonth = (month: number | string): number => {
    const m = Number(month);
    if (m >= 1 && m <= 6) return 31;
    if (m >= 7 && m <= 12) return 30;
    return 0;
  };
  static minutesToTime = (minutes: number | string): string => {
    const totalMinutes = Number(minutes);

    if (isNaN(totalMinutes) || totalMinutes < 0) return "00:00";

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    const h = hours.toString().padStart(2, "0");
    const m = mins.toString().padStart(2, "0");

    return `${h}:${m}`;
  };

  static toPrice = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return "0";
    const num = Number(value);
    if (isNaN(num)) return "0";
    return num.toLocaleString("fa-IR");
  };
  static toPersianFullDateTime = (date: string) => {
    if (!date) return "";

    return new DateObject({
      date: new Date(date),
      calendar: persian,
      locale: persian_fa,
    }).format("YYYY/MM/DD");
  };
  static toPersianFullDateTimeFromNow = (
    date: string | Date | null | undefined,
  ): string => {
    if (!date) return "";

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "";

    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - parsedDate.getTime()) / 1000,
    );

    // تبدیل اعداد به فارسی کمکی
    const toFa = (num: number): string => num.toLocaleString("fa-IR");

    // اگر زمان در آینده باشد
    if (diffInSeconds < 0) {
      const absSeconds = Math.abs(diffInSeconds);
      if (absSeconds < 60) return "چند ثانیه بعد";
      const minutes = Math.floor(absSeconds / 60);
      if (minutes < 60) return `${toFa(minutes)} دقیقه بعد`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${toFa(hours)} ساعت بعد`;
      // برای زمان‌های دورتر در آینده، تاریخ کامل نمایش داده می‌شود
      return new DateObject({
        date: parsedDate,
        calendar: persian,
        locale: persian_fa,
      }).format("YYYY/MM/DD HH:mm");
    }

    // اگر زمان در گذشته باشد (حالت استاندارد)
    if (diffInSeconds < 60) {
      return "چند ثانیه پیش";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${toFa(diffInMinutes)} دقیقه پیش`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${toFa(diffInHours)} ساعت پیش`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${toFa(diffInDays)} روز پیش`;
    }

    // اگر بیشتر از یک هفته گذشته باشد، تاریخ کامل شمسی به همراه ساعت نمایش داده می‌شود
    return new DateObject({
      date: parsedDate,
      calendar: persian,
      locale: persian_fa,
    }).format("YYYY/MM/DD - HH:mm");
  };
}

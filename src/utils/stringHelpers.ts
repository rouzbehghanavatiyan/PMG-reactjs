import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default class StringHelpers {
  static baseURL: string | undefined = import.meta.env.VITE_API_URL;

  static getImage = (data: any, code?: string | number) => {
    if (data?.attachmentType) {
      return `${StringHelpers.baseURL}/${data?.attachmentType}/${data?.fileName}`;
    } else {
      return `${StringHelpers.baseURL}/${data}`;
    }
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

  static getDayOfWeekName = (dayNumber: number | string): string => {
    const day = Number(dayNumber);

    const days: Record<number, string> = {
      1: "شنبه",
      2: "یک‌شنبه",
      3: "دوشنبه",
      4: "سه‌شنبه",
      5: "چهارشنبه",
    };

    return days[day] ?? "";
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

    const toFa = (num: number): string => num.toLocaleString("fa-IR");

    if (diffInSeconds < 0) {
      const absSeconds = Math.abs(diffInSeconds);
      if (absSeconds < 60) return "چند ثانیه بعد";
      const minutes = Math.floor(absSeconds / 60);
      if (minutes < 60) return `${toFa(minutes)} دقیقه بعد`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${toFa(hours)} ساعت بعد`;
      return new DateObject({
        date: parsedDate,
        calendar: persian,
        locale: persian_fa,
      }).format("YYYY/MM/DD HH:mm");
    }

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

    return new DateObject({
      date: parsedDate,
      calendar: persian,
      locale: persian_fa,
    }).format("YYYY/MM/DD - HH:mm");
  };

  static sortByWeekAndDay = <
    T extends {
      menuId?: number | string;
      day?: number | string;
    },
  >(
    data: T[],
  ): T[] => {
    if (!Array.isArray(data)) return [];

    return [...data].sort((a, b) => {
      const weekA = Number(a.menuId);
      const weekB = Number(b.menuId);

      if (weekA !== weekB) {
        return weekA - weekB;
      }

      const dayA = Number(a.day);
      const dayB = Number(b.day);

      return dayA - dayB;
    });
  };

  static fillMissingDays = <
    T extends {
      menuId?: number | string;
      day?: number | string;
      menuName?: string | null;
      registerDateMenu?: string | null;
      [key: string]: any;
    },
  >(
    data: T[],
  ): T[] => {
    if (!Array.isArray(data)) return [];
    const groups: Record<string, T[]> = {};
    data.forEach((item) => {
      const menuId = String(item.menuId ?? "unknown");
      if (!groups[menuId]) {
        groups[menuId] = [];
      }
      groups[menuId].push(item);
    });
    const result: T[] = [];
    Object.keys(groups).forEach((menuIdKey) => {
      const groupItems = groups[menuIdKey];
      const baseItem = groupItems[0] || {};
      const actualMenuId = baseItem.menuId;
      const menuName = baseItem.menuName ?? null;
      const registerDateMenu = baseItem.registerDateMenu ?? null;

      for (let day = 1; day <= 5; day++) {
        const existingItem = groupItems.find(
          (item) => Number(item.day) === day,
        );
        if (existingItem) {
          result.push(existingItem);
        } else {
          const nullItem = {
            menuId: actualMenuId,
            day: day,
            menuName: menuName,
            registerDateMenu: registerDateMenu,
            menuItemId: null,
            foodName: null,
            active: null,
            isActive: null,
          } as unknown as T;

          result.push(nullItem);
        }
      }
    });

    return result;
  };

  static fillMissingDayHistory = (data: any) => {
    if (!Array.isArray(data)) return [];

    const groups: Record<string, any[]> = {};
    data.forEach((item: any) => {
      const menuId = String(item.MenuId ?? item.menuId ?? "unknown");
      if (!groups[menuId]) {
        groups[menuId] = [];
      }
      groups[menuId].push(item);
    });

    const result: any = [];
    Object.keys(groups).forEach((menuIdKey) => {
      const groupItems = groups[menuIdKey];
      const baseItem =
        groupItems.find((item) => item.fromDate || item.FromDate) ||
        groupItems[0] ||
        {};

      const actualMenuId = baseItem.MenuId ?? baseItem.menuId;
      const menuName = baseItem.MenuName ?? baseItem.menuName ?? null;
      const personnelCode =
        baseItem.PersonnelCode ?? baseItem.personnelCode ?? null;
      const userId = baseItem.UserId ?? baseItem.userId ?? null;

      const fromDate = baseItem.FromDate ?? baseItem.fromDate ?? null;
      const toDate = baseItem.ToDate ?? baseItem.toDate ?? null;

      const calculateCorrectDate = (startDate: string, dayIndex: number) => {
        if (!startDate) return baseItem.CreateDate ?? null;

        const dateObj = new Date(startDate);
        dateObj.setDate(dateObj.getDate() + (dayIndex - 1));

        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
        const dd = String(dateObj.getDate()).padStart(2, "0");

        return `${yyyy}-${mm}-${dd}T00:00:00`;
      };

      for (let day = 1; day <= 5; day++) {
        const existingItem = groupItems.find(
          (item) => Number(item.Day ?? item.day) === day,
        );

        if (existingItem) {
          result.push(existingItem);
        } else {
          const correctDate = calculateCorrectDate(fromDate, day);

          const nullItem = {
            MenuId: actualMenuId,
            Day: day,
            MenuName: menuName,
            CreateDate: correctDate,
            PersonnelCode: personnelCode,
            UserId: userId,
            FromDate: fromDate,
            ToDate: toDate,
            MenuItemId: null,
            FoodName: null,
          };

          result.push(nullItem);
        }
      }
    });

    return result;
  };
}

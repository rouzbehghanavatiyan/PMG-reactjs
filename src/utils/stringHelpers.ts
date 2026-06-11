import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default class StringHelpers {
  static baseURL: string | undefined = import.meta.env.VITE_API_URL;

  static getImage = (data: any, code?: string | number) => {
    return `${StringHelpers.baseURL}/uploads/${data?.fileName}`;
    // return `${StringHelpers.baseURL}/${data?.attachmentType}/${data?.fileName}`;
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
  static toPrice = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return "0";
    const num = Number(value);
    if (isNaN(num)) return "0";
    return num.toLocaleString("fa-IR");
  };
}

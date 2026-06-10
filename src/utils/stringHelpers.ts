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
}

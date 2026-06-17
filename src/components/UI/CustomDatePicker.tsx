import { Controller } from "react-hook-form";
import DatePicker from "react-multi-date-picker";

import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const CustomDatePicker = ({ control, name, label, rules }: any) => {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="block mb-1 text-gray-600 tracking-wider font-light text-sm">
          {label}
        </label>
      )}
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field, fieldState }) => (
          <>
            <DatePicker
              value={field.value}
              onChange={(date) => field.onChange(date)}
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              calendarPosition="bottom-right"
              containerClassName="w-full"
              inputClass={`w-full rounded-xl border p-2 outline-none 
              ${
                fieldState.error
                  ? "border-red-400"
                  : "border-gray-200 focus:border-blue-500"
              }`}
            />

            {fieldState.error && (
              <span className="text-red-500 text-xs">
                {fieldState.error.message}
              </span>
            )}
          </>
        )}
      />
    </div>
  );
};

export default CustomDatePicker;

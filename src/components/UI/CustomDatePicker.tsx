import { Controller } from "react-hook-form";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const CustomDatePicker = ({
  control,
  name,
  label,
  rules,
  minDate,
  maxDate,
}: any) => {
  return (
    <div className="flex w-full flex-col">
      {label && (
        <label className="mb-1 text-sm font-light tracking-wider text-gray-600">
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
              minDate={minDate}
              maxDate={maxDate}
              value={field.value}
              onChange={(date) => field.onChange(date)}
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              calendarPosition="bottom-right"
              containerClassName="w-full"
              inputClass={`
                w-full
                bg-white
                rounded-xl
                border
                p-2.5
                outline-none
                transition-all
                duration-200
                ${
                  fieldState.error
                    ? "border-red-400"
                    : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }
              `}
            />

            {fieldState.error && (
              <span className="mt-1 text-xs text-red-500">
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
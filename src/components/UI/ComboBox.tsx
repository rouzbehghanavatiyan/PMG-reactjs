import Select from "react-select";

interface Props {
  options: any[];
  value: any;
  onChange: (value: any) => void;
  label?: string;
  isMulti?: boolean;
  keyId: string;
  keyValue: string;
}

export default function ComboBox({
  options,
  value,
  onChange,
  label,
  isMulti = false,
  keyId,
  keyValue,
}: Props) {
  const mappedOptions = options.map((item) => ({
    value: item[keyId],
    label: item[keyValue],
    original: item,
  }));

  const mappedValue = isMulti
    ? Array.isArray(value)
      ? value.map((item) => ({
          value: item[keyId],
          label: item[keyValue],
          original: item,
        }))
      : []
    : value
      ? {
          value: value[keyId],
          label: value[keyValue],
          original: value,
        }
      : null;

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1 text-gray-600 tracking-wider font-light text-sm">
          {label}
        </label>
      )}
      <Select
      className="text-gray-500"
        isRtl
        options={mappedOptions}
        value={mappedValue}
        isMulti={isMulti}
        isSearchable
        placeholder="انتخاب کنید..."
        closeMenuOnSelect={!isMulti}
        onChange={(selected: any) => {
          if (isMulti) {
            onChange(selected ? selected.map((x: any) => x.original) : []);
          } else {
            onChange(selected?.original ?? null);
          }
        }}
      />
    </div>
  );
}

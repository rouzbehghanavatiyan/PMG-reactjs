import React, { useEffect, useMemo, useState } from "react";
import { getAllOrderUserFood } from "../../services/dotNet";
import { CustomTable, type Column } from "../../components/UI/CustomTable";
import { useForm } from "react-hook-form";
import CustomInput from "../../components/UI/CustomInput";
import StringHelpers from "../../utils/stringHelpers";
import Button from "../../components/UI/Button";
import { ChartBar, Eye, Sheet } from "lucide-react";
import ShowUserOrderModal from "./ShowUserOrderModal";
import FoodChart from "./FoodChart";

const PAGE_SIZE = 10;

const FoodOrderReport = () => {
  const [isLoading, setLoading] = useState(false);
  const [showUserOrder, setShowUserOrder] = useState(false);
  const [allUserOrderFood, setAllUserOrderFood] = useState<any>([]);
  const [itemOrder, setItemOrder] = useState<any>({});
  const [showChart, setShowChart] = useState(false);
  const [showTable, setShowTable] = useState(true);

  const { control, watch } = useForm<any>({
    defaultValues: {
      search: "",
    },
  });
  const searchQuery = watch("search");

  const parseOrderDate = (value?: string | Date | null): Date | null => {
    if (!value) return null;

    const date = value instanceof Date ? value : new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  };

  const getPersianWeekDay = (value?: string | Date | null): string => {
    const date = parseOrderDate(value);

    if (!date) return "—";

    return new Intl.DateTimeFormat("fa-IR", {
      weekday: "long",
      timeZone: "Asia/Tehran",
    }).format(date);
  };

  const columns: Column<any>[] = useMemo(
    () => [
      {
        key: "rowIndex",
        title: "ردیف",
        align: "center",
        width: "w-20",
        hideOnMobileCard: true,
        render: (_, index) => (
          <span className="text-xs text-slate-500 font-mono">{index + 1}</span>
        ),
      },

      {
        key: "FoodName",
        title: "نام غذا",
        render: (item) => (
          <p className="text-xs sm:text-sm font-semibold text-slate-700 truncate">
            {item.FoodName}
          </p>
        ),
      },
      {
        key: "TotalOrdersCount",
        title: "کل سفارشات",
        align: "center",
        render: (item) => (
          <span className="text-slate-600 text-[11px]">
            {item.TotalOrdersCount}
          </span>
        ),
      },
      {
        key: "WeekDay",
        title: "روز هفته",
        align: "center",
        render: (item) => (
          <span className="text-[11px] font-medium text-slate-700 whitespace-nowrap">
            {getPersianWeekDay(item.OrderDate)}
          </span>
        ),
      },
      {
        key: "OrderDate",
        title: "تاریخ",
        align: "center",
        render: (item) => (
          <span className="text-[11px] text-slate-500 whitespace-nowrap">
            {StringHelpers.toPersianDateTime?.(item.OrderDate)}
          </span>
        ),
      },
      {
        key: "OrderDate",
        title: "عملیات",
        align: "center",
        render: (item) => {
          const hanldeShowModal = () => {
            console.log(item);
            setItemOrder(item);
            setShowUserOrder(true);
          };

          return (
            <div
              onClick={hanldeShowModal}
              className="flex gap-2 cursor-pointer text-bmw-blue justify-center items-center"
            >
              <span className="text-[11px] text-slate-500">
                <Eye className="text-bmw-blue" />
              </span>
              گزارش سفارشات
            </div>
          );
        },
      },
    ],
    [],
  );

  const filteredAllUserOrderFood = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    if (!search) {
      return allUserOrderFood;
    }
    return allUserOrderFood.filter((user: any) => {
      const fullName = `${user.FoodName ?? ""}`.toLowerCase();
      return fullName.includes(search);
    });
  }, [allUserOrderFood, searchQuery]);

  const handleGetAllOrderUserFood = async () => {
    try {
      setLoading(true);

      const res = await getAllOrderUserFood();
      const { result, code } = res?.data || {};

      if (code === 0 && Array.isArray(result)) {
        setAllUserOrderFood(result);
      } else if (Array.isArray(res?.data)) {
        setAllUserOrderFood(res.data);
      } else {
        setAllUserOrderFood([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setAllUserOrderFood([]);
    } finally {
      setLoading(false);
    }
  };

  console.log(allUserOrderFood);

  useEffect(() => {
    handleGetAllOrderUserFood();
  }, []);

  const handleExportExcel = () => {};

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="w-full md:max-w-md">
          <CustomInput
            name="search"
            control={control}
            placeholder="جستجو بر اساس نام غذا و تاریخ"
            containerClassName="w-full"
          />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="brown"
            onClick={() => {
              setShowChart((prev) => !prev);
              setShowTable(false);
            }}
            leftIcon={<ChartBar size={16} />}
            className="flex-1 sm:flex-initial font-bold text-slate-800 h-10 text-xs sm:text-sm justify-center whitespace-nowrap"
          >
            گزارش نموداری
          </Button>
          <Button
            variant="purple"
            onClick={() => {
              setShowChart(false);
              setShowTable((prev) => !prev);
            }}
            leftIcon={<Sheet size={16} />}
            className="flex-1 sm:flex-initial font-bold text-slate-800 h-10 text-xs sm:text-sm justify-center whitespace-nowrap"
          >
            نمایش جدول
          </Button>
          <Button
            variant="success"
            onClick={handleExportExcel}
            leftIcon={<Sheet size={16} />}
            className="flex-1 sm:flex-initial font-bold text-slate-800 h-10 text-xs sm:text-sm justify-center whitespace-nowrap"
          >
            خروجی اکسل
          </Button>
        </div>
      </div>
      {showTable && (
        <CustomTable
          data={filteredAllUserOrderFood}
          columns={columns}
          keyExtractor={(item, index) =>
            String(item.MenuItemId ?? item.MenuItemId ?? index)
          }
          isLoading={isLoading}
          pageSize={PAGE_SIZE}
          emptyMessage="موردی یافت نشد."
        />
      )}
      {showChart && (
        <FoodChart
          showChart={showChart}
          setShowChart={setShowChart}
          filteredAllUserOrderFood={filteredAllUserOrderFood}
        />
      )}
      {showUserOrder && (
        <ShowUserOrderModal
          itemOrder={itemOrder}
          showUserOrder={showUserOrder}
          setShowUserOrder={setShowUserOrder}
        />
      )}
    </div>
  );
};

export default FoodOrderReport;

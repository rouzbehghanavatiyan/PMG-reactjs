import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import ModalUI from "../../components/UI/ModalUI";
import { getAllOrderUserOnDay } from "../../services/dotNet";
import CustomTable, { type Column } from "../../components/UI/CustomTable";
import CustomInput from "../../components/UI/CustomInput";
import { useForm } from "react-hook-form";
import Button from "../../components/UI/Button";
import { Sheet } from "lucide-react";

const PAGE_SIZE = 10;

const ShowUserOrderModal: React.FC<any> = ({
  showUserOrder,
  setShowUserOrder,
  itemOrder,
}) => {
  const [isLoading, setLoading] = useState(false);
  const [allUserOrderFoodOnDay, setAllUserOrderFoodOnDay] = useState<any[]>([]);

  const { control, watch } = useForm<any>({
    defaultValues: {
      search: "",
    },
  });

  const searchQuery = watch("search");

  const filteredUserOrderFoodOnDay = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    if (!search) {
      return allUserOrderFoodOnDay;
    }
    return allUserOrderFoodOnDay.filter((user: any) => {
      const fullName =
        `${user.FirstName ?? ""} ${user.LastName ?? ""}`.toLowerCase();
      const personalCode = String(user.PersonnelCode ?? "").toLowerCase();

      return fullName.includes(search) || personalCode.includes(search);
    });
  }, [allUserOrderFoodOnDay, searchQuery]);

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
        key: "FirstName",
        title: "نام و نام خانوادگی",
        render: (item) => (
          <p className="text-xs sm:text-sm font-semibold text-slate-700 truncate">
            {item.FirstName} {item.LastName}
          </p>
        ),
      },
      {
        key: "PersonnelCode",
        title: "کد پرسنلی",
        align: "center",
        render: (item) => (
          <span className="text-slate-600 text-[11px]">
            {item.PersonnelCode}
          </span>
        ),
      },
    ],
    [],
  );

  const handleGetAllUsers = async () => {
    try {
      setLoading(true);

      const res = await getAllOrderUserOnDay(itemOrder?.MenuItemId);
      const { result, code } = res?.data || {};

      if (code === 0 && Array.isArray(result)) {
        setAllUserOrderFoodOnDay(result);
      } else if (Array.isArray(res?.data)) {
        setAllUserOrderFoodOnDay(res.data);
      } else {
        setAllUserOrderFoodOnDay([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setAllUserOrderFoodOnDay([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemOrder?.MenuItemId) {
      handleGetAllUsers();
    }
  }, [itemOrder?.MenuItemId]);

  const handleExportExcel = () => {
    if (filteredUserOrderFoodOnDay.length === 0) {
      alert("داده‌ای برای خروجی گرفتن وجود ندارد.");
      return;
    }

    const exportData = filteredUserOrderFoodOnDay.map(
      (item: any, index: number) => ({
        ردیف: index + 1,
        "نام و نام خانوادگی":
          `${item.FirstName ?? ""} ${item.LastName ?? ""}`.trim() || "—",
        "کد پرسنلی": item.PersonnelCode ?? "—",
      }),
    );

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    worksheet["!dir"] = "rtl";

    const sheetName = itemOrder?.FoodName
      ? `${itemOrder.FoodName}`.slice(0, 31)
      : "سفارشات";

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const fileName = itemOrder?.FoodName
      ? `سفارشات_${itemOrder.FoodName.replace(/\s+/g, "_")}.xlsx`
      : "User_Orders_Report.xlsx";

    XLSX.writeFile(workbook, fileName);
  };

  return (
    <ModalUI
      isOpen={showUserOrder}
      onClose={() => setShowUserOrder(false)}
      title={
        itemOrder?.FoodName
          ? `سفارش کل کاربران (${itemOrder.FoodName})`
          : "سفارش کل کاربران"
      }
      size="md"
      padding="p-0"
      closeOnBackdrop={false}
    >
      <div className="p-4 space-y-4">
        <div className="flex sm:flex-row items-center justify-between gap-3">
          <CustomInput
            name="search"
            control={control}
            placeholder="جستجو بر اساس نام یا کد پرسنلی"
            containerClassName="w-full sm:max-w-md"
          />
          <Button
            variant="success"
            onClick={handleExportExcel}
            leftIcon={<Sheet size={16} />}
            className="sm:w-auto font-bold text-slate-800 h-10 shrink-0 text-xs sm:text-sm justify-center"
          >
            خروجی اکسل
          </Button>
        </div>
        <CustomTable
          data={filteredUserOrderFoodOnDay}
          columns={columns}
          keyExtractor={(item, index) =>
            String(item.PersonnelCode ?? item.UserId ?? index)
          }
          isLoading={isLoading}
          pageSize={PAGE_SIZE}
          emptyMessage="موردی یافت نشد."
        />
      </div>
    </ModalUI>
  );
};

export default ShowUserOrderModal;

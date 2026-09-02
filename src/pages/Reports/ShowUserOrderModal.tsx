import React, { useEffect, useMemo, useState } from "react";
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
  const [allUserOrderFoodOnDay, setAllUserOrderFoodOnDay] = useState([]);
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
        title: "کدپرسنلی",
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
      if (code === 0) {
        setAllUserOrderFoodOnDay(result);
      } else {
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetAllUsers();
  }, []);

  const handleExportExcel = () => {};

  return (
    <ModalUI
      isOpen={showUserOrder}
      onClose={() => setShowUserOrder(false)}
      title="سفارش کل کاربران"
      size="md"
      padding="p-0"
      closeOnBackdrop={false}
    >
      <div className="p-4 space-y-4">
        <div className="flex sm:flex-row items-center justify-between gap-3">
          <CustomInput
            name="search"
            control={control}
            placeholder="جستجو بر اساس نام غذا و تاریخ"
            containerClassName="w-full sm:max-w-md"
          />
          <Button
            variant="success"
            onClick={handleExportExcel}
            leftIcon={<Sheet size={16} />}
            className=" sm:w-auto font-bold text-slate-800 h-10 shrink-0 text-xs sm:text-sm justify-center"
          >
            خروجی اکسل
          </Button>
        </div>
        <CustomTable
          data={filteredUserOrderFoodOnDay}
          columns={columns}
          keyExtractor={(item, index) =>
            String(item.MenuItemId ?? item.MenuItemId ?? index)
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
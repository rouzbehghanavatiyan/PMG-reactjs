import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as XLSX from "xlsx";
import CustomTable, { type Column } from "../../components/UI/CustomTable";
import { getAllRahkaranUsers } from "../../services/dotNet";
import CustomInput from "../../components/UI/CustomInput";
import Button from "../../components/UI/Button";
import { Sheet } from "lucide-react";

const PAGE_SIZE = 10;

interface SearchForm {
  search: string;
}

interface User {
  id?: number;
  firstName?: string;
  lastName?: string;
  personalCode?: string;
  email?: string;
  department?: string;
  organizationalUnit?: string;
  employmentDate?: string;
}

const UserReports = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setLoading] = useState(false);
  const { control, watch } = useForm<SearchForm>({
    defaultValues: {
      search: "",
    },
  });
  const searchQuery = watch("search");

  const columns: Column<User>[] = useMemo(
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
        key: "title",
        title: "نام و نام خانوادگی",
        render: (item) => (
          <p className="text-xs sm:text-sm font-semibold text-slate-700 truncate">
            {item.firstName} {item.lastName}
          </p>
        ),
      },
      {
        key: "personalCode",
        title: "کد پرسنلی",
        align: "center",
        render: (item) => (
          <span className="text-xs text-slate-600">{item.personalCode}</span>
        ),
      },
      {
        key: "department",
        title: "واحد",
        align: "center",
        render: (item) => (
          <span className="text-slate-600 text-[11px]">{item.department}</span>
        ),
      },
      {
        key: "email",
        title: "ایمیل",
        align: "center",
        render: (item) => (
          <span className="text-slate-600 text-[11px]">{item.email}</span>
        ),
      },
      {
        key: "organizationalUnit",
        title: "سمت",
        align: "center",
        render: (item) => (
          <span className="text-slate-600 text-[11px]">
            {item.organizationalUnit}
          </span>
        ),
      },
      {
        key: "employmentDate",
        title: "تاریخ استخدام",
        align: "center",
        render: (item) => (
          <span className="text-[11px] text-slate-500 whitespace-nowrap">
            {item.employmentDate}
          </span>
        ),
      },
    ],
    [],
  );

  const filteredUsers = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    if (!search) {
      return allUsers;
    }

    return allUsers.filter((user) => {
      const fullName =
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.toLowerCase();
      const personalCode = String(user.personalCode ?? "").toLowerCase();
      const email = (user.email ?? "").toLowerCase();

      return (
        fullName.includes(search) ||
        personalCode.includes(search) ||
        email.includes(search)
      );
    });
  }, [allUsers, searchQuery]);

  const handleGetAllUsers = async () => {
    try {
      setLoading(true);

      const res = await getAllRahkaranUsers();
      const { result, code } = res?.data || {};

      if (code === 0 && Array.isArray(result)) {
        setAllUsers(result);
      } else if (Array.isArray(res?.data)) {
        setAllUsers(res.data);
      } else {
        setAllUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetAllUsers();
  }, []);

  const handleExportExcel = () => {
    if (filteredUsers.length === 0) {
      alert("داده‌ای برای خروجی گرفتن وجود ندارد.");
      return;
    }

    const exportData = filteredUsers.map((item, index) => ({
      ردیف: index + 1,
      "نام و نام خانوادگی":
        `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim() || "—",
      "کد پرسنلی": item.personalCode || "—",
      "واحد سازمانی": item.department || "—",
      سمت: item.organizationalUnit || "—",
      ایمیل: item.email || "—",
      "تاریخ استخدام": item.employmentDate || "—",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    worksheet["!dir"] = "rtl";

    XLSX.utils.book_append_sheet(workbook, worksheet, "لیست کاربران راهکاران");
    XLSX.writeFile(workbook, "Rahkaran_Users_Report.xlsx");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6 sm:gap-3">
        <div className="flex items-center start gap-4 rounded-xl border border-slate-100 bg-white p-3 sm:p-4 shadow-sm">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500">
            تعداد کل پرسنل
          </p>
          <p className="text-lg sm:text-2xl font-bold text-green-600">
            {filteredUsers.length}
          </p>
        </div>
        <div className="flex sm:flex-row items-center justify-between gap-3">
          <CustomInput
            name="search"
            control={control}
            placeholder="جستجو بر اساس کد پرسنلی، نام و نام خانوادگی یا ایمیل"
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
      </div>
      <CustomTable
        data={filteredUsers}
        columns={columns}
        keyExtractor={(item, index) =>
          String(item.id ?? item.personalCode ?? index)
        }
        isLoading={isLoading}
        pageSize={PAGE_SIZE}
        emptyMessage="موردی یافت نشد."
      />
    </div>
  );
};

export default UserReports;

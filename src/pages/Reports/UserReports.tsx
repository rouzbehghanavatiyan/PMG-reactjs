import React, { useEffect, useMemo, useState } from "react";
import CustomTable, { type Column } from "../../components/UI/CustomTable";
import StringHelpers from "../../utils/stringHelpers";
import { getAllUsers } from "../../services/dotNet";
const PAGE_SIZE = 10;

const UserReports = () => {
  const [allPoll, setAllPoll] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("همه");

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
        title: "کدپرسنلی",
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
          <span className="text-slate-600 text-[11px]">{item?.department}</span>
        ),
      },

      {
        key: "email",
        title: "ایمیل",
        align: "center",
        render: (item) => (
          <span className="text-slate-600 text-[11px]">{item?.email}</span>
        ),
      },
      {
        key: "organizationalUnit",
        title: "سمت",
        align: "center",
        render: (item) => (
          <span className="text-slate-600 text-[11px]">
            {item?.organizationalUnit}
          </span>
        ),
      },
      {
        key: "employmentDate",
        title: "تاریخ استخدام",
        align: "center",
        render: (item) => (
          <span className="text-[11px] text-slate-500 whitespace-nowrap">
            {item?.employmentDate}
          </span>
        ),
      },
    ],
    [],
  );

  const filteredPolls = useMemo(() => {
    return allPoll.filter((item) => {
      let matchesTab = true;

      if (activeTab === "عمومی") {
        matchesTab = item.typeId === 1;
      } else if (activeTab === "رستوران") {
        matchesTab = item.typeId !== 1;
      }
      const matchesSearch = !searchQuery.trim()
        ? true
        : item.title?.toLowerCase().includes(searchQuery.toLowerCase().trim());

      return matchesTab && matchesSearch;
    });
  }, [allPoll, activeTab, searchQuery]);

  const handleGetAllUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      const { result, code } = res?.data || {};
      if (code === 0 && Array.isArray(result)) {
        setAllPoll(result);
      } else if (Array.isArray(res?.data)) {
        setAllPoll(res.data);
      }
    } catch (error) {
      console.error("Error fetching polls:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetAllUsers();
  }, []);

  return (
    <CustomTable
      data={filteredPolls}
      columns={columns}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      pageSize={PAGE_SIZE}
      emptyMessage="موردی یافت نشد."
    />
  );
};

export default UserReports;

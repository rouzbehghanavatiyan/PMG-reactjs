import React, { useState, useEffect } from "react";
import {
  Lightbulb,
  Send,
  History,
  UserCheck,
  FileText,
  Paperclip,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  MessageSquare,
  Plus,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  X,
  Search,
  Download,
  Trash2,
  RotateCcw,
  Edit3,
} from "lucide-react";
import { useLanguage } from "../src/contexts/LanguageContext";
import { useAppSelector } from "../src/features/store";
import {
  addAttachment,
  createFeedback,
  createFeedbackCategories,
  deleteFeedback,
  deleteFeedbackCategories,
  getAllFeedback,
  getAllFeedbackCategories,
  getAllFeedbackManager,
  restoreFeedback,
  restoreFeedbackCategories,
  updateFeedback,
  updateFeedbackCategories,
  updateStatusManager,
} from "../src/services/dotNet";
import { useHasPermission } from "../src/hooks/usePermissions";

interface FeedbackStatusLog {
  status: "submitted" | "under_review" | "approved" | "rejected";
  date: string;
  comment?: string;
}

interface FeedbackItem {
  id: string;
  title: string;
  category: string;
  type: "suggestion" | "critic";
  description: string;
  attachmentName?: string;
  status: "submitted" | "under_review" | "approved" | "rejected";
  createdAt: string;
  userEmployeeId: string;
  userName: string;
  logs: FeedbackStatusLog[];
  managerComment?: string;
}

const FeedbackSystem: React.FC = () => {
  const { hasPermission } = useHasPermission();
  const { t, language, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const userLogin = useAppSelector(
    (state) => state?.main?.userProfile?.userLogin,
  );

  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [categories, setCategories] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "submit" | "history" | "categories"
  >("submit");
  const [role, setRole] = useState<"employee" | "manager">("employee");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const response = await getAllFeedback();
      const { data } = response;
      console.log(response);
      if (response?.data?.length !== 0) {
        setFeedbackList(data);
      }
    } catch (error) {
      console.error("Error fetching feedback from database:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getAllFeedbackCategories();
      console.log(response);
      if (response?.data?.length !== 0) {
        setCategories(response?.data);
      }
    } catch (error) {
      console.error("Error fetching categories from database:", error);
    }
  };

  const handleGetAllFeedbackManager = async () => {
    const response = await getAllFeedbackManager();
    const { data } = response;
    console.log("responseresponseresponseresponse", response);
    if (response?.data?.length !== 0) {
      setFeedbackList(data);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchFeedback();
  }, []);

  useEffect(() => {
    if (role === "manager") {
      handleGetAllFeedbackManager();
    }
  }, [role]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState([]);

  const [type, setType] = useState<"suggestion" | "critic">("suggestion");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [newCatId, setNewCatId] = useState("");
  const [newCatFa, setNewCatFa] = useState("");
  const [newCatEn, setNewCatEn] = useState("");
  const [catError, setCatError] = useState("");
  const [catSuccess, setCatSuccess] = useState("");
  const [idEditCategoryModal, setIdEditCategoryModal] = useState(null);

  // useEffect(() => {
  //   const activeCats = categories?.filter((c:any) => !c.isDeleted);
  //   if (activeCats?.length > 0 && !activeCats?.some((c) => c.id === category)) {
  //     setCategory(activeCats?[0].id);
  //   }
  // }, [categories]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError("");
    setCatSuccess("");

    if (
      // !newCatId.trim() ||
      !newCatFa.trim() ||
      !newCatEn.trim()
    ) {
      setCatError(
        isRtl ? "لطفاً تمامی فیلدها را پر کنید." : "Please fill all fields.",
      );
      return;
    }
    const postData = {
      // id: cleanId,
      fa: newCatFa.trim(),
      en: newCatEn.trim(),
    };
    try {
      const response = await createFeedbackCategories(postData);

      if (!!response.data?.feedbackId) {
        setCatSuccess(
          isRtl
            ? "دپارتمان/حوزه با موفقیت ایجاد/ویرایش شد."
            : "Category created/updated successfully.",
        );
        setNewCatId("");
        setNewCatFa("");
        setNewCatEn("");
        fetchCategories();
      } else {
        const errData = await response.json();
        setCatError(
          errData.error || (isRtl ? "خطایی رخ داد" : "Error occurred"),
        );
      }
    } catch (err) {
      console.error("Error adding category:", err);
      setCatError(isRtl ? "خطا در برقراری ارتباط با سرور" : "Connection error");
    }
  };

  // Category Edit and Confirmation states
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    fa: string;
    en: string;
    is_deleted?: boolean;
  } | null>(null);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editCategoryFa, setEditCategoryFa] = useState("");
  const [editCategoryEn, setEditCategoryEn] = useState("");
  const [editCategoryError, setEditCategoryError] = useState("");

  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    fa: string;
    en: string;
  } | null>(null);
  const [showCategoryDeleteDialog, setShowCategoryDeleteDialog] =
    useState(false);

  // Handle opening the edit category modal
  const handleOpenEditCategoryModal = (cat: {
    id: string;
    fa: string;
    en: string;
    is_deleted?: boolean;
  }) => {
    console.log("cat", cat);

    setIdEditCategoryModal(cat?.id);
    setEditingCategory(cat);
    setEditCategoryFa(cat.fa);
    setEditCategoryEn(cat.en);
    setEditCategoryError("");
    setShowEditCategoryModal(true);
  };

  const handleSaveEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setEditCategoryError("");

    if (!editCategoryFa.trim() || !editCategoryEn.trim()) {
      setEditCategoryError(
        isRtl ? "لطفاً تمامی فیلدها را پر کنید." : "Please fill all fields.",
      );
      return;
    }
    const postData = {
      id: idEditCategoryModal,
      fa: editCategoryFa.trim(),
      en: editCategoryEn.trim(),
    };
    try {
      const response = await updateFeedbackCategories(postData);
      if (response?.data?.code === 0) {
        setCatSuccess(
          isRtl
            ? "دپارتمان/حوزه با موفقیت ویرایش شد."
            : "Category updated successfully.",
        );
        setShowEditCategoryModal(false);
        setEditingCategory(null);
        fetchCategories();
      } else {
        const errData = await response.json();
        setEditCategoryError(
          errData.error ||
            (isRtl ? "خطا در ذخیره‌سازی تغییرات" : "Error updating category"),
        );
      }
    } catch (err) {
      console.error("Error saving category edit:", err);
      setEditCategoryError(
        isRtl ? "خطا در برقراری ارتباط با سرور" : "Connection error",
      );
    }
  };

  // Handle trigger logical deleting a category (show modal)
  const handleTriggerDeleteCategory = (cat: {
    id: string;
    fa: string;
    en: string;
  }) => {
    setCategoryToDelete(cat);
    setShowCategoryDeleteDialog(true);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setCatError("");
    setCatSuccess("");

    try {
      const response = await deleteFeedbackCategories(categoryToDelete.id);
      if (response?.data?.code === 0) {
        setCatSuccess(
          isRtl
            ? "دپارتمان با موفقیت به صورت منطقی حذف شد."
            : "Category logically deleted successfully.",
        );
        fetchCategories();
      } else {
        const errData = await response.json();
        setCatError(
          errData.error ||
            (isRtl ? "خطا در حذف دپارتمان" : "Error deleting category"),
        );
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      setCatError(isRtl ? "خطا در برقراری ارتباط با سرور" : "Connection error");
    } finally {
      setShowCategoryDeleteDialog(false);
      setCategoryToDelete(null);
    }
  };

  // Handle restore logically deleted category
  const handleRestoreCategory = async (idToRestore: string) => {
    setCatError("");
    setCatSuccess("");

    try {
      const response = await restoreFeedbackCategories(idToRestore);
      if (response?.data?.code === 0) {
        setCatSuccess(
          isRtl
            ? "دپارتمان با موفقیت بازیابی شد."
            : "Category restored successfully.",
        );
        fetchCategories();
      } else {
        const errData = await response.json();
        setCatError(
          errData.error ||
            (isRtl ? "خطا در بازیابی دپارتمان" : "Error restoring category"),
        );
      }
    } catch (err) {
      console.error("Error restoring category:", err);
      setCatError(isRtl ? "خطا در برقراری ارتباط با سرور" : "Connection error");
    }
  };

  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(
    null,
  );
  const [statusComment, setStatusComment] = useState("");
  const [newStatus, setNewStatus] = useState<
    "submitted" | "under_review" | "approved" | "rejected"
  >("under_review");

  // Logical Delete & Restore handlers
  const [logicalDeleteTarget, setLogicalDeleteTarget] =
    useState<FeedbackItem | null>(null);
  const [showLogicalDeleteDialog, setShowLogicalDeleteDialog] = useState(false);

  const handleLogicalDelete = async () => {
    if (!logicalDeleteTarget) return;
    try {
      const response = await deleteFeedback(logicalDeleteTarget.id);
      if (response?.data?.code === 0) {
        fetchFeedback();
      } else {
        console.error("Failed to logically delete item");
      }
    } catch (err) {
      console.error("Error logical deleting item:", err);
    }
    setShowLogicalDeleteDialog(false);
    setLogicalDeleteTarget(null);
  };

  const handleRestoreFeedback = async (item: FeedbackItem) => {
    try {
      const response = await restoreFeedback(item?.id);
      if (response?.data?.code === 0) {
        fetchFeedback();
      } else {
        console.error("Failed to restore item");
      }
    } catch (err) {
      console.error("Error restoring item:", err);
    }
  };

  const [editingFeedback, setEditingFeedback] = useState<FeedbackItem | null>(
    null,
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [editType, setEditType] = useState<"suggestion" | "critic">(
    "suggestion",
  );
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");

  const handleOpenEditModal = (item: any) => {
    setEditingFeedback(item);
    setEditTitle(item?.title);
    setEditCategory(item?.category);
    setEditType(item?.type);
    setEditDescription(item?.description);
    setEditError("");
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeedback) return;
    setEditError("");

    if (!editTitle.trim() || !editDescription.trim()) {
      setEditError(
        isRtl
          ? "لطفاً تمامی فیلدهای الزامی را پر کنید."
          : "Please fill all required fields.",
      );
      return;
    }

    const changedParts: string[] = [];
    const changedPartsEn: string[] = [];

    if (editTitle.trim() !== editingFeedback.title) {
      changedParts.push(`عنوان به "${editTitle.trim()}"`);
      changedPartsEn.push(`Title to "${editTitle.trim()}"`);
    }
    if (editCategory !== editingFeedback.category) {
      const oldCat = getCategoryLabel(editingFeedback.category);
      // const newCat = getCategoryLabel(editCategory);
      // changedParts.push(`دپارتمان از "${oldCat}" به "${newCat}"`);
      // changedPartsEn.push(`Category from "${oldCat}" to "${newCat}"`);
    }
    if (editType !== editingFeedback.type) {
      const oldTypeLabel =
        editingFeedback.type === "suggestion"
          ? isRtl
            ? "پیشنهاد"
            : "Suggestion"
          : isRtl
            ? "انتقاد"
            : "Critique";
      const newTypeLabel =
        editType === "suggestion"
          ? isRtl
            ? "پیشنهاد"
            : "Suggestion"
          : isRtl
            ? "انتقاد"
            : "Critique";
      changedParts.push(`نوع از "${oldTypeLabel}" به "${newTypeLabel}"`);
      changedPartsEn.push(`Type from "${oldTypeLabel}" to "${newTypeLabel}"`);
    }
    if (editDescription.trim() !== editingFeedback.description) {
      changedParts.push("شرح کامل توضیحات");
      changedPartsEn.push("description text");
    }

    if (changedParts.length === 0) {
      setShowEditModal(false);
      setEditingFeedback(null);
      return;
    }

    const dateStr = new Date().toISOString().replace("T", " ").substring(0, 16);
    const changelogMessage = isRtl
      ? `ویرایش درخواست توسط همکار. تغییرات در: [${changedParts.join("، ")}]`
      : `Edited by employee. Changes: [${changedPartsEn.join(", ")}]`;

    const newLogs = [
      {
        status: editingFeedback.status,
        comment: changelogMessage,
        personalCode: userLogin?.personalCode,
      },
    ];

    const postData = {
      id: editingFeedback.id,
      title: editTitle.trim(),
      feedbackCategoryId: editCategory,
      type: editType,
      description: editDescription.trim(),
      logs: newLogs,
    };

    try {
      const res = await updateFeedback(postData);
      console.log("resresres", res);
      if (!!res?.data?.feedbackId) {
        setShowEditModal(false);
        setEditingFeedback(null);
        fetchFeedback();
      } else {
        setEditError(isRtl ? "عدم ویرایش" : "Connection error");
      }
    } catch (err) {
      console.error("Error editing feedback:", err);
      setEditError(
        isRtl ? "خطا در برقراری ارتباط با سرور" : "Connection error",
      );
    }
  };

  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [role, activeTab, filterCategory, filterStatus, filterType, searchQuery]);

  const getCategoryLabel = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return catId;
    return isRtl ? cat.fa : cat.en;
  };

  const formatPersianDate = (dateStr: string) => {
    try {
      if (!dateStr) return "";
      const isoStr = dateStr.trim().replace(" ", "T");
      const date = new Date(isoStr);
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  const handleExportExcel = () => {
    const headers = isRtl
      ? [
          "کد پیگیری",
          "نوع",
          "عنوان",
          "حوزه / دپارتمان",
          "نام فرستنده",
          "کد پرسنلی",
          "شرح درخواست",
          "فایل ضمیمه",
          "وضعیت فعلی",
          "تاریخ ایجاد",
          "پاسخ و کامنت مدیریت",
          "تاریخچه و تایم‌لاین تغییرات",
        ]
      : [
          "Tracking ID",
          "Type",
          "Title",
          "Category/Department",
          "Submitter Name",
          "Employee ID",
          "Description",
          "Attachment",
          "Current Status",
          "Creation Date",
          "Manager Feedback",
          "History & Logs Timeline",
        ];

    const rows = feedbackList.map((item: any) => {
      const typeLabel =
        item?.type === "suggestion"
          ? isRtl
            ? "پیشنهاد"
            : "Suggestion"
          : isRtl
            ? "انتقاد"
            : "Critic";

      const categoryLabel = item?.category?.fa;

      const statusLabel =
        item?.status === "submitted"
          ? isRtl
            ? "ثبت اولیه"
            : "Submitted"
          : item?.status === "under_review"
            ? isRtl
              ? "در دست بررسی"
              : "Under Review"
            : item?.status === "approved"
              ? isRtl
                ? "تأیید شده"
                : "Approved"
              : isRtl
                ? "رد شده"
                : "Rejected";

      // Format logs timeline in a single string
      const logsTimeline = item?.logs
        .map((log, index) => {
          const logStatusLabel =
            log.status === "submitted"
              ? isRtl
                ? "ثبت اولیه"
                : "Submitted"
              : log.status === "under_review"
                ? isRtl
                  ? "در دست بررسی"
                  : "Under Review"
                : log.status === "approved"
                  ? isRtl
                    ? "تأیید شده"
                    : "Approved"
                  : isRtl
                    ? "رد شده"
                    : "Rejected";

          return `${index + 1}) [${formatPersianDate(log.date)}] - ${logStatusLabel}${log.comment ? `: ${log.comment}` : ""}`;
        })
        .join(" | ");

      const clean = (value: unknown) => {
        if (value === null || value === undefined) return "";
        const text = String(value);
        return `"${text.replace(/"/g, '""')}"`;
      };

      return [
        clean(item?.id),
        clean(typeLabel),
        clean(item?.title),
        clean(categoryLabel),
        clean(item?.userName),
        clean(item?.personalCode),
        clean(item?.description),
        clean(item?.attachmentName || (isRtl ? "ندارد" : "None")),
        clean(statusLabel),
        clean(formatPersianDate(item?.createdAt)),
        clean(item?.managerComment || ""),
        clean(logsTimeline),
      ];
    });

    const csvContent = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `PersiaKhodro_Feedback_Export_${new Date().toISOString().substring(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setAttachment(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    const formData = new FormData();
    if (attachment) {
      formData.append("FormFiles", attachment);
    }
    formData.append("AttachmentType", "feedback");
    const resAttachment = await addAttachment(formData);
    console.log("category", category);

    const postData: any = {
      title,
      feedbackCategoryId: category,
      AttachmentId: resAttachment?.data?.result?.[0]?.attachmentId,
      // category,
      type,
      description,
      status: "submitted",
      logs: [
        {
          personalCode: userLogin?.personalCode,
          status: "submitted",
          comment: isRtl
            ? "درخواست جدید با موفقیت ثبت گردید."
            : "New request successfully registered.",
        },
      ],
      personalCode: userLogin?.personalCode,
    };

    const resCompanyNews = await createFeedback(postData);

    setFeedbackList((prev) => [postData, ...prev]);

    setTitle("");
    setDescription("");
    setAttachment(null);
    setShowSuccessToast(true);

    setTimeout(() => {
      setShowSuccessToast(false);
      setActiveTab("history");
    }, 2500);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedback) return;

    const dateStr = new Date().toISOString().replace("T", " ").substring(0, 16);
    const statusLogsMap = {
      submitted: isRtl
        ? "بازگشت وضعیت به ثبت اوليه"
        : "Status reverted to Submitted",
      under_review: isRtl
        ? "تغییر وضعیت به در دست بررسی"
        : "Status changed to Under Review",
      approved: isRtl ? "طرح مورد تأیید نهایی قرار گرفت" : "Proposal Approved",
      rejected: isRtl ? "درخواست یا پیشنهاد رد شد" : "Proposal Rejected",
    };

    const newLogs = [
      {
        status: newStatus,
        comment: statusComment || statusLogsMap[newStatus],
        personalCode: userLogin?.personalCode,
      },
    ];

    const managerComment =
      statusComment || selectedFeedback.managerComment || "";

    const updated: any = feedbackList.map((item) => {
      if (item?.id === selectedFeedback.id) {
        return {
          ...item,
          status: newStatus,
          managerComment: managerComment,
          logs: newLogs,
        };
      }
      return item;
    });

    setFeedbackList(updated);
    const postData = {
      id: selectedFeedback.id,
      status: newStatus,
      managerComment: managerComment,
      logs: newLogs,
    };

    try {
      const response = await updateStatusManager(postData);

      if (response?.data?.code !== 0) {
        console.error("Failed to update status in PostgreSQL database");
      } else {
        fetchFeedback();
      }
    } catch (err) {
      console.error("Error updating feedback status in backend:", err);
    }

    setSelectedFeedback(null);
    setStatusComment("");
  };

  const getStatusBadge = (status: FeedbackItem["status"]) => {
    const styles = {
      submitted: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
      under_review: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
      approved:
        "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
      rejected: "bg-rose-500/10 text-rose-500 border border-rose-500/20",
    };

    const faLabels = {
      submitted: "ثبت شده",
      under_review: "در دست بررسی",
      approved: "تأیید شده",
      rejected: "رد شده",
    };

    const enLabels = {
      submitted: "Submitted",
      under_review: "Under Review",
      approved: "Approved",
      rejected: "Rejected",
    };

    return (
      <span
        className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${styles[status]}`}
      >
        {isRtl ? faLabels[status] : enLabels[status]}
      </span>
    );
  };

  const filteredList = feedbackList.filter((item) => {
    console.log(typeof item?.category?.id, typeof filterCategory);

    const matchesCategory =
      filterCategory === "all" || item?.category?.id === Number(filterCategory);
    const matchesStatus =
      filterStatus === "all" || item?.status === filterStatus;
    const matchesType = filterType === "all" || item?.type === filterType;

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      item?.title.toLowerCase().includes(query) ||
      item?.description.toLowerCase().includes(query) ||
      item?.userName.toLowerCase().includes(query) ||
      item?.personalCode.toLowerCase().includes(query) ||
      (item?.managerComment &&
        item?.managerComment.toLowerCase().includes(query));
    return matchesCategory && matchesStatus && matchesType && matchesSearch;
  });

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-bmw-border pb-6">
        <div className="text-start">
          <h1 className="text-2xl font-black text-bmw-text flex items-center gap-3">
            <div className="p-2 bg-bmw-blue/10 text-bmw-blue rounded-xl border border-bmw-blue/20">
              <Lightbulb size={24} className="animate-pulse" />
            </div>
            {isRtl
              ? "نظام پیشنهادها و انتقادات همکاران"
              : "Suggestions & Feedback System"}
          </h1>
          <p className="text-bmw-textSec text-sm mt-2 font-medium">
            {isRtl
              ? "بستری برای مشارکت فعال همکاران پرشیا خودرو در جهت ارتقای فرآیندها و بهبود مستمر محیط کاری."
              : "A platform for active participation of Persia Khodro staff to improve processes and workplace environment."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-bmw-surface p-1 rounded-xl border border-bmw-border flex gap-1 shadow-inner">
            <button
              onClick={() => {
                setRole("employee");
                setExpandedId(null);
                if (activeTab === "categories") setActiveTab("submit");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${role === "employee" ? "bg-bmw-blue text-white shadow" : "text-bmw-textSec hover:text-bmw-text"}`}
            >
              <UserCheck size={14} />
              <span>{isRtl ? "نمای همکار" : "Employee View"}</span>
            </button>
            {hasPermission("Feedback.Show") && (
              <button
                onClick={() => {
                  setRole("manager");
                  setExpandedId(null);
                  setActiveTab("history");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${role === "manager" ? "bg-amber-600 text-white shadow" : "text-bmw-textSec hover:text-bmw-text"}`}
              >
                <ShieldAlert size={14} />
                <span>{isRtl ? "نمای مدیر ارشد" : "Manager View"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Navigation & Info Sidebar */}
        <div className="lg:col-span-3 col-span-12 flex flex-col gap-4">
          <div className="bg-bmw-surface border border-bmw-border rounded-xl p-4 shadow-sm text-start">
            <h3 className="text-xs font-bold text-bmw-textSec uppercase tracking-wider mb-3">
              {isRtl ? "منوی ناوبری" : "Navigation Menu"}
            </h3>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setActiveTab("submit")}
                className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all text-start cursor-pointer ${
                  activeTab === "submit"
                    ? "bg-bmw-blue text-white shadow"
                    : "text-bmw-textSec hover:bg-bmw-hover hover:text-bmw-text"
                }`}
              >
                <Plus size={16} />
                <span>
                  {isRtl ? "ثبت ایده یا انتقاد جدید" : "Submit New Proposal"}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all text-start cursor-pointer ${
                  activeTab === "history"
                    ? "bg-bmw-blue text-white shadow"
                    : "text-bmw-textSec hover:bg-bmw-hover hover:text-bmw-text"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <History size={16} />
                  <span>
                    {isRtl
                      ? "تاریخچه و رهگیری درخواست‌ها"
                      : "Track Status & History"}
                  </span>
                </div>
                <span className="bg-bmw-base text-bmw-text border border-bmw-border px-2 py-0.5 rounded-md text-[10px]">
                  {feedbackList.length}
                  {/* {role === "employee"
                    ? feedbackList.filter(
                        (item) => item?.userEmployeeId === "PK-1024",
                      ).length
                    : feedbackList.length} */}
                </span>
              </button>
              {hasPermission("Feedback.Show") && (
                <button
                  type="button"
                  onClick={() => setActiveTab("categories")}
                  className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all text-start cursor-pointer ${
                    activeTab === "categories"
                      ? "bg-amber-600 text-white shadow"
                      : "text-bmw-textSec hover:bg-bmw-hover hover:text-bmw-text"
                  }`}
                >
                  <Filter size={16} />
                  <span>
                    {isRtl
                      ? "مدیریت دپارتمان‌ها و حوزه‌ها"
                      : "Manage Departments/Areas"}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-bmw-surface/50 border border-bmw-border rounded-xl p-5 shadow-sm text-start">
            <h3 className="text-xs font-black text-bmw-text mb-2.5 flex items-center gap-2">
              <span>ℹ️</span>
              {isRtl ? "راهنمای ثبت ایده" : "Proposal Guide"}
            </h3>
            <ul className="text-[11px] text-bmw-textSec space-y-2.5 list-disc list-inside">
              <li>
                {isRtl
                  ? "پیشنهادها باید شفاف، مشخص و دارای ابعاد اجرایی باشند."
                  : "Suggestions should be clear and realistic to execute."}
              </li>
              <li>
                {isRtl
                  ? "ثبت انتقادها باید با رعایت اخلاق حرفه‌ای و ارائه راهکار پیشنهادی همراه باشد."
                  : "Critiques should remain constructive and suggest solutions."}
              </li>
              <li>
                {isRtl
                  ? "در صورت نیاز به بررسی عمیق‌تر، مستندات مرتبط را ضمیمه کنید."
                  : "Attach any research, slides, or PDF if deeper analysis is needed."}
              </li>
              <li>
                {isRtl
                  ? "وضعیت‌های پیشنهادها شما لحظه به لحظه از دپارتمان مربوطه قابل پیگیری است."
                  : "Track the review pipeline and manager actions directly in real time."}
              </li>
            </ul>
          </div>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-9 col-span-12 space-y-6">
          {activeTab === "submit" ? (
            /* Submission Form Form */
            <div className="bg-bmw-surface border border-bmw-border rounded-2xl p-6 md:p-8 shadow-sm text-start">
              <div className="border-b border-bmw-border pb-4 mb-6">
                <h2 className="text-lg font-extrabold text-bmw-text">
                  {isRtl
                    ? "ثبت پیشنهاد یا انتقاد سازنده جدید"
                    : "Register a New Constructive Idea / Critique"}
                </h2>
                <p className="text-xs text-bmw-textSec mt-1">
                  {isRtl
                    ? "لطفاً فرم زیر را پر کرده و دپارتمان مربوطه را انتخاب کنید."
                    : "Please fill the details below and select the relevant department."}
                </p>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setType("suggestion")}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-center gap-1.5 cursor-pointer ${
                      type === "suggestion"
                        ? "bg-bmw-blue/10 border-bmw-blue text-bmw-blue"
                        : "bg-bmw-base border-bmw-border text-bmw-textSec hover:border-bmw-text/30"
                    }`}
                  >
                    <Lightbulb size={20} />
                    <span className="text-xs font-bold">
                      {isRtl ? "پیشنهاد و نوآوری" : "Suggestion & Innovation"}
                    </span>
                  </button>
                  {/* <button
                    type="button"
                    onClick={() => setType("critic")}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-center gap-1.5 cursor-pointer ${
                      type === "critic"
                        ? "bg-amber-600/10 border-amber-600 text-amber-500"
                        : "bg-bmw-base border-bmw-border text-bmw-textSec hover:border-bmw-text/30"
                    }`}
                  >
                    <AlertCircle size={20} />
                    <span className="text-xs font-bold">
                      {isRtl
                        ? "انتقاد سازنده و بهبود"
                        : "Constructive Criticism"}
                    </span>
                  </button> */}
                  <button
                    type="button"
                    disabled
                    onClick={() => setType("critic")}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-center gap-1.5
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    ${
      type === "critic"
        ? "bg-amber-600/10 border-amber-600 text-amber-500"
        : "bg-bmw-base border-bmw-border text-bmw-textSec hover:border-bmw-text/30"
    }`}
                  >
                    <AlertCircle size={20} />
                    <span className="text-xs font-bold">
                      {isRtl
                        ? "انتقاد سازنده و بهبود"
                        : "Constructive Criticism"}
                    </span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-bmw-textSec mb-2 uppercase tracking-wider">
                    {isRtl ? "عنوان موضوع" : "Subject Title"}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      isRtl
                        ? "مثال: بهینه‌سازی فرآیند ترخیص خودرو"
                        : "e.g. Speeding up car delivery process"
                    }
                    className="w-full bg-bmw-base border border-bmw-border rounded-xl p-3.5 text-xs text-bmw-text focus:border-bmw-blue focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-bmw-textSec mb-2 uppercase tracking-wider">
                    {isRtl
                      ? "حوزه و دپارتمان مرتبط"
                      : "Relevant Area / Department"}
                  </label>
                  <select
                    value={category?.id}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-bmw-base border border-bmw-border rounded-xl p-3.5 text-xs text-bmw-text focus:border-bmw-blue focus:outline-none appearance-none cursor-pointer"
                  >
                    {categories
                      ?.filter((c: any) => !c.isDeleted)
                      ?.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {isRtl ? cat.fa : cat.en}
                        </option>
                      ))}
                  </select>
                  {/* <ComboBox
                  keyId="id"
                  keyValue="fa" 
                  options={categories}
                  value={category}
                  onChange={setCategory}
                  /> */}
                </div>

                {/* Detailed Description */}
                <div>
                  <label className="block text-xs font-bold text-bmw-textSec mb-2 uppercase tracking-wider">
                    {isRtl
                      ? "شرح و جزئیات اجرایی"
                      : "Description & Operational Details"}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      isRtl
                        ? "لطفاً جزئیات، مشکلات فعلی و راه‌حل پیشنهادی خود را با دقت شرح دهید..."
                        : "Describe the background, issue, and proposed solution..."
                    }
                    className="w-full bg-bmw-base border border-bmw-border rounded-xl p-3.5 text-xs text-bmw-text focus:border-bmw-blue focus:outline-none transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* Drag and Drop File Attachment */}
                <div>
                  <label className="block text-xs font-bold text-bmw-textSec mb-2 uppercase tracking-wider">
                    {isRtl
                      ? "ضمیمه فایل یا سند پشتیبان (اختیاری)"
                      : "Attachment or Support Document (Optional)"}
                  </label>

                  {!attachment ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2.5 ${
                        dragActive
                          ? "border-bmw-blue bg-bmw-blue/10 scale-[0.99]"
                          : "border-bmw-border hover:border-bmw-blue/40 bg-bmw-base/50"
                      }`}
                    >
                      <Paperclip className="text-bmw-textSec w-7 h-7" />
                      <div className="space-y-1">
                        <p className="text-xs text-bmw-text font-bold">
                          {isRtl
                            ? "فایل را به اینجا بکشید یا دکمه زیر را بزنید"
                            : "Drag file here or select"}
                        </p>
                        <p className="text-[10px] text-bmw-textSec">
                          {isRtl
                            ? "فرمت‌های مجاز: PDF, Images, Word تا سقف ۵ مگابایت"
                            : "Supported format: PDF, Images, Word up to 5MB"}
                        </p>
                      </div>
                      <label className="inline-flex items-center px-4 py-2 bg-bmw-hover hover:bg-bmw-base border border-bmw-border text-[11px] font-bold text-bmw-text rounded-lg cursor-pointer transition-colors mt-2">
                        <span>{isRtl ? "انتخاب فایل" : "Choose File"}</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="bg-bmw-base border border-bmw-border rounded-xl p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-bmw-blue/10 text-bmw-blue rounded-lg">
                          <FileText size={18} />
                        </div>
                        <div className="text-start">
                          <p className="text-xs font-bold text-bmw-text truncate max-w-[200px] md:max-w-[400px]">
                            {attachment.name}
                          </p>
                          <p className="text-[10px] text-bmw-textSec">
                            {(attachment.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeAttachment}
                        className="p-1.5 rounded-md hover:bg-red-500/10 text-bmw-textSec hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 bg-bmw-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/40 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Send size={15} />
                    <span>
                      {isRtl
                        ? "ارسال و ثبت نهایی پیشنهاد"
                        : "Submit Final Proposal"}
                    </span>
                  </button>
                </div>
              </form>

              {/* Custom Success Toast */}
              {showSuccessToast && (
                <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[350px] z-50 bg-emerald-500 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
                  <div className="p-1 bg-white/20 rounded-full shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="text-start">
                    <p className="text-xs font-bold">
                      {isRtl ? "ثبت موفقیت‌آمیز!" : "Registered Successfully!"}
                    </p>
                    <p className="text-[10px] opacity-90 mt-0.5">
                      {isRtl
                        ? "پیشنهاد یا انتقاد شما با موفقیت در سیستم ثبت گردید."
                        : "Your proposal/critique is stored in the portal."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === "categories" ? (
            <div className="space-y-6">
              <div className="bg-bmw-surface border border-bmw-border rounded-2xl p-6 md:p-8 shadow-sm text-start">
                <div className="border-b border-bmw-border pb-4 mb-6">
                  <h2 className="text-lg font-extrabold text-bmw-text flex items-center gap-2">
                    <span className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
                      <Filter size={18} />
                    </span>
                    <span>
                      {isRtl
                        ? "افزودن دپارتمان یا حوزه جدید مرتبط"
                        : "Add New Department or Relevant Area"}
                    </span>
                  </h2>
                  <p className="text-xs text-bmw-textSec mt-1">
                    {isRtl
                      ? "دپارتمان یا حوزه‌های جدید را برای استفاده در فرم‌های پیشنهاد همکاران ثبت کنید."
                      : "Register new departments or operational areas to be selected by employees."}
                  </p>
                </div>

                <form onSubmit={handleAddCategory} className="space-y-5">
                  {catError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 font-medium">
                      ⚠️ {catError}
                    </div>
                  )}
                  {catSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-500 font-medium">
                      ✅ {catSuccess}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* <div>
                      <label className="block text-xs font-bold text-bmw-textSec mb-2 uppercase tracking-wider">
                        {isRtl
                          ? "شناسه یکتا (انگلیسی/لاتین)"
                          : "Unique ID (English)"}{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newCatId}
                        onChange={(e) => setNewCatId(e.target.value)}
                        placeholder="e.g. finance"
                        className="w-full bg-bmw-base border border-bmw-border rounded-xl p-3.5 text-xs text-bmw-text focus:border-bmw-blue focus:outline-none transition-colors"
                      />
                      <p className="text-[10px] text-bmw-textSec mt-2">
                        {isRtl
                          ? "فاصله‌ها به خط تیره (-) تبدیل می‌شوند."
                          : "Spaces will be converted to hyphens (-)."}
                      </p>
                    </div> */}
                    <div>
                      <label className="block text-xs font-bold text-bmw-textSec mb-2 uppercase tracking-wider">
                        {isRtl ? "عنوان فارسی حوزه" : "Persian Title"}{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newCatFa}
                        onChange={(e) => setNewCatFa(e.target.value)}
                        placeholder="مثال: امور مالی و بودجه"
                        className="w-full bg-bmw-base border border-bmw-border rounded-xl p-3.5 text-xs text-bmw-text focus:border-bmw-blue focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-bmw-textSec mb-2 uppercase tracking-wider">
                        {isRtl ? "عنوان انگلیسی حوزه" : "English Title"}{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newCatEn}
                        onChange={(e) => setNewCatEn(e.target.value)}
                        placeholder="e.g. Finance & Budget"
                        className="w-full bg-bmw-base border border-bmw-border rounded-xl p-3.5 text-xs text-bmw-text focus:border-bmw-blue focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                    >
                      {isRtl
                        ? "ثبت و ذخیره حوزه در دیتابیس"
                        : "Save Area to Database"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Categories List */}
              <div className="bg-bmw-surface border border-bmw-border rounded-2xl p-6 md:p-8 shadow-sm text-start">
                <h3 className="text-sm font-black text-bmw-text mb-4">
                  {isRtl
                    ? "لیست دپارتمان‌ها و حوزه‌های موجود در دیتابیس"
                    : "Existing Departments / Areas in Database"}
                </h3>

                <div className="border border-bmw-border rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-start border-collapse">
                    <thead>
                      <tr className="bg-bmw-base text-bmw-textSec font-bold border-b border-bmw-border">
                        <th className="p-3 text-start">
                          کد
                          {/* {isRtl ? "شناسه یکتا" : "Unique ID"} */}
                        </th>
                        <th className="p-3 text-start">
                          {isRtl ? "نام فارسی دپارتمان" : "Persian Name"}
                        </th>
                        <th className="p-3 text-start">
                          {isRtl ? "نام انگلیسی دپارتمان" : "English Name"}
                        </th>
                        <th className="p-3 text-center w-24">
                          {isRtl ? "عملیات" : "Actions"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-bmw-border">
                      {categories?.map((cat: any) => (
                        <tr
                          key={cat.id}
                          className={`hover:bg-bmw-hover transition-colors text-bmw-text ${cat.isDeleted ? "opacity-60 bg-red-500/5" : ""}`}
                        >
                          <td className="p-3 font-mono text-[11px] flex items-center gap-1.5">
                            {cat.id}
                            {cat.isDeleted && (
                              <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-[9px] font-bold">
                                {isRtl ? "حذف منطقی شده" : "Logically Deleted"}
                              </span>
                            )}
                          </td>
                          <td
                            className={`p-3 font-semibold ${cat.isDeleted ? "line-through text-bmw-textSec" : ""}`}
                          >
                            {cat.fa}
                          </td>
                          <td
                            className={`p-3 text-bmw-textSec ${cat.isDeleted ? "line-through" : ""}`}
                          >
                            {cat.en}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {!cat.isDeleted ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenEditCategoryModal(cat)
                                    }
                                    className="px-2 py-1 text-[10px] font-bold text-amber-500 hover:bg-amber-500/10 rounded border border-amber-500/20 hover:border-amber-500/40 transition-colors cursor-pointer"
                                  >
                                    {isRtl ? "ویرایش" : "Edit"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleTriggerDeleteCategory(cat)
                                    }
                                    className="px-2 py-1 text-[10px] font-bold text-rose-500 hover:bg-rose-500/10 rounded border border-rose-500/20 hover:border-rose-500/40 transition-colors cursor-pointer"
                                  >
                                    {isRtl ? "حذف" : "Delete"}
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleRestoreCategory(cat.id)}
                                  className="px-2 py-1 text-[10px] font-bold text-emerald-500 hover:bg-emerald-500/10 rounded border border-emerald-500/20 hover:border-emerald-500/40 transition-colors cursor-pointer"
                                >
                                  {isRtl ? "بازیابی" : "Restore"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 ">
              <div className="bg-bmw-surface border border-bmw-border rounded-xl shadow-sm">
                <div className=" border-b border-gray-200  p-4 flex-row lg:flex gap-4 items-center text-start">
                  <div className="flex items-center gap-2">
                    <Search size={16} className="text-bmw-blue shrink-0" />
                    <span className="text-xs font-bold text-bmw-text">
                      {isRtl
                        ? "جستجو در پیشنهادها و انتقادات:"
                        : "Search Proposals & Critiques:"}
                    </span>
                  </div>
                  <div className="relative w-full sm:max-w-md">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        isRtl
                          ? "بر اساس کد پیگیری، عنوان، متن پیشنهاد، نام همکار و..."
                          : "By tracker ID, title, details, staff name..."
                      }
                      className={`w-full bg-bmw-base border border-bmw-border rounded-lg py-2 text-xs text-bmw-text focus:border-bmw-blue focus:outline-none transition-all placeholder:text-bmw-textSec/60 ${
                        isRtl
                          ? "pl-9 pr-3.5 text-right"
                          : "pr-9 pl-3.5 text-left"
                      }`}
                    />
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className={`absolute top-1/2 -translate-y-1/2 p-1 text-bmw-textSec hover:text-bmw-text rounded-md transition-colors ${
                          isRtl ? "left-2.5" : "right-2.5"
                        }`}
                      >
                        <X size={14} />
                      </button>
                    ) : (
                      <Search
                        className={`absolute top-1/2 -translate-y-1/2 text-bmw-textSec/70 w-3.5 h-3.5 pointer-events-none ${
                          isRtl ? "left-3" : "right-3"
                        }`}
                      />
                    )}
                  </div>
                </div>
                {searchQuery && (
                  <div className="flex m-4 items-center justify-between text-[11px] text-bmw-textSec px-1">
                    <span>
                      {isRtl
                        ? `نتایج یافت شده: ${filteredList.length} مورد منطبق بر "${searchQuery}"`
                        : `Found ${filteredList.length} items matching "${searchQuery}"`}
                    </span>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-bmw-blue hover:underline font-bold text-[11px]"
                    >
                      {isRtl ? "حذف فیلتر متنی" : "Clear Search Query"}
                    </button>
                  </div>
                )}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-start ">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter size={15} className="text-bmw-blue" />
                      <span className="text-xs font-bold text-bmw-text">
                        {isRtl
                          ? "فیلتر کردن موارد تاریخچه:"
                          : "Filter History Items:"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div>
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="bg-bmw-base border border-bmw-border text-[11px] rounded-lg p-2 text-bmw-text focus:outline-none cursor-pointer"
                        >
                          <option value="all">
                            {isRtl ? "همه حوزه‌ها" : "All Areas"}
                          </option>
                          {categories
                            .filter((c) => !c.is_deleted)
                            .map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {isRtl ? cat.fa : cat.en}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="bg-bmw-base border border-bmw-border text-[11px] rounded-lg p-2 text-bmw-text focus:outline-none cursor-pointer"
                        >
                          <option value="all">
                            {isRtl ? "همه وضعیت‌ها" : "All Statuses"}
                          </option>
                          <option value="submitted">
                            {isRtl ? "ثبت شده" : "Submitted"}
                          </option>
                          <option value="under_review">
                            {isRtl ? "در دست بررسی" : "Under Review"}
                          </option>
                          <option value="approved">
                            {isRtl ? "تأیید شده" : "Approved"}
                          </option>
                          <option value="rejected">
                            {isRtl ? "رد شده" : "Rejected"}
                          </option>
                        </select>
                      </div>

                      <div>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="bg-bmw-base border border-bmw-border text-[11px] rounded-lg p-2 text-bmw-text focus:outline-none cursor-pointer"
                        >
                          <option value="all">
                            {isRtl ? "همه انواع" : "All Types"}
                          </option>
                          <option value="suggestion">
                            {isRtl ? "پیشنهاد" : "Suggestion"}
                          </option>
                          <option value="critic">
                            {isRtl ? "انتقاد" : "Critique"}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {hasPermission("Feedback.Show") && (
                    <button
                      type="button"
                      onClick={handleExportExcel}
                      className="flex items-center gap-2 px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0"
                    >
                      <Download size={14} />
                      <span>
                        {isRtl
                          ? "خروجی اکسل (با جزئیات)"
                          : "Export Excel (Detailed)"}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {filteredList.length === 0 && (
                <div className="bg-bmw-surface border border-bmw-border rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2">
                  <span className="text-3xl">📭</span>
                  <p className="text-xs font-bold text-bmw-text mt-2">
                    {isRtl
                      ? "هیچ پیشنهادی یا انتقادی یافت نشد."
                      : "No suggestions or critiques found."}
                  </p>
                  <p className="text-[10px] text-bmw-textSec">
                    {isRtl
                      ? "با استفاده از منوی ناوبری سمت چپ می‌توانید اولین پیشنهاد خود را ثبت کنید."
                      : "You can submit your first idea using the left navigation."}
                  </p>
                </div>
              )}

              {paginatedList.map((item: any) => {
                const isExpanded = expandedId === item?.id;
                console.log("item", item);

                return (
                  <div
                    key={item?.id}
                    className={`rounded-xl overflow-hidden transition-all shadow-sm relative ${
                      item?.isDeleted
                        ? "border-2 border-dashed border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10"
                        : "bg-bmw-surface border border-bmw-border hover:border-bmw-blue/20"
                    }`}
                  >
                    <div
                      onClick={() =>
                        setExpandedId(isExpanded ? null : item?.id)
                      }
                      className="p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-bmw-hover transition-colors text-start"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-mono text-bmw-textSec font-bold tracking-wider">
                            {item?.id}
                          </span>
                          <span className="text-[10px] bg-bmw-base border border-bmw-border text-bmw-text px-2 py-0.5 rounded-md font-medium">
                            {item?.category?.fa}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                              item?.type === "suggestion"
                                ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                : "bg-amber-600/10 text-amber-500 border border-amber-600/20"
                            }`}
                          >
                            {item?.type === "suggestion"
                              ? isRtl
                                ? "پیشنهاد"
                                : "Suggestion"
                              : isRtl
                                ? "انتقاد سازنده"
                                : "Critique"}
                          </span>
                          {item?.isDeleted && (
                            <span className="text-[10px] bg-rose-600/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-md font-extrabold">
                              {isRtl ? "حذف منطقی شده" : "Logically Deleted"}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-extrabold text-bmw-text truncate leading-snug">
                          {item?.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-bmw-textSec mt-1">
                          <Calendar size={11} />
                          <span>{formatPersianDate(item?.createdAt)}</span>
                          {role === "manager" && (
                            <>
                              <span className="mx-1">•</span>
                              <span>
                                {isRtl
                                  ? `توسط: ${item?.userName} (${item?.personalCode})`
                                  : `By: ${item?.userName} (${item?.personalCode})`}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 select-none">
                        {getStatusBadge(item?.status)}
                        <div>
                          {isExpanded ? (
                            <ChevronUp size={16} className="text-bmw-textSec" />
                          ) : (
                            <ChevronDown
                              size={16}
                              className="text-bmw-textSec"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-bmw-border bg-bmw-base/20 text-start space-y-4">
                        <div className="space-y-1.5">
                          <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
                            {isRtl
                              ? "شرح کامل درخواست:"
                              : "Complete Description:"}
                          </h4>
                          <p className="text-xs text-bmw-text leading-relaxed whitespace-pre-line font-medium">
                            {item?.description}
                          </p>
                        </div>

                        {/* {item?.attachment && (
                          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-bmw-surface border border-bmw-border rounded-lg text-xs">
                            <FileText size={14} className="text-bmw-blue" />
                            <span className="font-bold text-bmw-text text-[11px]">
                              {item?.attachmentName}
                            </span>
                            <span className="text-[10px] text-bmw-textSec">
                              (PDF / 1.2 MB)
                            </span>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded">
                              ✓ {isRtl ? "پیوست شد" : "Attached"}
                            </span>
                          </div>
                        )} */}

                        {item?.managerComment && (
                          <div className="p-4 bg-bmw-surface border border-bmw-border rounded-xl space-y-2 relative overflow-hidden">
                            <div className="absolute top-0 right-0 h-1 w-20 bg-amber-500" />
                            <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                              <MessageSquare size={13} />
                              <span>
                                {isRtl
                                  ? "پاسخ و نظر مدیریت سرمایه انسانی:"
                                  : "Human Capital Management Response:"}
                              </span>
                            </div>
                            <p className="text-xs text-bmw-text leading-relaxed leading-relaxed whitespace-pre-line font-medium">
                              {item?.managerComment}
                            </p>
                          </div>
                        )}

                        {/* Interactive Timeline of States */}
                        <div className="space-y-3 pt-3 border-t border-bmw-border/50">
                          <h4 className="text-[11px] font-bold text-bmw-textSec uppercase tracking-wider flex items-center gap-1.5">
                            <Clock size={13} className="text-bmw-blue" />
                            <span>
                              {isRtl
                                ? "مراحل و روند تغییر وضعیت (تایم‌لاین):"
                                : "Status Transition Timeline Log:"}
                            </span>
                          </h4>

                          <div className="relative border-r border-bmw-border/80 mr-2.5 rtl:mr-2.5 ltr:ml-2.5 ltr:border-l space-y-4 pt-1">
                            {item?.logs?.map((log, lIdx) => {
                              const isLast = lIdx === item?.logs?.length - 1;
                              const statusStyles = {
                                submitted:
                                  "bg-blue-500 border-blue-500/20 text-blue-500",
                                under_review:
                                  "bg-amber-500 border-amber-500/20 text-amber-500",
                                approved:
                                  "bg-emerald-500 border-emerald-500/20 text-emerald-500",
                                rejected:
                                  "bg-rose-500 border-rose-500/20 text-rose-500",
                              };

                              const faStateName = {
                                submitted: "ثبت اولیه پیشنهاد",
                                under_review:
                                  "ارجاع به کارشناس ارزیاب و در دست بررسی",
                                approved: "تأیید نهایی و ارجاع جهت اجرا",
                                rejected: "بررسی ایده و رد طرح",
                              };

                              const enStateName = {
                                submitted: "Initial submission registered",
                                under_review: "Assigned & Under active review",
                                approved: "Approved & Passed for action",
                                rejected: "Closed & Rejected",
                              };

                              return (
                                <div
                                  key={lIdx}
                                  className="relative pr-6 rtl:pr-6 ltr:pl-6 pb-1"
                                >
                                  <span
                                    className={`absolute right-[-6.5px] top-1 rtl:right-[-6.5px] ltr:left-[-6.5px] flex h-3.5 w-3.5 items-center justify-center rounded-full bg-bmw-surface border-2 ${
                                      isLast
                                        ? "border-bmw-blue shadow-lg shadow-blue-500/30"
                                        : "border-bmw-border"
                                    }`}
                                  >
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${isLast ? "bg-bmw-blue animate-ping" : "bg-bmw-textSec"}`}
                                    />
                                  </span>

                                  <div className="bg-bmw-base/50 border border-bmw-border rounded-lg p-3">
                                    <div className="flex sm:flex-row sm:items-start justify-between gap-1.5 mb-1 text-xs">
                                      <span className="font-extrabold text-bmw-text">
                                        {isRtl
                                          ? faStateName[log.status]
                                          : enStateName[log.status]}
                                      </span>
                                      <span className="text-[10px] text-bmw-textSec font-mono">
                                        {formatPersianDate(log.date)}
                                      </span>
                                    </div>
                                    {log.comment && (
                                      <p className="text-[11px] text-bmw-textSec font-medium mt-0.5 leading-relaxed">
                                        {log.comment}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="pt-4 border-t border-bmw-border/50 flex flex-wrap items-center justify-end gap-2.5">
                          {/* Employee Edit Button */}
                          {role === "employee" &&
                            item?.status === "submitted" && (
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(item)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <Edit3 size={13} />
                                <span>
                                  {isRtl
                                    ? "ویرایش جزئیات درخواست"
                                    : "Edit Submission Details"}
                                </span>
                              </button>
                            )}

                          {/* Manager Buttons */}
                          {role === "manager" && (
                            <>
                              {item?.isDeleted ? (
                                <button
                                  type="button"
                                  onClick={() => handleRestoreFeedback(item)}
                                  className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                                >
                                  <RotateCcw size={13} />
                                  <span>
                                    {isRtl
                                      ? "برگشت از حذف منطقی (بازگردانی)"
                                      : "Restore Proposal"}
                                  </span>
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLogicalDeleteTarget(item);
                                      setShowLogicalDeleteDialog(true);
                                    }}
                                    className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/20 hover:border-rose-500 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Trash2 size={13} />
                                    <span>
                                      {isRtl ? "حذف منطقی" : "Logical Delete"}
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedFeedback(item);
                                      setNewStatus(item?.status);
                                      setStatusComment(
                                        item?.managerComment || "",
                                      );
                                    }}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <ShieldAlert size={13} />
                                    <span>
                                      {isRtl
                                        ? "بررسی و تغییر وضعیت درخواست"
                                        : "Review & Adjust Status"}
                                    </span>
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border border-bmw-border bg-bmw-surface rounded-xl p-4 mt-2 shadow-sm text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-bmw-border bg-bmw-base text-bmw-text hover:bg-bmw-hover disabled:opacity-50 transition-colors flex items-center gap-1.5 font-bold cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isRtl ? (
                      <ChevronRight size={14} />
                    ) : (
                      <ChevronLeft size={14} />
                    )}
                    <span>{isRtl ? "قبلی" : "Previous"}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold border transition-colors cursor-pointer ${
                            currentPage === pageNum
                              ? "bg-bmw-blue border-bmw-blue text-white shadow shadow-blue-500/20"
                              : "border-bmw-border bg-bmw-base text-bmw-text hover:bg-bmw-hover"
                          }`}
                        >
                          {pageNum.toLocaleString(isRtl ? "fa-IR" : "en-US")}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-bmw-border bg-bmw-base text-bmw-text hover:bg-bmw-hover disabled:opacity-50 transition-colors flex items-center gap-1.5 font-bold cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>{isRtl ? "بعدی" : "Next"}</span>
                    {isRtl ? (
                      <ChevronLeft size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admin Action Overlay Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedFeedback(null)}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />
          <div
            className="relative w-full max-w-lg bg-bmw-surface border border-bmw-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-start"
            dir={isRtl ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-bmw-border p-4 bg-bmw-base/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-600/10 text-amber-500 rounded-lg">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-bmw-text">
                    {isRtl
                      ? "بررسی پیشنهاد / انتقاد توسط مدیر ارشد"
                      : "Manager Proposal / Critique Review"}
                  </h3>
                  <p className="text-[10px] text-bmw-textSec mt-0.5">
                    ID: {selectedFeedback.id} • {selectedFeedback.userName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="p-1 rounded-md text-bmw-textSec hover:bg-bmw-hover hover:text-bmw-text transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <form
              onSubmit={handleUpdateStatus}
              className="p-5 overflow-y-auto space-y-4"
            >
              <div>
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
                  {isRtl
                    ? "عنوان موضوع پیشنهادی همکار"
                    : "Employee Suggested Theme"}
                </h4>
                <p className="text-xs text-bmw-text font-bold">
                  {selectedFeedback.title}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
                  {isRtl ? "شرح کامل ثبت شده" : "Registered Description"}
                </h4>
                <div className="bg-bmw-base/50 border border-bmw-border/80 rounded-lg p-3 text-xs text-bmw-textSec max-h-[120px] overflow-y-auto custom-scrollbar leading-relaxed">
                  {selectedFeedback.description}
                </div>
              </div>

              {/* Status Radio Choice */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-bmw-text uppercase tracking-wider">
                  {isRtl
                    ? "تعیین وضعیت نهایی طرح"
                    : "Approve / Transition Status"}
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewStatus("under_review")}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-bold transition-all ${
                      newStatus === "under_review"
                        ? "bg-amber-500/10 border-amber-500 text-amber-500"
                        : "bg-bmw-base border-bmw-border text-bmw-textSec"
                    }`}
                  >
                    <Clock size={14} />
                    <span>{isRtl ? "در دست بررسی" : "Under Review"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewStatus("approved")}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-bold transition-all ${
                      newStatus === "approved"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                        : "bg-bmw-base border-bmw-border text-bmw-textSec"
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    <span>
                      {isRtl ? "تأیید طرح و اجرا" : "Approve & Execute"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewStatus("rejected")}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-bold transition-all col-span-2 ${
                      newStatus === "rejected"
                        ? "bg-rose-500/10 border-rose-500 text-rose-500"
                        : "bg-bmw-base border-bmw-border text-bmw-textSec"
                    }`}
                  >
                    <XCircle size={14} />
                    <span>
                      {isRtl
                        ? "رد طرح / عدم امکان اجرا"
                        : "Reject Proposal / Impractical"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Status Comment */}
              <div>
                <label className="block text-xs font-bold text-bmw-text mb-2 uppercase tracking-wider">
                  {isRtl
                    ? "توضیحات و بازخورد مدیریت (کامنت)"
                    : "Manager Comment & Feedback Notes"}
                </label>
                <textarea
                  rows={4}
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder={
                    isRtl
                      ? "دلایل تایید/رد طرح یا نحوه پیگیری را در این بخش بنویسید..."
                      : "Enter feedback reasons or implementation schedule details..."
                  }
                  className="w-full bg-bmw-base border border-bmw-border rounded-xl p-3 text-xs text-bmw-text focus:border-bmw-blue focus:outline-none transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Submit Review action */}
              <div className="flex justify-end gap-3 pt-3 border-t border-bmw-border">
                <button
                  type="button"
                  onClick={() => setSelectedFeedback(null)}
                  className="px-4 py-2 bg-bmw-hover text-bmw-text border border-bmw-border rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  {isRtl ? "انصراف" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {isRtl ? "ثبت و اعمال تغییرات" : "Submit Decision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logical Delete Dialog */}
      {showLogicalDeleteDialog && logicalDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => {
              setShowLogicalDeleteDialog(false);
              setLogicalDeleteTarget(null);
            }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />
          <div
            className="relative w-full max-w-md bg-bmw-surface border border-bmw-border rounded-xl shadow-2xl overflow-hidden flex flex-col text-start"
            dir={isRtl ? "rtl" : "ltr"}
          >
            <div className="flex items-center gap-3 border-b border-bmw-border p-4 bg-rose-500/10 text-rose-500">
              <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
                <Trash2 size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black">
                  {isRtl
                    ? "تأیید حذف منطقی طرح یا انتقاد"
                    : "Confirm Logical Delete"}
                </h3>
                <p className="text-[10px] text-rose-400/80 mt-0.5">
                  ID: {logicalDeleteTarget.id}
                </p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-bmw-text font-bold">
                {logicalDeleteTarget.title}
              </p>
              <p className="text-xs text-bmw-textSec leading-relaxed">
                {isRtl
                  ? "آیا از حذف منطقی این پیشنهاد/انتقاد اطمینان دارید؟ با این کار درخواست در لیست همکاران نمایش داده نخواهد شد اما همچنان در لیست مدیران با رنگ متمایز وجود دارد."
                  : "Are you sure you want to logically delete this suggestion/critique? This will hide it from the employees list, but managers will still be able to see and restore it."}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 p-4 bg-bmw-base/50 border-t border-bmw-border">
              <button
                type="button"
                onClick={() => {
                  setShowLogicalDeleteDialog(false);
                  setLogicalDeleteTarget(null);
                }}
                className="px-4 py-2 bg-bmw-hover text-bmw-text border border-bmw-border rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                {isRtl ? "انصراف" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleLogicalDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                {isRtl ? "تأیید حذف منطقی" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Edit Modal */}
      {showEditModal && editingFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => {
              setShowEditModal(false);
              setEditingFeedback(null);
            }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />
          <div
            className="relative w-full max-w-xl bg-bmw-surface border border-bmw-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-start"
            dir={isRtl ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-bmw-border p-4 bg-bmw-base/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600/10 text-blue-500 rounded-lg">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-bmw-text">
                    {isRtl
                      ? "ویرایش و اصلاح جزئیات درخواست ثبت‌شده"
                      : "Edit Registered Feedback Details"}
                  </h3>
                  <p className="text-[10px] text-bmw-textSec mt-0.5">
                    ID: {editingFeedback.id} •{" "}
                    {isRtl
                      ? "ثبت تغییرات در بخش روند تغییرات"
                      : "Changes logged automatically"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingFeedback(null);
                }}
                className="p-1 rounded-md text-bmw-textSec hover:bg-bmw-hover hover:text-bmw-text transition-colors"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSaveEdit}
              className="p-5 overflow-y-auto space-y-4"
            >
              {editError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-xs font-bold">
                  {editError}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-bmw-text uppercase tracking-wider">
                  {isRtl
                    ? "عنوان موضوع پیشنهادی یا انتقاد"
                    : "Suggested Title / Topic"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-bmw-base border border-bmw-border rounded-xl p-3 text-xs text-bmw-text focus:border-bmw-blue focus:outline-none transition-colors font-bold"
                />
              </div>

              {/* Category & Type in grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Type selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-bmw-text uppercase tracking-wider">
                    {isRtl ? "نوع درخواست" : "Request Type"}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditType("suggestion")}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                        editType === "suggestion"
                          ? "bg-blue-500/10 border-blue-500 text-blue-500"
                          : "bg-bmw-base border-bmw-border text-bmw-textSec"
                      }`}
                    >
                      {isRtl ? "پیشنهاد" : "Suggestion"}
                    </button>
                    {/* <button
                      type="button"
                      onClick={() => setEditType("critic")}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                        editType === "critic"
                          ? "bg-amber-600/10 border-amber-600 text-amber-500"
                          : "bg-bmw-base border-bmw-border text-bmw-textSec"
                      }`}
                    >
                      {isRtl ? "انتقاد سازنده" : "Critique"}
                    </button> */}
                    <button
                      type="button"
                      disabled
                      onClick={() => setEditType("critic")}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    ${
      editType === "critic"
        ? "bg-amber-600/10 border-amber-600 text-amber-500"
        : "bg-bmw-base border-bmw-border text-bmw-textSec"
    }`}
                    >
                      {isRtl ? "انتقاد سازنده" : "Critique"}
                    </button>
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-bmw-text uppercase tracking-wider">
                    {isRtl ? "حوزه یا دپارتمان مرتبط" : "Related Department"}
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-bmw-base border border-bmw-border rounded-xl p-2.5 text-xs text-bmw-text focus:border-bmw-blue focus:outline-none transition-colors"
                  >
                    {categories
                      .filter((c) => !c.is_deleted)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {isRtl ? cat.fa : cat.en}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-bmw-text uppercase tracking-wider">
                  {isRtl
                    ? "شرح کامل ایده یا انتقاد"
                    : "Full Description Details"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-bmw-base border border-bmw-border rounded-xl p-3 text-xs text-bmw-text focus:border-bmw-blue focus:outline-none transition-colors resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-bmw-border">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingFeedback(null);
                  }}
                  className="px-4 py-2 bg-bmw-hover text-bmw-text border border-bmw-border rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  {isRtl ? "انصراف" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {isRtl ? "ذخیره تغییرات و درج لاگ" : "Save Changes & Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Category Edit Modal */}
      {showEditCategoryModal && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => {
              setShowEditCategoryModal(false);
              setEditingCategory(null);
            }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />
          <div
            className="relative w-full max-w-md bg-bmw-surface border border-bmw-border rounded-xl shadow-2xl overflow-hidden flex flex-col text-start animate-fade-in z-50"
            dir={isRtl ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-bmw-border p-4 bg-bmw-base/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-600/10 text-amber-500 rounded-lg">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-bmw-text">
                    {isRtl
                      ? "ویرایش اطلاعات دپارتمان / حوزه"
                      : "Edit Department / Area Details"}
                  </h3>
                  <p className="text-[10px] text-bmw-textSec mt-0.5">
                    ID: {editingCategory.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="p-1 rounded-md text-bmw-textSec hover:bg-bmw-hover hover:text-bmw-text transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditCategory} className="p-5 space-y-4">
              {editCategoryError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-xs font-bold">
                  ⚠️ {editCategoryError}
                </div>
              )}

              {/* Unique ID Display (Read Only) */}
              {/* <div className="space-y-1.5">
                <label className="block text-xs font-bold text-bmw-textSec uppercase tracking-wider">
                  {isRtl
                    ? "شناسه یکتا (غیرقابل ویرایش)"
                    : "Unique ID (Read-only)"}
                </label>
                <input
                  type="text"
                  disabled
                  value={editingCategory.id}
                  className="w-full bg-bmw-base/50 border border-bmw-border rounded-xl p-3 text-xs text-bmw-textSec focus:outline-none font-mono cursor-not-allowed"
                />
              </div> */}

              {/* Persian Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-bmw-text uppercase tracking-wider">
                  {isRtl ? "عنوان فارسی حوزه" : "Persian Title"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editCategoryFa}
                  onChange={(e) => setEditCategoryFa(e.target.value)}
                  className="w-full bg-bmw-base border border-bmw-border rounded-xl p-3 text-xs text-bmw-text focus:border-bmw-blue focus:outline-none transition-colors font-semibold"
                />
              </div>

              {/* English Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-bmw-text uppercase tracking-wider">
                  {isRtl ? "عنوان انگلیسی حوزه" : "English Title"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editCategoryEn}
                  onChange={(e) => setEditCategoryEn(e.target.value)}
                  className="w-full bg-bmw-base border border-bmw-border rounded-xl p-3 text-xs text-bmw-text focus:border-bmw-blue focus:outline-none transition-colors font-semibold"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-bmw-border">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 bg-bmw-hover text-bmw-text border border-bmw-border rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  {isRtl ? "انصراف" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {isRtl ? "ذخیره تغییرات" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryDeleteDialog && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => {
              setShowCategoryDeleteDialog(false);
              setCategoryToDelete(null);
            }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />
          <div
            className="relative w-full max-w-sm bg-bmw-surface border border-bmw-border rounded-xl shadow-2xl p-6 text-start animate-fade-in z-50"
            dir={isRtl ? "rtl" : "ltr"}
          >
            <div className="flex items-start gap-3.5 mb-4">
              <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-bmw-text leading-6">
                  {isRtl
                    ? "تأیید حذف دپارتمان / حوزه"
                    : "Confirm Department / Area Deletion"}
                </h3>
                <p className="text-xs text-bmw-textSec mt-1 leading-relaxed">
                  {isRtl
                    ? `آیا از حذف دپارتمان «${categoryToDelete.fa}» اطمینان دارید؟ حذف این دپارتمان به صورت منطقی (Logical) انجام می‌شود تا اطلاعات تاریخی حفظ گردد.`
                    : `Are you sure you want to delete the department "${categoryToDelete.en}"? Deletion is logical, retaining historical data.`}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-bmw-border/50">
              <button
                type="button"
                onClick={() => {
                  setShowCategoryDeleteDialog(false);
                  setCategoryToDelete(null);
                }}
                className="px-4 py-2 bg-bmw-hover text-bmw-text border border-bmw-border rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                {isRtl ? "انصراف" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                {isRtl ? "تأیید حذف" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackSystem;

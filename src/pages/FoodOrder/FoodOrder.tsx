import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import type { MealType } from "./type";
import FoodHeader from "./FoodHeader";
import WeeklyMenuGrid from "./WeeklyMenuGrid";
import SummaryBar from "./SummaryBar";
import {
  createFoodPerWeekByUser,
  findAcceptFoodByUser,
  getAllFoodPerWeek,
  getHistoryFoodByUser,
  sendNotifToAll,
} from "../../services/dotNet";
import { useAppSelector } from "../../features/store";
import StringHelpers from "../../utils/stringHelpers";
import { useDispatch } from "react-redux";
import { addToast } from "../../features/slices/toastSloce";
import DeleteFoodModal from "./DeleteFoodModal";
import PollSection from "./PollSection";

const FoodOrder: React.FC = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const [allFoodMenu, setAllFoodMenu] = useState<any[]>([]);
  const [historyFoodMenu, setHistoryFoodMenu] = useState<any[]>([]);
  const [checkAcceptedFood, setCheckAcceptedFood] = useState<any[]>([]);
  const [selections, setSelections] = useState<
    Record<string | number, MealType>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteItem, setSelectedDeleteItem] = useState<any>(null);
  const userLogin = useAppSelector(
    (state) => state?.main?.userProfile?.userLogin,
  );
  const main = useAppSelector((state) => state?.main);

  const showToast = (
    type: "success" | "error" | "info" | "loading",
    title: string,
    message: string,
    duration = 4500,
  ) => {
    dispatch(
      addToast({
        id: Date.now().toString(),
        type,
        title,
        message,
        duration,
      }),
    );
  };

  const handleFindAcceptedFood = async () => {
    try {
      const res = await findAcceptFoodByUser(userLogin?.personalCode);
      setCheckAcceptedFood(res?.data || []);
    } catch (error) {
      console.error("Error fetching accepted foods:", error);
      showToast("error", "خطا", "دریافت غذای تأییدشده با مشکل مواجه شد.");
    }
  };

  const handleSelect = (menuItemId: string | number, type: MealType) => {
    setSelections((prev) => ({
      ...prev,
      [menuItemId]: type,
    }));

    const selectedMenuItem = allFoodMenu.find(
      (item: any) => item.menuItemId === menuItemId,
    );

    if (selectedMenuItem) {
      const selectedFood = {
        ...selectedMenuItem,
        selectedType: type,
        selectedFoodName:
          type === "A"
            ? selectedMenuItem.foodName || selectedMenuItem.menuA?.foodName
            : type === "B"
              ? selectedMenuItem.menuB?.foodName
              : null,
      };

      console.log("Final Processed Selected Food Object:", selectedFood);
    }
    setSuccess(false);
  };

  const handleDelete = (menuItemId: string | number) => {
    const itemToDelete = allFoodMenu.find(
      (item) => String(item.menuItemId) === String(menuItemId),
    );

    console.log("آیتم انتخاب شده برای حذف:", itemToDelete);

    setSelectedDeleteItem(itemToDelete || null);
    setShowDeleteModal(true);
  };

  const handleSubmit = async () => {
    const validSelections = Object.entries(selections).filter(
      ([_, selectedType]) => selectedType !== "None",
    );

    if (validSelections.length === 0) {
      showToast("info", "انتخاب غذا", "لطفاً حداقل یک غذا را انتخاب کنید.");
      return;
    }

    if (!userLogin?.personalCode) {
      showToast("error", "خطای احراز هویت", "کد پرسنلی یافت نشد.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderList = validSelections.map(([menuItemId, selectedType]) => {
        const menuItem = allFoodMenu.find(
          (item: any) => String(item.menuItemId) === String(menuItemId),
        );

        const mealID = selectedType === "A" ? 1 : selectedType === "B" ? 2 : 1;

        return {
          menuItemId: Number(menuItemId),
          personalCode: userLogin.personalCode,
          registerDate: new Date().toISOString(),
          status: 1,
          totalPrice: 450045,
          reservedDate:
            menuItem?.createDate ??
            menuItem?.CreateDate ??
            new Date().toISOString(),
          restaurantID: 1,
          mealID,
        };
      });

      const res = await createFoodPerWeekByUser(orderList);
      console.log("نتیجه ثبت:", res);

      if (res?.data?.isSuccess) {
        await handleFindAcceptedFood();
        setSelections({});
        setSuccess(true);
        showToast("success", "ثبت موفق", "سفارش غذای شما با موفقیت ثبت شد.");
      } else {
        showToast(
          "error",
          "ثبت ناموفق",
          res?.data?.message || "ثبت سفارش با مشکل مواجه شد.",
        );
      }
    } catch (error) {
      console.error("خطا در ثبت سفارش:", error);
      showToast(
        "error",
        "خطا در ثبت سفارش",
        "مشکلی در ثبت سفارشات پیش آمد. لطفاً مجدداً تلاش کنید.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetAllFoodPerWeek = async () => {
    try {
      const res = await getAllFoodPerWeek();
      if (res?.data && res.data !== 0) {
        setAllFoodMenu(res.data);
      } else {
        showToast("info", "اطلاع", "منوی هفتگی برای این بازه یافت نشد.");
      }
    } catch (error) {
      console.error("Error fetching weekly menu:", error);
      showToast("error", "خطا", "دریافت منوی هفتگی با مشکل مواجه شد.");
    }
  };

  const handleGetHistoryFoodByUser = async () => {
    try {
      const res = await getHistoryFoodByUser(userLogin?.personalCode);

      if (res?.data?.isSuccess) {
        setHistoryFoodMenu(res?.data?.data || []);
      } else {
        showToast("info", "اطلاع", "سابقه‌ای برای سفارش غذا یافت نشد.");
      }
    } catch (error) {
      console.error("Error fetching weekly menu:", error);
      showToast("error", "خطا", "دریافت تاریخچه غذا با مشکل مواجه شد.");
    }
  };

  useEffect(() => {
    if (!userLogin?.personalCode) return;
    handleGetAllFoodPerWeek();
    handleFindAcceptedFood();
    handleGetHistoryFoodByUser();
  }, [userLogin?.personalCode]);

  const fixMissingDayWeek = useMemo(() => {
    return StringHelpers.fillMissingDays(allFoodMenu);
  }, [allFoodMenu]);

  const fixMissingDayHistory = useMemo(() => {
    return StringHelpers.fillMissingDayHistory(historyFoodMenu);
  }, [historyFoodMenu]);

  const updatedMissingDayWeek = useMemo(() => {
    if (!fixMissingDayWeek?.length) return [];

    return fixMissingDayWeek.map((weekItem: any) => {
      const isAccepted =
        checkAcceptedFood?.some(
          (acceptedItem: any) =>
            String(acceptedItem.menuItemId || acceptedItem.MenuItemID) ===
            String(weekItem.menuItemId || weekItem.MenuItemID),
        ) || false;

      return {
        ...weekItem,
        isAccepted,
      };
    });
  }, [fixMissingDayWeek, checkAcceptedFood]);

  return (
    <div className="space-y-8">
      <FoodHeader t={t} activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "current" ? (
        <>
          <div className="shadow-sm border border-bmw-border bg-bmw-surface rounded-xl p-3">
            <div className="bg-bmw-surface rounded-2xl">
              <WeeklyMenuGrid
                handleDelete={handleDelete}
                isHistory={false}
                weeklyMenu={updatedMissingDayWeek}
                selections={selections}
                t={t}
                onSelect={handleSelect}
              />
              <SummaryBar
                t={t}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
          <PollSection t={t} />
        </>
      ) : (
        <WeeklyMenuGrid
          isHistory={true}
          weeklyMenu={fixMissingDayHistory}
          selections={selections}
          t={t}
          onSelect={handleSelect}
        />
      )}
      <div className="h-20 lg:hidden"></div>
      {showDeleteModal && (
        <DeleteFoodModal
          showToast={showToast}
          handleFindAcceptedFood={handleFindAcceptedFood}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          selectedDeleteItem={selectedDeleteItem}
        />
      )}
    </div>
  );
};

export default FoodOrder;

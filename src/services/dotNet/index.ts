import api from "../axios";

export const usersLogin = async (postData: any) => {
  return await api.post("/users/login", postData);
};

export const updatedProfilePhoto = (postData: any) => {
  return api.put(`/users/updatedProfilePhoto`, postData);
};

export const verifyLoginCode = async (postData: any) => {
  return await api.post("/users/verifyLoginCode", postData);
};

export const getallcompanynews = async () => {
  return await api.get("/companynews/getAllCompanyNews");
};

export const getAllCategoryNews = async () => {
  return await api.get("/companyNews/getAllCategoryNews");
};

export const addAttachment = (formData: FormData) => {
  return api.post("/attachment/createAttachment", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const addNewsAttachments = (formData: FormData) => {
  return api.post("/companyNews/addAttachments", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const createCompanyNews = (postData: any) => {
  return api.post("/companyNews/createCompanyNews", postData);
};
export const createPoll = (postData: any) => {
  return api.post("/poll/createPoll", postData);
};

export const deletePoll = (id: any) => {
  return api.delete(`/poll/deletePoll/${id}`);
};

export const updatePolls = (postData: any) => {
  return api.put(`/poll/updatePolls/${postData?.id}`, postData);
};

export const deleteCompanyNews = (id: any) => {
  return api.delete(`/companyNews/deleteCompanyNews/${id}`);
};
export const updateCompanyNews = (postData: any) => {
  return api.put(`/companyNews/updateCompanyNews/${postData?.id}`, postData);
};
export const updatedProfile = (postData: any) => {
  return api.put(`/users/updatedProfile`, postData);
};
export const getSalaryPerMonth = async (PersonalCode: any) => {
  return await api.get(
    `/salary/getSalaryPerMonth?PersonalCode=${PersonalCode}`,
  );
};

export const allPolls = async () => {
  return await api.get(`/poll/allPolls`);
};

export const allPollsByUsers = async (PersonalCode: string | number) => {
  return await api.get(`/poll/allPollByUsers?PersonalCode=${PersonalCode}`);
};

export const createQuestionAnswerUser = async (postData: any) => {
  return await api.post(`/poll/createQuestionAnswerUser`, postData);
};
export const getBirthday = async () => {
  return await api.get(`/birthday/getBirthday`);
};
export const getUserProfile = async () => {
  return await api.get(`/users/getUserProfile`);
};

export const subscribePushNotification = (postData: any) => {
  return api.post("/notif/subscribe", postData);
};

export const sendNotifUser = (postData: any) => {
  return api.post("/notif/sendNotifUser", postData);
};

export const createFeedback = (postData: any) => {
  return api.post("/feedback/createFeedback", postData);
};

export const deleteFeedbackCategories = (id: any) => {
  return api.delete(`/feedback/deleteFeedbackCategories/${id}`);
};

export const createFeedbackCategories = (postData: any) => {
  return api.post("/feedback/createFeedbackCategories", postData);
};

export const deleteFeedback = (id: any) => {
  return api.delete(`/feedback/deleteFeedback/${id}`);
};

export const getAllFeedback = () => {
  return api.get("/feedback/getAllFeedback");
};

export const updateFeedback = (postData: any) => {
  return api.put("/feedback/updateFeedback", postData);
};

export const restoreFeedbackCategories = (id: any) => {
  return api.put(`/feedback/restoreFeedbackCategories/${id}`);
};

export const updateStatusManager = (postData: any) => {
  return api.put("/feedback/updateStatusManager", postData);
};

export const updateFeedbackCategories = (postData: any) => {
  return api.put("/feedback/updateFeedbackCategories", postData);
};

export const restoreFeedback = (id: any) => {
  return api.put(`/feedback/restoreFeedback/${id}`);
};

export const getAllFeedbackCategories = () => {
  return api.get("/feedback/getAllFeedbackCategories");
};

export const getAllFeedbackManager = () => {
  return api.get("/feedback/getAllFeedbackManager");
};

export const getNotifAll = async (userId: number) => {
  return await api.get(`/notif/getNotifAll/${userId}`);
};

export const getAllUsers = async () => {
  return await api.get(`/users/getAllUsers`);
};
export const getAllRahkaranUsers = async () => {
  return await api.get(`/users/getAllRahkaranUsers`);
};

export const getAllFoodPerWeek = async () => {
  return await api.get(`/food/getAllFoodPerWeek`);
};

export const getAllOrderUserOnDay = async (menuId: number) => {
  return await api.get(`/food/getAllOrderUserOnDay/${menuId}`);
};

export const getHistoryFoodByUser = async (personalCode: string) => {
  return await api.get(`/food/getHistoryFoodByUser/${personalCode}`);
};

export const getAllOrderUserFood = async () => {
  return await api.get(`/food/getAllOrderUserFood`);
};

export const findAcceptFoodByUser = async (personalCode: string) => {
  return await api.get(`/food/findAcceptFoodByUser/${personalCode}`);
};

export const isReadNotif = async (postData: any) => {
  return await api.put(`/notif/isReadNotif`, postData);
};

export const sendNotifToAll = (postData: any) => {
  return api.post("/notif/sendNotifToAll", postData);
};

export const updatedLimitUsedPhotoAi = async (postData: any) => {
  return await api.put(`/users/updatedLimitUsedPhotoAi`, postData);
};

export const createFoodPerWeekByUser = async (postData: any) => {
  return await api.post(`/food/createFoodPerWeekByUser`, postData);
};

export const deleteFoodByUser = (postData: any) => {
  return api.post(`/food/deleteFoodByUser`, postData);
};

export const getQuestionForFood = async (personalCode: any) => {
  return await api.get(`/food/getQuestionForFood/${personalCode}`);
};

export const createListeningEar = (postData: any) => {
  return api.post(`/listeningEar/createListeningEar`, postData);
};

export const getReportQuestionFood = () => {
  return api.get(`/food/getReportQuestionFood`);
};

export const getListeningEarPerDate = (postData: any) => {
  return api.post(`/listeningEar/getListeningEarPerDate`, postData);
};
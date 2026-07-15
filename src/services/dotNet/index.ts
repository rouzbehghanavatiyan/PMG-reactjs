import api from "../axios";

export const usersLogin = async (postData: any) => {
  return await api.post("/api/users/login", postData);
};
export const verifyLoginCode = async (postData: any) => {
  return await api.post("/api/users/verifyLoginCode", postData);
};
export const getallcompanynews = async () => {
  return await api.get("/api/companynews/getAllCompanyNews");
};
export const getAllCategoryNews = async () => {
  return await api.get("/api/companyNews/getAllCategoryNews");
};
export const addAttachment = (formData: FormData) => {
  return api.post("/api/attachment/createAttachment", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const addNewsAttachments = (formData: FormData) => {
  return api.post("/api/companyNews/addAttachments", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const createCompanyNews = (postData: any) => {
  return api.post("/api/companyNews/createCompanyNews", postData);
};
export const createPoll = (postData: any) => {
  return api.post("/api/poll/createPoll", postData);
};

export const deletePoll = (id: any) => {
  return api.delete(`/api/poll/deletePoll/${id}`);
};



export const updatePolls = (postData: any) => {
  return api.put(`/api/poll/updatePolls/${postData?.id}`, postData);
};

export const deleteCompanyNews = (id: any) => {
  return api.delete(`/api/companyNews/deleteCompanyNews/${id}`);
};
export const updateCompanyNews = (postData: any) => {
  return api.put(
    `/api/companyNews/updateCompanyNews/${postData?.id}`,
    postData,
  );
};
export const updatedProfile = (postData: any) => {
  return api.put(`/api/users/updatedProfile`, postData);
};
export const getSalaryPerMonth = async (PersonalCode: any) => {
  return await api.get(
    `/api/salary/getSalaryPerMonth?PersonalCode=${PersonalCode}`,
  );
};
export const allPolls = async (PersonalCode: string | number) => {
  console.log(
    "PersonalCodePersonalCodePersonalCodePersonalCodePersonalCodePersonalCode",
    PersonalCode,
  );
  return await api.get(`/api/poll/allPolls?PersonalCode=${PersonalCode}`);
};
export const createQuestionAnswerUser = async (postData: any) => {
  return await api.post(`/api/poll/createQuestionAnswerUser`, postData);
};
export const getBirthday = async () => {
  return await api.get(`/api/birthday/getBirthday`);
};
export const getUserProfile = async () => {
  return await api.get(`/api/users/getUserProfile`);
};

export const subscribePushNotification = (postData: any) => {
  return api.post("/api/notif/subscribe", postData);
};

export const sendNotifUser = (postData: any) => {
  return api.post("/api/notif/sendNotifUser", postData);
};

export const createFeedback = (postData: any) => {
  return api.post("/api/feedback/createFeedback", postData);
};

export const deleteFeedbackCategories = (id: any) => {
  return api.delete(`/api/feedback/deleteFeedbackCategories/${id}`);
};

export const createFeedbackCategories = (postData: any) => {
  return api.post("/api/feedback/createFeedbackCategories", postData);
};



export const deleteFeedback = (id: any) => {
  return api.delete(`/api/feedback/deleteFeedback/${id}`);
};

export const getAllFeedback = () => {
  return api.get("/api/feedback/getAllFeedback");
};

export const updateFeedback = (postData: any) => {
  return api.put("/api/feedback/updateFeedback", postData);
};

export const restoreFeedbackCategories = (id: any) => {
  return api.put(`/api/feedback/restoreFeedbackCategories/${id}`);
};

export const updateStatusManager = (postData: any) => {
  return api.put("/api/feedback/updateStatusManager", postData);
};

export const updateFeedbackCategories = (postData: any) => {
  return api.put("/api/feedback/updateFeedbackCategories", postData);
};



export const restoreFeedback = (id: any) => {
  return api.put(`/api/feedback/restoreFeedback/${id}`);
};

export const getAllFeedbackCategories = () => {
  return api.get("/api/feedback/getAllFeedbackCategories");
};

export const getAllFeedbackManager = () => {
  return api.get("/api/feedback/getAllFeedbackManager");
};

export const getNotifAll = async (userId: number) => {
  return await api.get(`/api/notif/getNotifAll/${userId}`);
};

export const isReadNotif = async (postData: any) => {
  return await api.put(`/api/notif/isReadNotif`, postData);
};

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

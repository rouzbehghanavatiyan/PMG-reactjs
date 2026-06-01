import api from "../axios";

export const usersLogin = async (postData: any) => {
  return await api.post("/api/users/login", postData);
};

export const verifyLoginCode = async (postData: any) => {
  return await api.post("/api/users/verifyLoginCode", postData);
};

export const getallcompanynews = async () => {
  return await api.get("/api/companynews/getallcompanynews");
};

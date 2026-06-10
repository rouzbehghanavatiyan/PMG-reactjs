import { useAppSelector } from "../features/store";

export const useHasPermission = () => {
  const permissionsFromRedux = useAppSelector((state) => state.main.permission);

  let finalPermissions: string[] = [];

  if (permissionsFromRedux && permissionsFromRedux.length > 0) {
    finalPermissions = permissionsFromRedux;
  } else {
    const saved = localStorage.getItem("permissions");
    if (saved) {
      finalPermissions = saved.split(",");
    }
  }

  const hasPermission = (permissionName: string) => {
    return finalPermissions.includes(permissionName);
  };

  return { hasPermission, permissions: finalPermissions };
};

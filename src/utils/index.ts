import config from "../../config";

export const isSuperAdmin = (id: string) => {
  return config.SUPER_ADMIN_IDS.includes(id);
};

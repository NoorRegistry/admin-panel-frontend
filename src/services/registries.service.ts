import { IApiError, http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import {
  EAdminRole,
  IRegistryCategory,
  TCreateRegistryCategory,
} from "@/types";
import { getAdminRole } from "@/utils/helper";

const ensureInternalAdmin = () => {
  if (getAdminRole() !== EAdminRole.INTERNAL_ADMIN) {
    const error: IApiError = {
      detail:
        "Unauthorized action. Only internal admins can manage registry categories.",
    };
    throw error;
  }
};

export const fetchRegistryCategories = async () => {
  return await http.get<IRegistryCategory[]>(
    `${endpoints.registries.index}/categories`,
  );
};

export const postRegistryCategory = async (
  payload: TCreateRegistryCategory,
) => {
  ensureInternalAdmin();
  return await http.post<IRegistryCategory>(
    `${endpoints.registries.index}/categories`,
    payload,
  );
};

export const fetchRegistryCategory = async (id: string) => {
  return await http.get<IRegistryCategory>(
    `${endpoints.registries.index}/categories/${id}`,
  );
};

export const patchRegistryCategory = async (
  id: string,
  payload: Partial<
    TCreateRegistryCategory & Pick<IRegistryCategory, "isActive">
  >,
) => {
  ensureInternalAdmin();
  return await http.patch<IRegistryCategory>(
    `${endpoints.registries.index}/categories/${id}`,
    payload,
  );
};

export const deleteRegistryCategory = async (id: string) => {
  ensureInternalAdmin();
  return await http.delete<{ id: string }>(
    `${endpoints.registries.index}/categories/${id}`,
  );
};

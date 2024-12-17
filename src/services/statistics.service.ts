import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import { TStatistics } from "@/types";

export const fetchStatistics = async () => {
  return await http.get<TStatistics>(endpoints.statistics.index);
};

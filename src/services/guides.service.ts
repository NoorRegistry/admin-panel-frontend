import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import {
  IAuthor,
  IPaginatedResponse,
} from "@/types";

export const fetchAuthors = async () => {
  return await http.get<IPaginatedResponse<IAuthor>>(`${endpoints.guides.index}/authors`);
};


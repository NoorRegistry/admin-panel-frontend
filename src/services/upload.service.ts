import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import { TUploadType } from "@/types";

export const deleteUploadedImage = async (payload: { url: string }) => {
  return await http.post<{ success: 200 }>(
    `${endpoints.upload.index}/delete`,
    payload,
  );
};

export const deleteUploadedImageWithDatabaseEntry = async (
  id: string,
  type: TUploadType,
  payload: { url: string },
) => {
  return await http.delete<{ success: 200 }>(
    `${endpoints.upload.index}/${id}?type=${type}`,
    { data: payload },
  );
};

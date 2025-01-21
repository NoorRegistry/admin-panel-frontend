import { http } from "@/api/http";
import endpoints from "@/constants/endpoints";
import { IUpload, TUploadType } from "@/types";
import { AxiosRequestConfig } from "axios";

export const deleteUploadedImage = async (payload: { url: string }) => {
  return await http.post<{ success: 200 }>(
    `${endpoints.upload.index}/delete`,
    payload
  );
};

export const deleteUploadedImageWithDatabaseEntry = async (
  id: string,
  type: TUploadType,
  payload: { url: string }
) => {
  return await http.delete<{ success: 200 }>(
    `${endpoints.upload.index}/${id}?type=${type}`,
    { data: payload }
  );
};

export const uploadGuideImage = async (
  id: string,
  type: TUploadType,
  payload: { file: File }
) => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer YOUR_TOKEN",
    },
  };
  return await http.post<IUpload>(
    `${endpoints.upload.index}?id=${id}&type=${type}`,
    payload,
    config
  );
};

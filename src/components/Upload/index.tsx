import { queryClient } from "@/api/queryClient";
import endpoints from "@/constants/endpoints";
import {
  deleteUploadedImage,
  deleteUploadedImageWithDatabaseEntry,
} from "@/services/upload.service";
import { EQueryKeys, TUploadType } from "@/types";
import { getAccessToken } from "@/utils/helper";
import { PlusOutlined } from "@ant-design/icons";
import type { GetProp, UploadFile, UploadProps } from "antd";
import { Image, Upload, message } from "antd";
import i18next from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];
interface CustomUploadFile<T = any> extends UploadFile<T> {
  id?: string;
}

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const UploadComponent = ({
  type,
  dbId,
  fileList: files = [],
  onChange,
  onUploadStatusChange,
}: {
  type: TUploadType;
  dbId?: string;
  fileList?: any[]; // To integrate with Form.Item's `value` and `onChange`
  onChange?: (files: File[]) => void;
  onUploadStatusChange?: (uploading: boolean) => void;
}) => {
  const { t } = useTranslation();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [imagesList, setImagesList] = useState<UploadFile[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const allowedProductImages =
    process.env.NEXT_PUBLIC_ALLOWED_PRODUCT_IMAGES ?? 1;

  useEffect(() => {
    // Skip transformation if `files` is empty and `imagesList` already contains files
    if (!files?.length && imagesList.length) {
      return;
    }
    const transformedFiles = files.map((file) => ({
      id: file.id,
      uid: file.id ?? file.uid,
      name: file.path ?? file.name,
      status: file.status ?? "done",
      url: `${process.env.NEXT_PUBLIC_ASSET_URL}${file.path ?? file.name}`, // For preview
    }));
    if (JSON.stringify(transformedFiles) !== JSON.stringify(imagesList)) {
      setImagesList(transformedFiles);
    }
  }, [files]);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps["onChange"] = ({
    fileList: updatedFileList,
    file,
  }) => {
    const isUploading = updatedFileList.some(
      (file: any) => file.status === "uploading",
    );
    onUploadStatusChange?.(isUploading);
    setImagesList(updatedFileList);
    if (file.status !== "uploading") {
      const finalList: any = updatedFileList.map((item) => {
        if (item.originFileObj) {
          return {
            ...item,
            uid: file.uid,
            name: file.response.path,
            id: file.response.id,
            status: "done",
            url: `${process.env.NEXT_PUBLIC_ASSET_URL}${file.response.path}`, // For preview
          };
        } else {
          return item;
        }
      });
      onChange?.(finalList);
      if (file.status === "done")
        messageApi.success({ content: t("common.imageUploaded") });
      handleInvalidateCache();
    }
  };

  const handleRemove = async (file: CustomUploadFile<{ success: number }>) => {
    if (file.id) {
      await deleteUploadedImageWithDatabaseEntry(file.id, type, {
        url: file.name,
      });
    } else {
      await deleteUploadedImage({ url: file.name });
    }
    messageApi.success({ content: t("common.imageDeleted") });
    handleInvalidateCache();
  };

  const handleInvalidateCache = () => {
    if (!dbId) return;
    if (type === "store") {
      queryClient.invalidateQueries({ queryKey: [EQueryKeys.STORES] });
    } else if (type === "product") {
      queryClient.invalidateQueries({ queryKey: [EQueryKeys.PRODUCTS] });
      queryClient.invalidateQueries({ queryKey: [EQueryKeys.PRODUCT] });
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>{t("common.upload")}</div>
    </button>
  );

  const getUploadQueryParams = () => {
    let param = `?type=${type}`;
    if (dbId) {
      param += `&id=${dbId}`;
    }
    return param;
  };

  return (
    <>
      {contextHolder}
      <Upload
        action={`${process.env.NEXT_PUBLIC_API_URL}${endpoints.upload.index}${getUploadQueryParams()}`}
        headers={{
          "Accept-Language": i18next.language ?? "en",
          Authorization: `Bearer ${getAccessToken()}`,
        }}
        listType="picture-card"
        fileList={imagesList}
        onPreview={handlePreview}
        onChange={handleChange}
        onRemove={handleRemove}
        accept="image/*"
      >
        {imagesList.length >= (type === "store" ? 1 : allowedProductImages)
          ? null
          : uploadButton}
      </Upload>
      {previewImage && (
        <Image.PreviewGroup
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          items={imagesList.map((image) => image.url!) ?? []}
        >
          <Image
            wrapperStyle={{ display: "none" }}
            preview={{
              visible: previewOpen,
            }}
            src={previewImage}
            alt=""
          />
        </Image.PreviewGroup>
      )}
    </>
  );
};

export default UploadComponent;

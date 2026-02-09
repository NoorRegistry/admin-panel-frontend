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
  onUploadComplete,
  allowReplaceWithoutRemove = false,
}: {
  type: TUploadType;
  dbId?: string;
  fileList?: any[]; // To integrate with Form.Item's `value` and `onChange`
  onChange?: (files: CustomUploadFile[]) => void;
  onUploadStatusChange?: (uploading: boolean) => void;
  onUploadComplete?: (file: CustomUploadFile) => void;
  allowReplaceWithoutRemove?: boolean;
}) => {
  const { t } = useTranslation();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [imagesList, setImagesList] = useState<UploadFile[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const allowedProductImages =
    process.env.NEXT_PUBLIC_ALLOWED_PRODUCT_IMAGES ?? 1;
  const singleImageUploadTypes: TUploadType[] = [
    "store",
    "author",
    "guide",
    "registry",
    "registryCategory",
  ];

  useEffect(() => {
    setImagesList((previousImagesList) => {
      // Skip transformation if `files` is empty and existing file previews are already shown
      if (!files?.length && previousImagesList.length) {
        return previousImagesList;
      }

      const transformedFiles = files.map((file) => ({
        id: file.id,
        uid: file.id ?? file.uid,
        name: file.path ?? file.name,
        status: file.status ?? "done",
        url: `${process.env.NEXT_PUBLIC_ASSET_URL}${file.path ?? file.name}`, // For preview
      }));

      if (
        JSON.stringify(transformedFiles) === JSON.stringify(previousImagesList)
      ) {
        return previousImagesList;
      }

      return transformedFiles;
    });
  }, [files]);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps["onChange"] = ({ fileList, file }) => {
    const isSingleUploadType = singleImageUploadTypes.includes(type);
    const updatedFileList = fileList;
    const isUploading = updatedFileList.some(
      (file: any) => file.status === "uploading",
    );

    onUploadStatusChange?.(isUploading);

    if (file.status !== "uploading") {
      let finalList: CustomUploadFile[] = updatedFileList.map((item) => {
        if (item.originFileObj) {
          return {
            ...item,
            uid: item.response?.id ?? item.uid,
            name: item.response?.path ?? item.name,
            id: item.response?.id,
            status: "done",
            url: `${process.env.NEXT_PUBLIC_ASSET_URL}${item.response?.path ?? item.name}`, // For preview
          };
        } else {
          return item;
        }
      });

      if (
        file.status === "done" &&
        isSingleUploadType &&
        allowReplaceWithoutRemove &&
        finalList.length > 1
      ) {
        const latestUploaded =
          finalList.find((item) => item.uid === file.uid) ||
          finalList[finalList.length - 1];
        finalList = latestUploaded ? [latestUploaded] : finalList;
      }

      setImagesList(finalList);
      onChange?.(finalList);

      if (file.status === "done") {
        onUploadComplete?.({
          uid: file.response?.id ?? file.uid,
          id: file.response?.id,
          name: file.response?.path ?? file.name,
          status: "done",
          url: `${process.env.NEXT_PUBLIC_ASSET_URL}${file.response?.path ?? file.name}`,
        });
        messageApi.success({ content: t("common.imageUploaded") });
      }

      handleInvalidateCache();
      return;
    }

    setImagesList(updatedFileList);
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
    } else if (type === "registry" || type === "registryCategory") {
      queryClient.invalidateQueries({
        queryKey: [EQueryKeys.REGISTRY_CATEGORIES],
      });
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

  const isSingleUploadType = singleImageUploadTypes.includes(type);
  const canUploadMore = isSingleUploadType
    ? allowReplaceWithoutRemove || imagesList.length < 1
    : imagesList.length < Number(allowedProductImages);

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
        {canUploadMore ? uploadButton : null}
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

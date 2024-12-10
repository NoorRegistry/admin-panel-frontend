import endpoints from "@/constants/endpoints";
import { getAccessToken } from "@/utils/helper";
import { PlusOutlined } from "@ant-design/icons";
import type { GetProp, UploadFile, UploadProps } from "antd";
import { Image, Upload } from "antd";
import i18next from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const UploadComponent = ({
  type,
  fileList: files = [],
  onChange,
  onUploadStatusChange,
}: {
  type: "store" | "product";
  fileList?: any[]; // To integrate with Form.Item's `value` and `onChange`
  onChange?: (files: File[]) => void;
  onUploadStatusChange?: (uploading: boolean) => void;
}) => {
  const { t } = useTranslation();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [imagesList, setImagesList] = useState<UploadFile[]>([]);

  useEffect(() => {
    console.log("files", files);
    const transformedFiles = files.map((file) => ({
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
    event,
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
            name: file.response.fileUrl,
            status: "done",
            url: `${process.env.NEXT_PUBLIC_ASSET_URL}${file.response.fileUrl}`, // For preview
          };
        } else {
          return item;
        }
      });
      onChange?.(finalList);
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>{t("common.upload")}</div>
    </button>
  );

  return (
    <>
      <Upload
        action={`${process.env.NEXT_PUBLIC_API_URL}${endpoints.upload.index}?type=${type}`}
        headers={{
          "Accept-Language": i18next.language ?? "en",
          Authorization: `Bearer ${getAccessToken()}`,
        }}
        listType="picture-card"
        fileList={imagesList}
        onPreview={handlePreview}
        onChange={handleChange}
      >
        {imagesList.length >= 8 ? null : uploadButton}
      </Upload>
      {previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
        />
      )}
    </>
  );
};

export default UploadComponent;

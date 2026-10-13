"use client";
import { EDITOR_TOOLS } from "@/components/EditorJs/EditorTools";
import { ProductPlugin } from "@/components/EditorJs/Plugins/ProductPlugin";
import { StorePlugin } from "@/components/EditorJs/Plugins/StorePlugin";
import { uploadGuideImage } from "@/services/upload.service";

import EditorJS from "@editorjs/editorjs";
import ImageTool from "@editorjs/image";
import { useEffect, useEffectEvent, useRef } from "react";

const GuideEditor = ({
  value,
  onChange,
  guideId,
  editorId,
  editorlang,
}: {
  value: string;
  onChange?: (value: string) => void;
  guideId: string;
  editorId: string;
  editorlang: string;
}) => {
  const editorRef = useRef<EditorJS | null>(null);
  const getInitialData = useEffectEvent(() => (value ? JSON.parse(value) : {}));
  const notifyChange = useEffectEvent((content: string) => onChange?.(content));

  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = new EditorJS({
        holder: editorId,
        data: getInitialData(),
        tools: {
          ...EDITOR_TOOLS,
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File): Promise<{
                  success: number;
                  file?: {
                    url: string;
                  };
                  message?: string;
                }> {
                  const payload = { file };
                  const type = "guideContent";

                  try {
                    const response = await uploadGuideImage(
                      guideId,
                      type,
                      payload,
                    );

                    if (response.status === 200) {
                      const prefixedUrl = `${process.env.NEXT_PUBLIC_ASSET_URL}${response.path}`;
                      return {
                        success: 1,
                        file: {
                          url: prefixedUrl,
                        },
                      };
                    } else {
                      throw new Error("Failed to upload image");
                    }
                  } catch (error) {
                    console.error("Image upload error:", error);
                    return {
                      success: 0,
                      message: "Image upload failed",
                    };
                  }
                },
              },
            },
          },
          productPlugin: {
            class: ProductPlugin,
            config: {
              editorlang,
            },
          },
          StorePlugin: {
            class: StorePlugin,
            config: {
              editorlang,
            },
          },
        },
        onChange: async () => {
          if (editorRef.current) {
            const content = await editorRef.current.save();
            notifyChange(JSON.stringify(content));
          }
        },
      });
    }

    return () => {
      if (
        editorRef.current &&
        typeof editorRef.current.destroy === "function"
      ) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [editorId, editorlang, guideId]);

  return (
    <div
      id={editorId}
      className="w-full border border-gray-300 bg-gray-100 px-14 py-4 rounded-lg shadow-lg"
    ></div>
  );
};

export default GuideEditor;

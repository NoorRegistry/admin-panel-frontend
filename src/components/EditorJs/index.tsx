"use client";
import React, { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import { EDITOR_TOOLS } from "@/components/EditorJs/EditorTools";
import { uploadGuideImage } from "@/services/upload.service";
import ImageTool from "@editorjs/image";
import { ProductPlugin } from "@/components/EditorJs/Plugins/ProductPlugin";
import { StorePlugin } from "@/components/EditorJs/Plugins/StorePlugin";

const GuideEditor = ({
  value,
  onChange,
  guideId,
  editorId,
  editorlang
}: {
  value: string;
  onChange?: (value: string) => void;
  guideId: string;
  editorId: string;
  editorlang: string;
}) => {
  const editorRef = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = new EditorJS({
        holder: editorId,
        data: value ? JSON.parse(value) : {},
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
                      payload
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
            onChange?.(JSON.stringify(content));
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
  }, [editorId]);

  return (
    <div
      id={editorId}
      className="w-full border border-gray-300 bg-gray-100 px-14 py-4 rounded-lg shadow-lg"
    ></div>
  );
};

export default GuideEditor;

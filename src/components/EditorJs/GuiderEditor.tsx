"use client";
import React, { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import { EDITOR_TOOLS } from "@/components/EditorJs/EditorTools";

const Editor = () => {
  const editorRef = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = new EditorJS({
        holder: "editorjs",
        tools: EDITOR_TOOLS,
        onChange: async () => {
          if (editorRef.current) {
            const content = await editorRef.current.save();
            console.log(content);
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
  }, []);

  return (
    <div
    id="editorjs"
    className="w-full border border-gray-300 bg-gray-100 p-4 rounded-lg shadow-lg"
  ></div>
  );
};

export default Editor;

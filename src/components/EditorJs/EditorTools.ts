import Paragraph from "@editorjs/paragraph";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Warning from "@editorjs/warning";
import Delimiter from "@editorjs/delimiter";
import Title from "title-editorjs";
import EditorjsList from "@editorjs/list";
import ImageTool from "@editorjs/image";
import Table from "@editorjs/table";
import CodeTool from "@editorjs/code";
import RawTool from "@editorjs/raw";
import InlineCode from "@editorjs/inline-code";
import { ProductPlugin } from "@/components/EditorJs/Plugins/ProductPlugin";
import { StorePlugin } from "@/components/EditorJs/Plugins/StorePlugin";

export const EDITOR_TOOLS: { [toolName: string]: any } = {
  paragraph: {
    class: Paragraph,
    inlineToolbar: true,
  },
  header: {
    class: Header,
    inlineToolbar: true,
    config: {
      placeholder: "Enter a header",
      levels: [1, 2, 3, 4, 5, 6],
      defaultLevel: 3,
      defaultAlignment: "left",
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
    shortcut: "CMD+SHIFT+O",
    config: {
      quotePlaceholder: "Enter a quote",
      captionPlaceholder: "Quote's author",
    },
  },
  warning: {
    class: Warning,
    inlineToolbar: true,
    shortcut: "CMD+SHIFT+W",
    config: {
      titlePlaceholder: "Title",
      messagePlaceholder: "Message",
    },
  },
  delimiter: {
    class: Delimiter,
  },
  title: {
    class: Title,
    inlineToolbar: true,
  },
  list: {
    class: EditorjsList,
    inlineToolbar: true,
    config: {
      defaultStyle: "unordered",
    },
  },
  image: {
    class: ImageTool,
    config: {
      endpoints: {
        byFile: "http://localhost:8008/uploadFile",
        byUrl: "http://localhost:8008/fetchUrl",
      },
    },
  },
  table: {
    class: Table,
    inlineToolbar: true,
    config: {
      rows: 2,
      cols: 3,
      maxRows: 5,
      maxCols: 5,
    },
  },
  code: {
    class: CodeTool,
  },
  raw: {
    class: RawTool,
  },
  inlineCode: {
    class: InlineCode,
  },
  productPlugin: {
    class: ProductPlugin,
  },
  StorePlugin: {
    class: StorePlugin,
  },
};

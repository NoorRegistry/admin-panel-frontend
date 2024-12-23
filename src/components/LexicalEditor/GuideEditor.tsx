import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import React, { useState } from "react";
import ErrorBoundary from "./ErrorBoundary";
import { StoreProductNode } from "./StoreProductNode";
import StoreProductSelector from "./StoreProductSelector";

const initialConfig = {
  namespace: "GuideEditor",
  onError: (error: any) => console.error(error),
  nodes: [StoreProductNode],
  ErrorBoundary: ErrorBoundary,
};

const GuideEditor = () => {
  const [isSelectorVisible, setSelectorVisible] = useState(false);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div>
        <button onClick={() => setSelectorVisible(true)}>
          Add Store/Product
        </button>
        <StoreProductSelector
          isOpen={isSelectorVisible}
          //   onSelect={handleSelect}
          onClose={() => setSelectorVisible(false)}
        />
        <RichTextPlugin
          contentEditable={
            <ContentEditable style={{ minHeight: "100px", outline: "none" }} />
          }
          placeholder={<div>Enter your guide here...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
    </LexicalComposer>
  );
};

const LexicalErrorBoundary = (props: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary onError={(error) => console.error(error)}>
      {props.children}
    </ErrorBoundary>
  );
};

export default GuideEditor;

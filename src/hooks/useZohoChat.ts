import { EAdminRole } from "@/types";
import { getAdminRole } from "@/utils/helper";
import { useEffect } from "react";

declare global {
  interface Window {
    $zoho?: {
      salesiq?: {
        ready: () => void;
      };
    };
  }
}

export const useZohoChat = () => {
  useEffect(() => {
    // Only show chat for non-internal admins (store admins)
    const isInternalAdmin = getAdminRole() === EAdminRole.INTERNAL_ADMIN;

    // Don't load chat if user is internal admin
    if (isInternalAdmin) {
      // Remove existing script if it exists
      const existingScript = document.getElementById("zsiqscript");
      if (existingScript) {
        existingScript.remove();
      }
      return;
    }

    // Initialize Zoho SalesIQ object
    if (!window.$zoho) {
      window.$zoho = {};
    }
    if (!window.$zoho.salesiq) {
      window.$zoho.salesiq = {
        ready: function () {},
      };
    }

    // Check if script is already loaded
    const existingScript = document.getElementById("zsiqscript");
    if (existingScript) {
      return;
    }

    // Create and load the Zoho chat script
    const script = document.createElement("script");
    script.id = "zsiqscript";
    script.src =
      "https://salesiq.zohopublic.in/widget?wc=siq7b628d9d006059a6b741bf93bf5b7be824065a6bce8aa6cb6493cbf63fcf5a63";
    script.defer = true;

    // Add error handling
    script.onerror = () => {
      console.warn("Failed to load Zoho chat widget");
    };

    document.head.appendChild(script);

    // Cleanup function to remove script when component unmounts
    return () => {
      const scriptElement = document.getElementById("zsiqscript");
      if (scriptElement) {
        scriptElement.remove();
      }
    };
  }, []);
};

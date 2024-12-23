import { IProduct, IStore } from "@/types";
import { ElementNode, NodeKey } from "lexical";

export class StoreProductNode extends ElementNode {
  __storeOrProduct: IStore | IProduct;

  static getType(): string {
    return "store-product";
  }

  static clone(node: StoreProductNode): StoreProductNode {
    return new StoreProductNode(node.__storeOrProduct, node.__key);
  }

  constructor(storeOrProduct: IStore | IProduct, key?: NodeKey) {
    super(key);
    this.__storeOrProduct = storeOrProduct;
  }

  // DOM representation of the node
  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "store-product-node";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.padding = "10px";
    div.style.border = "1px solid #ccc";
    div.style.borderRadius = "4px";
    div.style.margin = "5px 0";

    // Add image
    const img = document.createElement("img");
    img.src =
      "storeLogo" in this.__storeOrProduct
        ? this.__storeOrProduct.storeLogo
        : this.__storeOrProduct.images[0];
    img.alt = "Store/Product Image";
    img.style.width = "50px";
    img.style.height = "50px";
    img.style.marginRight = "10px";
    img.style.borderRadius = "4px";

    // Add title
    const title = document.createElement("span");
    title.textContent =
      "nameEn" in this.__storeOrProduct
        ? this.__storeOrProduct.nameEn
        : "ashfaq";
    title.style.fontSize = "14px";
    title.style.color = "#333";

    div.appendChild(img);
    div.appendChild(title);

    return div;
  }

  /* updateDOM(prevNode: StoreProductNode, dom: HTMLElement): boolean {
    return false; // No dynamic DOM updates required
  } */
}

import { fetchProducts } from "@/services/product.service";
import { IPaginatedResponse, TEditorProduct } from "@/types";
import { ShoppingCartOutlined } from "@ant-design/icons";
import ReactDOMServer from "react-dom/server";
import { BlockToolConstructorOptions, BlockTool } from "@editorjs/editorjs";
import { formatPrice } from "@/utils/helper";

export class ProductPlugin implements BlockTool {
  api: any;
  data: TEditorProduct;
  config: any;
  wrapper: HTMLElement | undefined;
  products: TEditorProduct[] = [];

  constructor({
    data,
    api,
    config,
  }: BlockToolConstructorOptions<TEditorProduct>) {
    this.api = api;
    this.data = data || {};
    this.config = config || {};
    this.wrapper = undefined;
  }

  async fetchProducts(): Promise<void> {
    try {
      const response: IPaginatedResponse<TEditorProduct> = await fetchProducts(
        0,
        0,
        "",
        {
          isActive: 1,
          status: "Approved",
        },
      );

      this.products = response.data;
      this.populateDropdown();

      if (this.data.id) {
        const select = this.wrapper!.querySelector("select")!;
        select.value = this.data.id;
        select.dispatchEvent(new Event("change"));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      this.showError("Failed to load products.");
    }
  }

  render(): HTMLElement {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add(
      "p-4",
      "border",
      "rounded-lg",
      "bg-white",
      "shadow-sm",
      "space-y-4",
    );

    const select = document.createElement("select");
    select.classList.add(
      "w-full",
      "p-3",
      "control-outline",
      "bg-multiple-item",
      "option-active-bg",
      "option-selected-bg",
      "option-selected-color",
      "option-selected-font-weight",
      "appearance-none",
      "overflow-hidden",
    );

    // Apply custom styles
    select.style.borderColor = "rgba(120, 138, 173, 0.27)";
    select.style.backgroundColor = "var(--color-primary-50)";

    select.addEventListener("change", () => {
      const selectedId = select.value;
      const selectedProduct = this.products.find((p) => p.id === selectedId);
      if (selectedProduct) {
        this.selectProduct(selectedProduct);
      }
    });

    this.wrapper.appendChild(select);
    this.fetchProducts();

    return this.wrapper;
  }

  populateDropdown(): void {
    const select = this.wrapper!.querySelector("select")!;
    select.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.text = "Select a product";
    placeholder.value = "";
    select.appendChild(placeholder);

    this.products.forEach((product) => {
      const option = document.createElement("option");
      option.value = product.id;
      option.text =
        this.config.editorlang == "en" ? product.nameEn : product.nameAr;
      select.appendChild(option);
    });
  }

  selectProduct(product: TEditorProduct): void {
    this.data = {
      id: product.id,
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      images: product.images[0]?.path || "",
      price: product.price,
      currencyCode: product.currencyCode,
      qty: product.qty,
    };

    const existingProductCard = this.wrapper!.querySelector(".product-card");
    if (existingProductCard) {
      existingProductCard.remove();
    }

    const productCard = document.createElement("div");
    productCard.classList.add(
      "product-card",
      "flex",
      "items-center",
      "gap-4",
      "p-4",
      "border",
      "rounded-lg",
      "bg-white",
      "shadow",
      "mt-4",
    );

    productCard.innerHTML = `
    <img src="https://assets.shiftgiftme.com${
      product.images[0]?.path || ""
    }" alt="${
      this.config.editorlang == "en" ? product.nameEn : product.nameAr
    }" class="w-24 h-24 rounded-md object-cover" />
    <div>
      <h3 class="text-lg font-semibold">${
        this.config.editorlang == "en" ? product.nameEn : product.nameAr
      }</h3>
      <p class="text-gray-500">${formatPrice(product.price, product.currencyCode)}</p>
      <p class="text-gray-500">Qty: ${product.qty}</p>
    </div>
  `;
    this.wrapper!.appendChild(productCard);
  }

  showError(message: string): void {
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("text-red-500", "mt-2");
    errorDiv.textContent = message;
    this.wrapper!.appendChild(errorDiv);
  }

  save(): TEditorProduct {
    return this.data;
  }

  static get toolbox() {
    const iconHtml = ReactDOMServer.renderToString(<ShoppingCartOutlined />);

    return {
      title: "Product",
      icon: iconHtml,
    };
  }
}

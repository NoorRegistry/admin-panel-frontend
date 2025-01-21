import { fetchActiveStores } from "@/services/stores.service";
import { IPaginatedResponse, TEditorStore } from "@/types";
import { ShopOutlined } from "@ant-design/icons";
import { BlockTool, BlockToolConstructorOptions } from "@editorjs/editorjs";
import ReactDOMServer from "react-dom/server";

export class StorePlugin implements BlockTool {
  api: any;
  data: TEditorStore;
  config: any;
  wrapper: HTMLElement | undefined;
  stores: TEditorStore[] = [];

  constructor({
    data,
    api,
    config,
  }: BlockToolConstructorOptions<TEditorStore>) {
    this.api = api;
    this.data = data || {};
    this.config = config || {};
    this.wrapper = undefined;
  }

  async fetchProducts(): Promise<void> {
    try {
      const response: IPaginatedResponse<TEditorStore> =
        await fetchActiveStores(true);
      this.stores = response.data;

      this.populateDropdown();

      if (this.data.id) {
        const select = this.wrapper!.querySelector("select")!;
        select.value = this.data.id.toString();
        select.dispatchEvent(new Event("change"));
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      this.showError("Failed to load stores.");
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
      "border",
      "rounded-lg",
      "bg-gray-50",
      "focus:ring-2",
      "focus:ring-blue-400",
    );

    select.addEventListener("change", () => {
      const selectedId = select.value;
      const selectedProduct = this.stores.find(
        (p) => p.id.toString() === selectedId,
      );
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
    placeholder.text = "Select a store";
    placeholder.value = "";
    select.appendChild(placeholder);

    this.stores.forEach((store) => {
      const option = document.createElement("option");
      option.value = store.id.toString();
      option.text =
        this.config.editorlang == "en" ? store.nameEn : store.nameAr;
      select.appendChild(option);
    });
  }

  selectProduct(store: TEditorStore): void {
    this.data = store;

    const existingStoreCard = this.wrapper!.querySelector(".store-card");
    if (existingStoreCard) {
      existingStoreCard.remove();
    }

    let storeCard = this.wrapper!.querySelector(".store-card");
    if (!storeCard) {
      storeCard = document.createElement("div");
      this.wrapper!.appendChild(storeCard);
    }

    storeCard.innerHTML = `
<div class="store-card flex items-center gap-4 p-4 border rounded-lg bg-white shadow mt-4">
  <img 
    src="https://assets.shiftgiftme.com${store.storeLogo}" 
    alt="${this.config.editorlang == "en" ? store.nameEn : store.nameAr}" 
    class="w-24 h-24 rounded-md object-cover" 
  />
  <div>
    <h3 class="text-lg font-semibold">${
      this.config.editorlang == "en" ? store.nameEn : store.nameAr
    }</h3>
    <p class="text-sm text-gray-500">
      ${this.config.editorlang == "en" ? store.locationEn : store.locationAr}
    </p>
    <p class="text-sm text-gray-500">
      ${store.countryCode} ${store.mobileNumber}
    </p>
  </div>
</div>

    `;
  }

  showError(message: string): void {
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("text-red-500", "mt-2");
    errorDiv.textContent = message;
    this.wrapper!.appendChild(errorDiv);
  }

  save(): TEditorStore {
    return this.data;
  }

  static get toolbox() {
    const iconHtml = ReactDOMServer.renderToString(<ShopOutlined />);

    return {
      title: "Store",
      icon: iconHtml,
    };
  }
}

interface Store {
  id: number;
  nameEn: string;
  storeLogo: any;
}

interface StoreToolData {
  id?: number;
  nameEn?: string;
  storeLogo?: any;
}

interface ProductToolConstructorParams {
  data: StoreToolData;
  api: any;
}

export class StorePlugin {
  api: any;
  data: StoreToolData;
  wrapper: HTMLElement | undefined;
  stores: Store[];
  token: string;

  constructor({ data, api }: ProductToolConstructorParams) {
    this.api = api;
    this.data = data || {};
    this.wrapper = undefined;
    this.stores = [];
    this.token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImZpcnN0TmFtZSI6IkFzaGZhcSIsImxhc3ROYW1lIjoiUGF0d2FyaSIsImVtYWlsIjoiYXNoZmFxQGdtYWlsLmNvbSJ9LCJzdG9yZUlkIjpudWxsLCJyb2xlIjoiSU5URVJOQUxfQURNSU4iLCJwZXJtaXNzaW9ucyI6IltdIiwiaWF0IjoxNzM1MTQ1MDczLCJleHAiOjE3MzUyMzE0NzN9.WAK8os_8MG4k9ekMsCbNJtUPaP5VPgfvQtr37i2K9hw";
  }

  async fetchProducts(): Promise<void> {
    try {
      const response = await fetch(
        "https://nestjs-authentication-sigma.vercel.app/v1/api/admin/stores",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch stores");

      const result = await response.json();
      this.stores = result.data;

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
      "space-y-4"
    );

    const select = document.createElement("select");
    select.classList.add(
      "w-full",
      "p-3",
      "border",
      "rounded-lg",
      "bg-gray-50",
      "focus:ring-2",
      "focus:ring-blue-400"
    );

    select.addEventListener("change", () => {
      const selectedId = select.value;
      const selectedProduct = this.stores.find(
        (p) => p.id.toString() === selectedId
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
      option.text = store.nameEn;
      select.appendChild(option);
    });
  }

  selectProduct(store: Store): void {
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
        <img src="https://assets.shiftgiftme.com${store.storeLogo}" alt="${store.nameEn}" class="w-24 h-24 rounded-md object-cover" />
        <div>
          <h3 class="text-lg font-semibold">${store.nameEn}</h3>
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

  save(): StoreToolData {
    return this.data;
  }

  static get toolbox() {
    return {
      title: "Store",
      icon: "🏪",
    };
  }
}

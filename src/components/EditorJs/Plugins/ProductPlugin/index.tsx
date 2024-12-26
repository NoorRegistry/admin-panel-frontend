interface Product {
  id: number;
  nameEn: string;
  images: any;
  price: string;
}

interface ProductToolData {
  id?: number;
  name?: string;
  image?: any;
  price?: string;
}

interface ProductToolConstructorParams {
  data: ProductToolData;
  api: any;
}

export class ProductPlugin {
  api: any;
  data: ProductToolData;
  wrapper: HTMLElement | undefined;
  products: Product[];
  token: string;

  constructor({ data, api }: ProductToolConstructorParams) {
    this.api = api;
    this.data = data || {};
    this.wrapper = undefined;
    this.products = [];
    this.token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImZpcnN0TmFtZSI6IkFzaGZhcSIsImxhc3ROYW1lIjoiUGF0d2FyaSIsImVtYWlsIjoiYXNoZmFxQGdtYWlsLmNvbSJ9LCJzdG9yZUlkIjpudWxsLCJyb2xlIjoiSU5URVJOQUxfQURNSU4iLCJwZXJtaXNzaW9ucyI6IltdIiwiaWF0IjoxNzM1MTQ1MDczLCJleHAiOjE3MzUyMzE0NzN9.WAK8os_8MG4k9ekMsCbNJtUPaP5VPgfvQtr37i2K9hw";
  }

  async fetchProducts(): Promise<void> {
    try {
      const response = await fetch(
        "https://nestjs-authentication-sigma.vercel.app/v1/api/admin/products",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch products");

      const result = await response.json();
      this.products = result.data;

      this.populateDropdown();

      if (this.data.id) {
        const select = this.wrapper!.querySelector("select")!;
        select.value = this.data.id.toString();
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
      const selectedProduct = this.products.find(
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
    placeholder.text = "Select a product";
    placeholder.value = "";
    select.appendChild(placeholder);

    this.products.forEach((product) => {
      const option = document.createElement("option");
      option.value = product.id.toString();
      option.text = product.nameEn;
      select.appendChild(option);
    });
  }

  selectProduct(product: Product): void {
    this.data = product;

    const existingProductCard = this.wrapper!.querySelector(".product-card");
    if (existingProductCard) {
      existingProductCard.remove();
    }
  

    let productCard = this.wrapper!.querySelector(".product-card");
    if (!productCard) {
      productCard = document.createElement("div");
      this.wrapper!.appendChild(productCard);
    }

    productCard.innerHTML = `
      <div class="product-card flex items-center gap-4 p-4 border rounded-lg bg-white shadow mt-4">
        <img src="https://assets.shiftgiftme.com${product.images[0].path}" alt="${product.nameEn}" class="w-24 h-24 rounded-md object-cover" />
        <div>
          <h3 class="text-lg font-semibold">${product.nameEn}</h3>
          <p class="text-gray-500">KWD ${product.price}</p>
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

  save(): ProductToolData {
    return this.data;
  }

  static get toolbox() {
    return {
      title: "Product",
      icon: "🛒",
    };
  }
}

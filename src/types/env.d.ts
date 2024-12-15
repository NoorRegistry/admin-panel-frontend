declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_ASSET_URL: string;
    NEXT_PUBLIC_ALLOWED_PRODUCT_IMAGES: number;
  }
}

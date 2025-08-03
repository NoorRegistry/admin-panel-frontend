import { IApiError } from "@/api/http";
import { queryClient } from "@/api/queryClient";
import {
  deleteRelatedProduct,
  fetchProducts,
  fetchRelatedProducts,
  postRelatedProducts,
} from "@/services/product.service";
import { EQueryKeys, IProduct } from "@/types";
import { DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AutoComplete, Button, Drawer, Flex, Image, message } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
import { IShowRelatedProductsDrawerConfig } from "../../products.types";

function RelatedProductsInfo({
  config,
  onClose,
}: {
  config: IShowRelatedProductsDrawerConfig;
  onClose: () => void;
}) {
  const [messageApi, contextHolder] = message.useMessage();
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue] = useDebounce(searchValue, 300);

  const { data, isFetching } = useQuery({
    queryKey: [EQueryKeys.RELATED_PRODUCTS, config.productId],
    queryFn: ({ queryKey }) => fetchRelatedProducts(queryKey[1]!),
    enabled: Boolean(config.productId),
  });

  // Search for products to add as related products
  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: [EQueryKeys.PRODUCTS, 1, 10, debouncedSearchValue],
    queryFn: () => fetchProducts(1, 10, debouncedSearchValue),
    enabled: Boolean(debouncedSearchValue.length > 2),
  });

  const addRelatedProductMutation = useMutation({
    mutationFn: ({
      productId,
      relatedProductId,
    }: {
      productId: string;
      relatedProductId: string;
      selectedProduct: IProduct;
    }) => {
      return postRelatedProducts(productId, [relatedProductId]);
    },
    onSuccess: (data, variables) => {
      // Update the cache with the new related product
      queryClient.setQueryData<IProduct[]>(
        [EQueryKeys.RELATED_PRODUCTS, variables.productId],
        (old) => {
          return old
            ? [...old, variables.selectedProduct]
            : [variables.selectedProduct];
        },
      );

      // Show success message
      messageApi.success({
        content: t("products.productAddedToRelated", {
          productName: variables.selectedProduct.nameEn,
        }),
      });
    },
    onError: (err: IApiError) => {
      messageApi.error({
        content: err.detail || "Failed to add related product",
      });
    },
  });

  const deleteRelatedProductMutation = useMutation({
    mutationFn: ({
      productId,
      relatedProductId,
    }: {
      productId: string;
      relatedProductId: string;
      productName: string;
    }) => {
      return deleteRelatedProduct(productId, relatedProductId);
    },
    onSuccess: (data, variables) => {
      // Update the cache by removing the deleted product
      queryClient.setQueryData<IProduct[]>(
        [EQueryKeys.RELATED_PRODUCTS, variables.productId],
        (old) => {
          return (
            old?.filter(
              (product) => product.id !== variables.relatedProductId,
            ) || []
          );
        },
      );

      // Show success message - variables contains all the data passed to mutate()
      messageApi.success({
        content: t("products.productRemovedFromRelated", {
          productName: variables.productName,
        }),
      });
    },
    onError: (err: IApiError) => {
      messageApi.error({
        content: err.detail || "Failed to remove related product",
      });
    },
  });

  /* const handleCreateProduct = (product: TCreateProduct) => {
    if (product.images && Array.isArray(product.images))
      product.images = product.images.map((image) => image.name ?? image.path);
    if (Array.isArray(product.categoryId)) {
      product.categoryId = product.categoryId[product.categoryId.length - 1];
    }
    createProductMutation.mutate(product);
  }; */

  const handleAddRelatedProduct = (selectedProductId: string) => {
    const selectedProduct = searchResults?.data.find(
      (product) => product.id === selectedProductId,
    );

    if (selectedProduct && config.productId) {
      // Call API to persist the relationship first
      addRelatedProductMutation.mutate({
        productId: config.productId,
        relatedProductId: selectedProductId,
        selectedProduct: selectedProduct,
      });

      // Clear search
      setSearchValue("");
    }
  };

  const handleDeleteRelatedProduct = (relatedProductId: string) => {
    if (config.productId) {
      // Find the product name from the current data
      const productToDelete = data?.find(
        (product) => product.id === relatedProductId,
      );
      const productName = productToDelete?.nameEn || "Product";

      deleteRelatedProductMutation.mutate({
        productId: config.productId,
        relatedProductId: relatedProductId,
        productName: productName,
      });
    }
  };

  const autoCompleteOptions =
    searchResults?.data
      .filter((product) => product.id !== config.productId) // Exclude current product
      .filter((product) => !data?.some((related) => related.id === product.id)) // Exclude already related products
      .map((product) => ({
        value: product.id,
        label: (
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              {product.images && product.images.length > 0 ? (
                <Image
                  width={40}
                  height={40}
                  src={`${process.env.NEXT_PUBLIC_ASSET_URL}${product.images[0].path}`}
                  alt={product.nameEn}
                  className="rounded object-cover"
                  preview={false}
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">No Image</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{product.nameEn}</div>
              <div className="text-sm text-gray-500 truncate">
                {product.nameAr}
              </div>
              <div className="text-xs text-gray-400">
                {product.price} {product.currencyCode} •{" "}
                {product.category?.name}
              </div>
            </div>
          </div>
        ),
      })) || [];

  return (
    <div>
      {contextHolder}
      <Drawer
        title={config.productName}
        placement="right"
        loading={isFetching}
        size="large"
        destroyOnClose
        onClose={onClose}
        open={config.open}
        footer={
          <Flex align="end" justify="end" gap={16}>
            <Button
              loading={addRelatedProductMutation.isPending}
              onClick={onClose}
            >
              {t("common.close")}
            </Button>
          </Flex>
        }
      >
        <div className="mb-4">
          <AutoComplete
            value={searchValue}
            onChange={setSearchValue}
            onSelect={handleAddRelatedProduct}
            options={autoCompleteOptions}
            placeholder="Search products to add as related..."
            className="w-full"
            notFoundContent={
              debouncedSearchValue.length <= 2
                ? "Type at least 3 characters to search"
                : isSearching
                  ? t("common.searching")
                  : t("products.noProductsFound")
            }
            filterOption={false} // We handle filtering server-side
          />
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.map((product: IProduct) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow flex flex-col relative"
            >
              {/* Delete button */}
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                className="!absolute top-2 right-2 z-10"
                onClick={() => handleDeleteRelatedProduct(product.id)}
                loading={deleteRelatedProductMutation.isPending}
              />
              {product.images && product.images.length ? (
                <Image.PreviewGroup
                  items={
                    product.images.map(
                      (image: { id: string; path: string }) =>
                        `${process.env.NEXT_PUBLIC_ASSET_URL}${image.path!}`,
                    ) ?? []
                  }
                >
                  <Image
                    width="100%"
                    height={128}
                    src={`${process.env.NEXT_PUBLIC_ASSET_URL}${product.images[0].path!}`}
                    alt={product.nameEn}
                    className="w-full h-32 object-cover rounded"
                    style={{ objectFit: "cover" }}
                  />
                </Image.PreviewGroup>
              ) : (
                <Image
                  width="100%"
                  height={128}
                  preview={false}
                  src={`${process.env.NEXT_PUBLIC_ASSET_URL}/public/common/no-image.png`}
                  alt=""
                  className="w-full h-32 object-cover rounded"
                  style={{ objectFit: "cover" }}
                />
              )}
              <div className="p-4 space-y-2">
                <div className="font-semibold">{product.nameEn}</div>
                <div className="text-gray-500">{product.nameAr}</div>
                <div className="flex justify-between">
                  <div className="">
                    {t("products.price")}: {product.price}{" "}
                    {product.currencyCode}
                  </div>
                  <div className="">
                    {t("products.qty")}: {product.qty}
                  </div>
                </div>
                <div className="">
                  {t("products.category")}: {product.category?.name}
                </div>
                <div className="">
                  {t("stores.store")}: {product.store?.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
}

export default RelatedProductsInfo;

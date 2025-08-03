import { IApiError } from "@/api/http";
import { queryClient } from "@/api/queryClient";
import {
  fetchRelatedProducts,
  patchProduct,
  postProduct,
} from "@/services/product.service";
import {
  EAdminRole,
  EQueryKeys,
  IPaginatedResponse,
  IProduct,
  IQueryState,
  TCreateProduct,
} from "@/types";
import { getAdminRole, updatePaginatedData } from "@/utils/helper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Drawer, Flex, message } from "antd";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { IShowRelatedProductsDrawerConfig } from "../../products.types";

function ProductsInfo({
  config,
  onClose,
  queryState,
}: {
  config: IShowRelatedProductsDrawerConfig;
  onClose: () => void;
  queryState: IQueryState;
}) {
  const [messageApi, contextHolder] = message.useMessage();
  const { t } = useTranslation();

  const isInternalAdmin = getAdminRole() === EAdminRole.INTERNAL_ADMIN;

  const { data, isFetching } = useQuery({
    queryKey: [EQueryKeys.RELATED_PRODUCTS, config.productId],
    queryFn: ({ queryKey }) => fetchRelatedProducts(queryKey[1]),
  });

  const createProductMutation = useMutation({
    mutationFn: (data: TCreateProduct) => {
      return config.productId
        ? patchProduct(config.productId, data)
        : postProduct(data);
    },
    onSuccess: (data, variables) => {
      messageApi.success({
        content: t(
          config.productId
            ? "products.productEdited"
            : "products.productCreated",
          { name: variables.nameEn },
        ),
      });
      queryClient.setQueryData<IProduct | undefined>(
        [EQueryKeys.PRODUCT, config.productId],
        (old: any) => {
          return { ...old, ...data };
        },
      );
      queryClient.setQueryData<IPaginatedResponse<IProduct>>(
        [EQueryKeys.PRODUCTS, queryState],
        (old) => {
          return updatePaginatedData(data, old, config.productId);
        },
      );
      queryClient.invalidateQueries({
        queryKey: [EQueryKeys.CATEGORIES, isInternalAdmin],
      });
      onClose();
    },
    onError: (err: IApiError) => {
      messageApi.error({
        content: err.detail,
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
            <Button loading={createProductMutation.isPending} onClick={onClose}>
              {t("common.cancel")}
            </Button>
          </Flex>
        }
      >
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.map((product: IProduct) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col"
            >
              {product.images?.length > 0 && (
                <Image
                  src={product.images[0]?.path || product.images[0]}
                  alt={product.nameEn}
                  width={400}
                  height={128}
                  className="w-full h-32 object-cover rounded mb-4"
                  style={{ objectFit: "cover" }}
                />
              )}
              <div className="font-semibold mb-2">{product.nameEn}</div>
              <div className="text-gray-500 mb-2">{product.nameAr}</div>
              <div className="mb-2">
                {t("products.price")}: {product.price} {product.currencyCode}
              </div>
              <div className="mb-2">
                {t("products.qty")}: {product.qty}
              </div>
              <div className="mb-2">
                {t("products.category")}: {product.category?.name}
              </div>
              <div className="mb-2">
                {t("stores.store")}: {product.store?.name}
              </div>
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
}

export default ProductsInfo;

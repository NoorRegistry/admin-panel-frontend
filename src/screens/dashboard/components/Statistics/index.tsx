import { fetchStatistics } from "@/services/statistics.service";
import { EQueryKeys } from "@/types";
import { formatNumber } from "@/utils/helper";
import {
  GiftOutlined,
  ProductOutlined,
  QuestionCircleOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row, Skeleton, Tooltip, Typography } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";

type StatisticsData = {
  [key: string]: {
    total?: number;
    [key: string]: number | undefined;
  };
};

type IconsMap = {
  [key: string]: JSX.Element;
};

const icons: IconsMap = {
  stores: <ShopOutlined />,
  products: <ProductOutlined />,
  users: <UserOutlined />,
  storeAdmins: <TeamOutlined />,
  registries: <GiftOutlined />,
};

const StatisticsCards: React.FC = () => {
  const { t } = useTranslation();
  const { data, isFetching } = useQuery({
    queryKey: [EQueryKeys.STATISTICS],
    queryFn: fetchStatistics,
    refetchInterval: 120000, // 2 minutes in milliseconds
    // Optional: only refetch if component is in view
    refetchIntervalInBackground: false,
  });

  const getTooltipText = (
    key: string,
    data: { [key: string]: number | undefined },
  ): string | null => {
    if (key === "stores") {
      return `${t("common.active")}: ${data.active || 0}, ${t("common.inactive")}: ${data.inactive || 0}`;
    }
    if (key === "products") {
      return `${t("common.approved")}: ${data.approved || 0}, ${t("common.pending")}: ${data.pending || 0}, ${t("common.rejected")}: ${data.rejected || 0}`;
    }
    if (key === "registries") {
      return `${t("products.totalProducts")}: ${data.totalQuantity || 0}`;
    }
    return null;
  };

  const statistics: StatisticsData = data || {};

  return (
    <div className="overflow-x-auto whitespace-nowrap">
      <Row gutter={[16, 16]} wrap={false}>
        {isFetching
          ? Array.from({ length: 3 }).map((_, index) => (
              <Col key={index}>
                <Card className="min-w-[200px]">
                  <div className="flex flex-col items-center gap-2">
                    <Skeleton.Input
                      active
                      className="w-[20px] h-[32px] rounded-md"
                    />
                    <div className="flex items-center gap-2">
                      <Skeleton.Avatar
                        active
                        shape="circle"
                        className="w-[24px] h-[24px]"
                      />
                      <Skeleton.Input
                        active
                        className="w-[100px] h-[20px] rounded-md"
                      />
                    </div>
                  </div>
                </Card>
              </Col>
            ))
          : Object.entries(statistics).map(([key, value]) => (
              <Col key={key}>
                <Card className="min-w-[200px]">
                  <div className="flex flex-col items-center gap-2">
                    <Typography.Title level={3}>
                      {formatNumber(
                        value.total !== undefined
                          ? value.total
                          : Object.values(value).reduce(
                              (a, b) => (a || 0) + (b || 0),
                              0,
                            ) || 0,
                      )}
                    </Typography.Title>
                    <div className="flex items-center gap-2">
                      {icons[key]}
                      <Typography.Title level={5} type="secondary">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Typography.Title>
                      {getTooltipText(key, value) && (
                        <Tooltip title={getTooltipText(key, value)}>
                          <QuestionCircleOutlined />
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
      </Row>
    </div>
  );
};

export default StatisticsCards;

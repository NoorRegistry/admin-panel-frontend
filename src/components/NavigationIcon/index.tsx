"use client";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";

type Props = ComponentProps<typeof ArrowRightOutlined> & {
  kind?: "arrow" | "chevron";
  direction?: "forward" | "back";
};

/** Use for custom navigation. Ant Design controls handle their own RTL icons. */
export default function NavigationIcon({
  kind = "arrow",
  direction = "forward",
  ...props
}: Props) {
  const { i18n } = useTranslation();
  const rtl = i18n.dir() === "rtl";
  const left = direction === "forward" ? rtl : !rtl;
  const Icon =
    kind === "chevron"
      ? left
        ? LeftOutlined
        : RightOutlined
      : left
        ? ArrowLeftOutlined
        : ArrowRightOutlined;
  return <Icon {...props} />;
}

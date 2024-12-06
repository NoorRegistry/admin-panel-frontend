"use client";
import { queryClient } from "@/api/queryClient";
import "@/i18n";
import antdTheme from "@/theme/antdTheme";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import i18next from "i18next";
import { Poppins, Tajawal } from "next/font/google";
import "../theme/globals.css";

const secondaryFont = Tajawal({
  weight: ["300", "400", "500", "700"],
  style: ["normal"],
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-secondary",
});

const primaryFont = Poppins({
  weight: ["300", "400", "500", "700"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-primary",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = i18next.language;
  const direction = locale === "en" ? "ltr" : "rtl";
  return (
    <html lang={locale} dir={direction}>
      <body
        className={`${primaryFont.variable} ${secondaryFont.variable} antialiased font-sans`}
      >
        <AntdRegistry>
          <ConfigProvider direction={direction} theme={antdTheme}>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}

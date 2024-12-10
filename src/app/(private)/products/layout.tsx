"use client";
import React from "react";

function ProductsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}

export default ProductsLayout;

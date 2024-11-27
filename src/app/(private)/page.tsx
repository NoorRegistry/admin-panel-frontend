"use client";
import { Typography } from "antd";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-sans">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Typography.Title>Content</Typography.Title>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <Typography.Title>Footer</Typography.Title>
      </footer>
    </div>
  );
}

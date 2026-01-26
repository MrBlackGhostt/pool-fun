"use client";
import dynamic from "next/dynamic";
import { ReactNode } from "react";
const Navbar = dynamic(() => import("./navbar"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-end p-4 bg-gray-900">
      <div className="h-10 w-32 bg-gray-700 rounded-lg animate-pulse" />
    </div>
  ),
});
export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

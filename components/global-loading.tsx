"use client";

import { useLoadingGlobalStore } from "@/store/loadingGlobalStore";
import { HashLoader } from "react-spinners";

export default function GlobalLoading() {
  const loading = useLoadingGlobalStore((state) => state.loading);

  if (!loading) return null;

  return (
    <div className="w-screen h-screen fixed bg-[#00000050] flex items-center justify-center top-0">
      <HashLoader color="#2bd58d" />
    </div>
  );
}

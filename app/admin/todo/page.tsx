"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TodoEnUnoPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/multiservicios");
  }, [router]);
  return null;
}

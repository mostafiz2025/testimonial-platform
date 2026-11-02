"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageSpinner } from "@/components/ui/spinner";

/** Redirects to /admin (login) when there is no admin token */
export default function AdminProtected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("admin_access_token")) router.replace("/admin");
    else setReady(true);
  }, [router]);

  return ready ? <>{children}</> : <PageSpinner />;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageSpinner } from "@/components/ui/spinner";

/** Redirects to /login when there is no user token */
export default function UserProtected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) router.replace("/login");
    else setReady(true);
  }, [router]);

  return ready ? <>{children}</> : <PageSpinner />;
}

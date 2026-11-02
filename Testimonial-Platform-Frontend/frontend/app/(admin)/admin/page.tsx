import type { Metadata } from "next";
import AdminLoginForm from "@/components/authForm/AdminLoginForm";

export const metadata: Metadata = { title: "Admin login" };

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <AdminLoginForm />
    </main>
  );
}

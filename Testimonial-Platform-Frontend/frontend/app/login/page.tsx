import type { Metadata } from "next";
import UserLoginForm from "@/components/authForm/UserLoginForm";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <UserLoginForm />
    </main>
  );
}

import type { Metadata } from "next";
import UserRegistrationForm from "@/components/authForm/UserRegistrationForm";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <UserRegistrationForm />
    </main>
  );
}

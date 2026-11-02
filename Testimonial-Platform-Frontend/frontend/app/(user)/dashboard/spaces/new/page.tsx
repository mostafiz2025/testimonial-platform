import type { Metadata } from "next";
import { SpaceForm } from "@/components/dashboard/user/SpaceForm";

export const metadata: Metadata = { title: "New space" };

export default function NewSpacePage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight">Create a new space</h1>
      <p className="mb-6 text-muted-foreground">Set up your collection page. You can change everything later.</p>
      <SpaceForm mode="create" />
    </div>
  );
}

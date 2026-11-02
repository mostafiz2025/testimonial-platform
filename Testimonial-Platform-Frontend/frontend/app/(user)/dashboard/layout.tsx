import UserProtected from "@/components/authForm/UserProtected";
import { UserShell } from "@/components/dashboard/user/UserShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProtected>
      <UserShell>{children}</UserShell>
    </UserProtected>
  );
}

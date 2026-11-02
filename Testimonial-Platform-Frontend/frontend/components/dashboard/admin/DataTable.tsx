import { cn } from "@/lib/utils";

export function DataTable({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-3xl border bg-background">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-muted/50 text-xs text-muted-foreground uppercase">
          <tr>{head.map((h, i) => <th key={i} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
      {empty && <p className="py-10 text-center text-sm text-muted-foreground">Nothing to show yet.</p>}
    </div>
  );
}

export const Td = ({ className, ...p }: React.ComponentProps<"td">) => (
  <td className={cn("px-4 py-3 align-middle", className)} {...p} />
);

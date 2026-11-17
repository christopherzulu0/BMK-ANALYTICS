import { requireAuth } from "@/lib/auth";

export default async function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require authentication for this layout
  await requireAuth();
  return <>{children}</>;
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | UniSearch",
  description: "Manage your profile and view your saved schools on UniSearch.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

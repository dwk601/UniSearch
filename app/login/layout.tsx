import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | UniSearch",
  description: "Login to your UniSearch account to save schools and manage your profile.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

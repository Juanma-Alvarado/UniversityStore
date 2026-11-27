import type { ReactNode } from "react";

export const metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">{children}</main>;
}

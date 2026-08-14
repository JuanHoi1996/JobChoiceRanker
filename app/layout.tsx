import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = { title: "Job Choice Ranker", description: "Rank 2–6 jobs using your own preference rules." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}

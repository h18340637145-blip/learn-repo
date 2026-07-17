import type { Metadata } from "next";
import "./globals.css";

const title = "NodePath — 可视化编程学习平台";
const description = "通过预测、运行和可视化反馈，建立 Node.js 和 Next.js 的运行时心智模型。";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: "NodePath",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "/og.png", width: 1730, height: 909, alt: "NodePath 可视化编程学习平台" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [{ url: "/og.png", alt: "NodePath 可视化编程学习平台" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

export const metadata = {
  title: "E wall",
  description: "이월 상품 탐색 서비스"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
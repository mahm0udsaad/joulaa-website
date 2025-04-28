import type { ReactNode } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default async function RootLayout({
  children,
  params: paramsPromise,
}: {
  children: ReactNode;
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await paramsPromise;

  return (
    <>
      <Navbar lng={lng} />
      {children}
      <Footer lng={lng} />
    </>
  );
}

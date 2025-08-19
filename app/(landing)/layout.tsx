import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function landingLayout({
 children
}: {
 children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";

/** Public-site chrome. Admin (Phase 6) will live in its own route group. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { DocsNavigation } from "@/components/docs/DocsNavigation";
import { DocsContent } from "@/components/docs/DocsContent";
import { auth0 } from "@/app/lib/auth0";

export default async function DocsPage() {
  const session = await auth0.getSession();

  return (
    <div className="min-h-screen bg-background">
      <Navigation isLoggedIn={!!session} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0">
            <DocsNavigation />
          </aside>
          <main className="flex-1 max-w-4xl">
            <DocsContent />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
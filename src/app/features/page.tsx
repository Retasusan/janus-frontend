import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { FeaturesDetail } from "@/components/features/FeaturesDetail";
import { auth0 } from "@/app/lib/auth0";

export default async function FeaturesPage() {
  const session = await auth0.getSession();

  return (
    <div className="min-h-screen bg-background">
      <Navigation isLoggedIn={!!session} />
      <FeaturesDetail />
      <Footer />
    </div>
  );
}
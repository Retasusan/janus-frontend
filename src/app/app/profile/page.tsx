// app/profile/page.tsx (サーバーコンポーネント)
import { auth0 } from "@/app/lib/auth0";
import ProfileCard from "./ProfileCard";

export default async function ProfilePage() {
  const session = await auth0.getSession();
  const user = {
    name: session?.user?.name || "Unknown",
    email: session?.user?.email || "",
    picture: session?.user?.picture || "/avatar.png",
    sub: session?.user?.sub || "",
  };

  return <ProfileCard user={user} />;
}

import Link from "next/link";
import { auth0 } from "@/app/lib/auth0";

export default async function Home() {
  const session = await auth0.getSession();

  // TODO:それっぽいサイトにする
  // 参考：https://discord.com/

  // 未ログインページ
  if (!session) {
    return (
      <main>
        <Link href="/auth/login?screen_hint=signup">Sign up</Link>
        <Link href="/auth/login">Log in</Link>
      </main>
    );
  }

  //　ログイン済みページ
  return (
    <main>
      <h1>Welcome, {session.user.name}!</h1>
      <p>{session.tokenSet.accessToken}</p>
      <Link href="auth/logout">logout</Link>
    </main>
  );
}

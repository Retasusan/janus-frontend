"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      const data = await res.json();
      if (data.loggedIn) setToken(data.token);
    };
    fetchSession();
  }, []);

  if (!token) {
    return (
      <main>
        <Link href="/auth/login?screen_hint=signup">Sign up</Link>
        <Link href="/auth/login">Log in</Link>
      </main>
    );
  }

  console.log(token);
  return (
    <main>
      <h1>{token}!</h1>
      <Link href="/auth/logout">logout</Link>
    </main>
  );
}

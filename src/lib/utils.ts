import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Rails API への認証付きプロキシヘルパー
export async function withAuthProxy(req: Request, path: string, init?: RequestInit) {
  const backendBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8000";
  // 既存の Authorization をそのまま転送
  const headers = new Headers(init?.headers || {});
  const auth = (req.headers as any).get?.("authorization") || (req as any).headers?.get?.("Authorization");
  if (auth) headers.set("Authorization", auth);
  if (!headers.has("Content-Type") && init?.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const target = `${backendBase}${path}`;
  const res = await fetch(target, { method: init?.method || req.method, headers, body: init?.body, redirect: "follow" });
  // ストリームをそのまま返却
  const payload = await res.text();
  return new Response(payload, { status: res.status, headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" } });
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Parolă invalidă");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm border border-white/10 p-6 space-y-4"
      >
        <h1 className="text-2xl font-[family-name:var(--font-serif)]">
          Admin ZeroBug
        </h1>
        <div className="space-y-2">
          <Label htmlFor="password">Parolă</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "..." : "Intră"}
        </Button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>
    </main>
  );
}

import { Suspense } from "react";
import { AdminSignInCard } from "@/components/ui/sign-in-card-2";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-zinc-400">
          Se încarcă…
        </div>
      }
    >
      <AdminSignInCard />
    </Suspense>
  );
}

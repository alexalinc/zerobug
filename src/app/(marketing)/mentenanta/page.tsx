import { MaintenanceConfigurator } from "@/components/maintenance-configurator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentenanță website",
};

export default function MentenantaPage() {
  return (
    <main className="bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-4xl md:text-6xl font-[family-name:var(--font-serif)] tracking-tight">
          Mentenanță
        </h1>
        <p className="mt-4 text-zinc-400 max-w-2xl">
          Alege pachetul, complexitatea și add-ons. Poți plăti cu Stripe
          (abonament) sau solicita factură / contact. Factura PDF se generează
          lunar și se trimite pe email.
        </p>
        <div className="mt-12">
          <MaintenanceConfigurator />
        </div>
      </div>
    </main>
  );
}

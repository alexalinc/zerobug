"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import type { Id } from "@convex/_generated/dataModel";

export default function AbonamentePage() {
  const subs = useQuery(api.subscriptions.listWithDetails);
  const companies = useQuery(api.companies.list);
  const plans = useQuery(api.subscriptions.listPlans);
  const createManual = useMutation(api.subscriptions.createManual);
  const updateStatus = useMutation(api.subscriptions.updateStatus);
  const generate = useAction(api.invoicesBilling.generateManual);

  async function addManual(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await createManual({
      companyId: fd.get("companyId") as Id<"companies">,
      planId: fd.get("planId") as Id<"maintenancePlans">,
    });
    e.currentTarget.reset();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-[family-name:var(--font-serif)]">
        Abonamente
      </h1>

      <form
        onSubmit={addManual}
        className="flex flex-wrap gap-3 items-end border border-white/10 p-4"
      >
        <label className="text-sm space-y-1">
          <span className="text-zinc-400">Firmă</span>
          <select
            name="companyId"
            required
            className="block bg-zinc-900 border border-white/10 rounded-md px-3 py-2"
          >
            <option value="">Selectează</option>
            {(companies ?? []).map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm space-y-1">
          <span className="text-zinc-400">Plan</span>
          <select
            name="planId"
            required
            className="block bg-zinc-900 border border-white/10 rounded-md px-3 py-2"
          >
            <option value="">Selectează</option>
            {(plans ?? []).map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} — {p.priceNet} €
              </option>
            ))}
          </select>
        </label>
        <Button type="submit">Abonament manual</Button>
      </form>

      <div className="overflow-x-auto border border-white/10">
        <table className="w-full text-sm">
          <thead className="text-left text-zinc-400 border-b border-white/10">
            <tr>
              <th className="p-3">Firmă</th>
              <th className="p-3">Plan</th>
              <th className="p-3">Mod</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {(subs ?? []).map((s) => (
              <tr key={s._id} className="border-b border-white/5">
                <td className="p-3">{s.company?.name ?? "—"}</td>
                <td className="p-3">{s.plan?.name ?? "—"}</td>
                <td className="p-3">{s.billingMode}</td>
                <td className="p-3">{s.status}</td>
                <td className="p-3 text-right space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateStatus({
                        id: s._id,
                        status:
                          s.status === "canceled" ? "manual" : "canceled",
                      })
                    }
                  >
                    {s.status === "canceled" ? "Reactivează" : "Anulează"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => generate({ subscriptionId: s._id })}
                  >
                    Generează factură
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import {
  useAdminSessionToken,
  withAdminToken,
} from "@/components/admin-session-provider";

import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import type { Id } from "@convex/_generated/dataModel";

export default function AbonamentePage() {
  const token = useAdminSessionToken();
  const subs = useQuery(
    api.subscriptions.listWithDetails,
    withAdminToken(token),
  );
  const companies = useQuery(api.companies.list, withAdminToken(token));
  const plans = useQuery(api.subscriptions.listPlans);
  const createManual = useMutation(api.subscriptions.createManual);
  const updateStatus = useMutation(api.subscriptions.updateStatus);
  const generate = useAction(api.invoicesBilling.generateManual);

  async function addManual(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    const fd = new FormData(e.currentTarget);
    await createManual({
      sessionToken: token,
      companyId: fd.get("companyId") as Id<"companies">,
      planId: fd.get("planId") as Id<"maintenancePlans">,
    });
    e.currentTarget.reset();
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Abonamente
      </h1>

      <form
        onSubmit={addManual}
        className="flex flex-col gap-3 rounded-2xl border border-white/10 p-4 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <label className="w-full space-y-1 text-sm sm:w-auto sm:min-w-[12rem] sm:flex-1">
          <span className="text-zinc-400">Firmă</span>
          <select
            name="companyId"
            required
            className="block w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2"
          >
            <option value="">Selectează</option>
            {(companies ?? []).map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="w-full space-y-1 text-sm sm:w-auto sm:min-w-[12rem] sm:flex-1">
          <span className="text-zinc-400">Plan</span>
          <select
            name="planId"
            required
            className="block w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2"
          >
            <option value="">Selectează</option>
            {(plans ?? []).map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} — {p.priceNet} lei
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" className="w-full sm:w-auto">
          Abonament manual
        </Button>
      </form>

      <div className="-mx-4 overflow-x-auto border-y border-white/10 sm:mx-0 sm:rounded-2xl sm:border">
        <table className="w-full min-w-[560px] text-sm">
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
                <td className="p-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        token &&
                        updateStatus({
                          sessionToken: token,
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
                      onClick={() =>
                        token &&
                        generate({
                          sessionToken: token,
                          subscriptionId: s._id,
                        })
                      }
                    >
                      Generează factură
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

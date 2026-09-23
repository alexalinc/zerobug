"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import type { Id } from "@convex/_generated/dataModel";
import { MAINTENANCE_PLANS } from "@/lib/services";

const TYPE_LABEL: Record<string, string> = {
  service_quote: "Ofertă serviciu",
  contact: "Contact",
  maintenance: "Mentenanță",
};

function formatBudget(budget?: number) {
  if (budget == null) return null;
  return `${budget.toLocaleString("ro-RO")} lei`;
}

function planLabel(planKey?: string) {
  if (!planKey) return null;
  const plan = MAINTENANCE_PLANS.find((p) => p.id === planKey);
  return plan ? plan.name : planKey;
}

export default function LeaduriPage() {
  const leads = useQuery(api.leads.list);
  const updateStatus = useMutation(api.leads.updateStatus);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Cereri ofertă
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Lead-uri din formularele de pe site — mentenanță include estimare +
          detalii din wizard.
        </p>
      </div>
      <div className="overflow-x-auto border border-white/10">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-left text-zinc-400">
            <tr>
              <th className="p-3">Tip</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Servicii / estimare</th>
              <th className="p-3">Mesaj</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {(leads ?? []).map(
              (l: {
                _id: Id<"leads">;
                type: string;
                name: string;
                email: string;
                phone?: string;
                company?: string;
                serviceCategory?: string;
                serviceName?: string;
                planKey?: string;
                complexity?: string;
                addons?: string[];
                message?: string;
                budget?: number;
                quoteDetails?: string;
                status: "new" | "contacted" | "won" | "lost";
                createdAt: number;
              }) => (
                <tr key={l._id} className="border-b border-white/5 align-top">
                  <td className="p-3 whitespace-nowrap">
                    <p>{TYPE_LABEL[l.type] ?? l.type}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(l.createdAt).toLocaleString("ro-RO")}
                    </p>
                  </td>
                  <td className="p-3">
                    <p className="font-medium text-white">{l.name}</p>
                    <p className="text-zinc-400">{l.email}</p>
                    {l.phone && <p className="text-zinc-500">{l.phone}</p>}
                    {l.company && (
                      <p className="text-zinc-500">{l.company}</p>
                    )}
                  </td>
                  <td className="p-3 max-w-sm">
                    {l.serviceCategory && (
                      <p className="text-[color:var(--brand)]">
                        {l.serviceCategory}
                      </p>
                    )}
                    {l.serviceName && (
                      <p className="mt-1 text-zinc-300 leading-relaxed">
                        {l.serviceName}
                      </p>
                    )}
                    {l.planKey && (
                      <p className="mt-1 text-zinc-300">
                        Plan sugerat:{" "}
                        <span className="text-white">{planLabel(l.planKey)}</span>
                        {l.complexity ? (
                          <span className="text-zinc-500">
                            {" "}
                            · {l.complexity}
                          </span>
                        ) : null}
                      </p>
                    )}
                    {l.addons && l.addons.length > 0 && (
                      <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                        Nevoi: {l.addons.join(", ")}
                      </p>
                    )}
                    {formatBudget(l.budget) && (
                      <p className="mt-2 font-medium text-white">
                        {l.type === "maintenance"
                          ? `Estimare până la: ${formatBudget(l.budget)} + TVA`
                          : `Buget: ${formatBudget(l.budget)}`}
                      </p>
                    )}
                  </td>
                  <td className="p-3 max-w-xs whitespace-pre-wrap text-zinc-400">
                    {l.message || "—"}
                  </td>
                  <td className="p-3">{l.status}</td>
                  <td className="space-x-1 p-3 text-right">
                    {(["contacted", "won", "lost"] as const).map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus({ id: l._id, status: s })}
                      >
                        {s}
                      </Button>
                    ))}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

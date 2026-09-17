"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import type { Id } from "@convex/_generated/dataModel";

export default function LeaduriPage() {
  const leads = useQuery(api.leads.list);
  const updateStatus = useMutation(api.leads.updateStatus);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-[family-name:var(--font-serif)]">Lead-uri</h1>
      <div className="overflow-x-auto border border-white/10">
        <table className="w-full text-sm">
          <thead className="text-left text-zinc-400 border-b border-white/10">
            <tr>
              <th className="p-3">Tip</th>
              <th className="p-3">Nume</th>
              <th className="p-3">Email</th>
              <th className="p-3">Detalii</th>
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
                company?: string;
                serviceCategory?: string;
                planKey?: string;
                message?: string;
                status: "new" | "contacted" | "won" | "lost";
              }) => (
                <tr key={l._id} className="border-b border-white/5 align-top">
                  <td className="p-3">{l.type}</td>
                  <td className="p-3">{l.name}</td>
                  <td className="p-3">{l.email}</td>
                  <td className="p-3 text-zinc-400 max-w-xs">
                    {[l.company, l.serviceCategory, l.planKey, l.message]
                      .filter(Boolean)
                      .join(" · ")}
                  </td>
                  <td className="p-3">{l.status}</td>
                  <td className="p-3 text-right space-x-1">
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

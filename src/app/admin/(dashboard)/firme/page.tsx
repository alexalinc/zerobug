"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Id } from "@convex/_generated/dataModel";
import {
  computeVatAmounts,
  formatEur,
  type VatMode,
} from "@/lib/vat";
import { cn } from "@/lib/utils";

type CompanyRow = {
  _id: Id<"companies">;
  name: string;
  email: string;
  cui?: string;
  regCom?: string;
  address?: string;
  phone?: string;
  notes?: string;
  monthlyAmount?: number;
  vatMode?: VatMode;
  invoiceDescription?: string;
  status: "active" | "suspended";
};

const emptyForm = {
  name: "",
  email: "",
  cui: "",
  regCom: "",
  address: "",
  phone: "",
  notes: "",
  monthlyAmount: "",
  vatMode: "excluded" as VatMode,
  invoiceDescription: "Prestare servicii conform contract",
};

export default function FirmePage() {
  const companies = useQuery(api.companies.list) as CompanyRow[] | undefined;
  const create = useMutation(api.companies.create);
  const update = useMutation(api.companies.update);
  const remove = useMutation(api.companies.remove);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<Id<"companies"> | null>(null);

  const preview = useMemo(() => {
    const amount = Number(form.monthlyAmount);
    if (!amount || amount <= 0) return null;
    return computeVatAmounts(amount, form.vatMode);
  }, [form.monthlyAmount, form.vatMode]);

  function startEdit(c: CompanyRow) {
    setEditingId(c._id);
    setForm({
      name: c.name,
      email: c.email,
      cui: c.cui ?? "",
      regCom: c.regCom ?? "",
      address: c.address ?? "",
      phone: c.phone ?? "",
      notes: c.notes ?? "",
      monthlyAmount:
        c.monthlyAmount != null ? String(c.monthlyAmount) : "",
      vatMode: c.vatMode ?? "excluded",
      invoiceDescription:
        c.invoiceDescription ?? "Prestare servicii conform contract",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const monthlyAmount = form.monthlyAmount
      ? Number(form.monthlyAmount)
      : undefined;
    const payload = {
      name: form.name,
      email: form.email,
      cui: form.cui || undefined,
      regCom: form.regCom || undefined,
      address: form.address || undefined,
      phone: form.phone || undefined,
      notes: form.notes || undefined,
      monthlyAmount:
        monthlyAmount != null && !Number.isNaN(monthlyAmount)
          ? monthlyAmount
          : undefined,
      vatMode: form.vatMode,
      invoiceDescription: form.invoiceDescription || undefined,
    };

    if (editingId) {
      const existing = companies?.find((c) => c._id === editingId);
      await update({
        id: editingId,
        ...payload,
        status: existing?.status ?? "active",
      });
    } else {
      await create(payload);
    }
    resetForm();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Firme</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Date client, sumă lunară, TVA și textul de pe factură.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 md:grid-cols-2"
      >
        <div className="md:col-span-2 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-white">
            {editingId ? "Editează firma" : "Adaugă firmă"}
          </p>
          {editingId ? (
            <Button type="button" variant="outline" size="sm" onClick={resetForm}>
              Anulează
            </Button>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label>Denumire</Label>
          <Input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Email facturare</Label>
          <Input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>CUI</Label>
          <Input
            value={form.cui}
            onChange={(e) => setForm((f) => ({ ...f, cui: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Reg. Com.</Label>
          <Input
            value={form.regCom}
            onChange={(e) => setForm((f) => ({ ...f, regCom: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Adresă</Label>
          <Input
            value={form.address}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label>Telefon</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Sumă lunară (€)</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="ex: 49.99"
            value={form.monthlyAmount}
            onChange={(e) =>
              setForm((f) => ({ ...f, monthlyAmount: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label>Mod TVA</Label>
          <div className="flex gap-2">
            {(
              [
                { id: "excluded", label: "Fără TVA (se adaugă 21%)" },
                { id: "included", label: "TVA inclus (se extrage 21%)" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, vatMode: opt.id }))}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2 text-left text-xs transition-colors",
                  form.vatMode === opt.id
                    ? "border-[color:var(--brand)]/50 bg-[color:var(--brand)]/10 text-white"
                    : "border-white/10 text-zinc-400 hover:border-white/20",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {preview ? (
          <div className="md:col-span-2 grid gap-2 rounded-xl border border-white/10 bg-zinc-950/60 p-3 text-xs text-zinc-400 sm:grid-cols-3">
            <p>
              Net:{" "}
              <span className="font-medium text-white">
                {formatEur(preview.net)}
              </span>
            </p>
            <p>
              TVA 21%:{" "}
              <span className="font-medium text-white">
                {formatEur(preview.vat)}
              </span>
            </p>
            <p>
              Total:{" "}
              <span className="font-medium text-[color:var(--brand)]">
                {formatEur(preview.gross)}
              </span>
            </p>
          </div>
        ) : null}

        <div className="md:col-span-2 space-y-1.5">
          <Label>Text pe factură</Label>
          <Input
            placeholder="Prestare servicii conform contract"
            value={form.invoiceDescription}
            onChange={(e) =>
              setForm((f) => ({ ...f, invoiceDescription: e.target.value }))
            }
          />
          <p className="text-[11px] text-zinc-500">
            Apare pe fiecare factură generată pentru această firmă (se adaugă
            automat perioada).
          </p>
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <Label>Note interne</Label>
          <Input
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>

        <Button type="submit" className="md:col-span-2 w-fit">
          {editingId ? "Salvează modificările" : "Adaugă firmă"}
        </Button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-left text-zinc-500">
            <tr>
              <th className="p-3 font-medium">Firmă</th>
              <th className="p-3 font-medium">Sumă / TVA</th>
              <th className="p-3 font-medium">Text factură</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {(companies ?? []).map((c) => {
              const amounts =
                c.monthlyAmount && c.monthlyAmount > 0
                  ? computeVatAmounts(c.monthlyAmount, c.vatMode ?? "excluded")
                  : null;
              return (
                <tr key={c._id} className="border-b border-white/5">
                  <td className="p-3">
                    <p className="font-medium text-white">{c.name}</p>
                    <p className="text-xs text-zinc-500">{c.email}</p>
                    {c.cui ? (
                      <p className="text-xs text-zinc-600">CUI {c.cui}</p>
                    ) : null}
                  </td>
                  <td className="p-3 text-zinc-300">
                    {amounts ? (
                      <div className="space-y-0.5 text-xs">
                        <p>
                          {formatEur(c.monthlyAmount!)}{" "}
                          <span className="text-zinc-500">
                            ({c.vatMode === "included" ? "TVA inclus" : "fără TVA"})
                          </span>
                        </p>
                        <p className="text-zinc-500">
                          → {formatEur(amounts.gross)} total
                        </p>
                      </div>
                    ) : (
                      <span className="text-zinc-600">Plan default</span>
                    )}
                  </td>
                  <td className="max-w-[220px] p-3 text-xs text-zinc-400">
                    {c.invoiceDescription || "—"}
                  </td>
                  <td className="p-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        c.status === "active"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-zinc-500/15 text-zinc-400",
                      )}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="space-x-2 p-3 text-right whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(c)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        update({
                          id: c._id,
                          name: c.name,
                          email: c.email,
                          cui: c.cui,
                          regCom: c.regCom,
                          address: c.address,
                          phone: c.phone,
                          notes: c.notes,
                          monthlyAmount: c.monthlyAmount,
                          vatMode: c.vatMode,
                          invoiceDescription: c.invoiceDescription,
                          status:
                            c.status === "active" ? "suspended" : "active",
                        })
                      }
                    >
                      {c.status === "active" ? "Suspendă" : "Activează"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => remove({ id: c._id })}
                    >
                      Șterge
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

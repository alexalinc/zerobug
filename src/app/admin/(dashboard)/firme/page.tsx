"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Id } from "@convex/_generated/dataModel";

export default function FirmePage() {
  const companies = useQuery(api.companies.list);
  const create = useMutation(api.companies.create);
  const update = useMutation(api.companies.update);
  const remove = useMutation(api.companies.remove);
  const [editing, setEditing] = useState<Id<"companies"> | null>(null);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await create({
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      cui: String(fd.get("cui") || "") || undefined,
      regCom: String(fd.get("regCom") || "") || undefined,
      address: String(fd.get("address") || "") || undefined,
      phone: String(fd.get("phone") || "") || undefined,
      notes: String(fd.get("notes") || "") || undefined,
    });
    e.currentTarget.reset();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-[family-name:var(--font-serif)]">Firme</h1>

      <form
        onSubmit={onCreate}
        className="grid gap-3 md:grid-cols-2 border border-white/10 p-4"
      >
        <div className="space-y-1">
          <Label>Denumire</Label>
          <Input name="name" required />
        </div>
        <div className="space-y-1">
          <Label>Email facturare</Label>
          <Input name="email" type="email" required />
        </div>
        <div className="space-y-1">
          <Label>CUI</Label>
          <Input name="cui" />
        </div>
        <div className="space-y-1">
          <Label>Reg. Com.</Label>
          <Input name="regCom" />
        </div>
        <div className="space-y-1">
          <Label>Adresă</Label>
          <Input name="address" />
        </div>
        <div className="space-y-1">
          <Label>Telefon</Label>
          <Input name="phone" />
        </div>
        <div className="md:col-span-2 space-y-1">
          <Label>Note</Label>
          <Input name="notes" />
        </div>
        <Button type="submit" className="md:col-span-2 w-fit">
          Adaugă firmă
        </Button>
      </form>

      <div className="overflow-x-auto border border-white/10">
        <table className="w-full text-sm">
          <thead className="text-left text-zinc-400 border-b border-white/10">
            <tr>
              <th className="p-3">Firmă</th>
              <th className="p-3">Email</th>
              <th className="p-3">CUI</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {(companies ?? []).map((c) => (
              <tr key={c._id} className="border-b border-white/5">
                <td className="p-3">
                  {editing === c._id ? (
                    <Input
                      defaultValue={c.name}
                      id={`name-${c._id}`}
                      className="h-8"
                    />
                  ) : (
                    c.name
                  )}
                </td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.cui || "—"}</td>
                <td className="p-3">{c.status}</td>
                <td className="p-3 space-x-2 text-right">
                  {editing === c._id ? (
                    <Button
                      size="sm"
                      onClick={async () => {
                        const name =
                          (
                            document.getElementById(
                              `name-${c._id}`,
                            ) as HTMLInputElement
                          )?.value || c.name;
                        await update({
                          id: c._id,
                          name,
                          email: c.email,
                          cui: c.cui,
                          regCom: c.regCom,
                          address: c.address,
                          phone: c.phone,
                          notes: c.notes,
                          status: c.status,
                        });
                        setEditing(null);
                      }}
                    >
                      Salvează
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(c._id)}
                    >
                      Edit
                    </Button>
                  )}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

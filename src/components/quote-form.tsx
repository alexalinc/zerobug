"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  type: "contact" | "service_quote" | "maintenance";
  serviceCategory?: string;
  serviceName?: string;
  planKey?: string;
  title?: string;
  extraFields?: React.ReactNode;
  onBeforeSubmit?: () => Record<string, unknown>;
};

export function QuoteForm({
  type,
  serviceCategory,
  serviceName,
  planKey,
  title = "Solicită ofertă",
}: Props) {
  const createLead = useMutation(api.leads.create);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    const fd = new FormData(e.currentTarget);
    try {
      await createLead({
        type,
        name: String(fd.get("name") || ""),
        email: String(fd.get("email") || ""),
        phone: String(fd.get("phone") || "") || undefined,
        company: String(fd.get("company") || "") || undefined,
        message: String(fd.get("message") || "") || undefined,
        serviceCategory,
        serviceName: serviceName || String(fd.get("serviceName") || "") || undefined,
        planKey,
        complexity: String(fd.get("complexity") || "") || undefined,
      });
      setStatus("ok");
      e.currentTarget.reset();
    } catch {
      setStatus("err");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border border-white/10 bg-zinc-900/60 p-6 space-y-4"
    >
      <h2 className="text-xl font-medium text-white">{title}</h2>
      <div className="space-y-2">
        <Label htmlFor="name">Nume</Label>
        <Input id="name" name="name" required placeholder="Numele tău" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="email@firma.ro"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telefon</Label>
        <Input id="phone" name="phone" placeholder="07xx xxx xxx" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company">Firmă</Label>
        <Input id="company" name="company" placeholder="Denumire firmă" />
      </div>
      {type === "service_quote" && (
        <div className="space-y-2">
          <Label htmlFor="serviceName">Serviciu de interes</Label>
          <Input
            id="serviceName"
            name="serviceName"
            defaultValue={serviceName}
            placeholder="Ex: Checkout custom"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="message">Mesaj</Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Descrie pe scurt proiectul..."
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Se trimite..." : "Trimite"}
      </Button>
      {status === "ok" && (
        <p className="text-sm text-emerald-400">
          Mulțumim! Te contactăm în curând.
        </p>
      )}
      {status === "err" && (
        <p className="text-sm text-red-400">
          Eroare la trimitere. Încearcă din nou.
        </p>
      )}
    </form>
  );
}

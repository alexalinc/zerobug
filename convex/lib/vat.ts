export const VAT_RATE = 0.21;

export type VatMode = "excluded" | "included";

export function computeVatAmounts(
  amount: number,
  mode: VatMode,
  vatRate = VAT_RATE,
): { net: number; vat: number; gross: number } {
  if (!Number.isFinite(amount) || amount < 0) {
    return { net: 0, vat: 0, gross: 0 };
  }
  if (mode === "included") {
    const gross = Math.round(amount * 100) / 100;
    const net = Math.round((gross / (1 + vatRate)) * 100) / 100;
    const vat = Math.round((gross - net) * 100) / 100;
    return { net, vat, gross };
  }
  const net = Math.round(amount * 100) / 100;
  const vat = Math.round(net * vatRate * 100) / 100;
  const gross = Math.round((net + vat) * 100) / 100;
  return { net, vat, gross };
}

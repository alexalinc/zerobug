/** Fetch a short-lived lead form token from the Next.js challenge endpoint. */
export async function fetchLeadFormToken(): Promise<string> {
  const res = await fetch("/api/leads/challenge", {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });
  if (res.status === 429) {
    throw new Error("Prea multe cereri. Încearcă din nou mai târziu.");
  }
  if (!res.ok) {
    throw new Error("Nu pot valida formularul. Reîncarcă pagina.");
  }
  const data = (await res.json()) as { token?: string };
  if (!data.token) {
    throw new Error("Nu pot valida formularul. Reîncarcă pagina.");
  }
  return data.token;
}

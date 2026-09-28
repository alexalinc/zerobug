import { AdminEmailsClient } from "@/components/admin/emails-client";

export const metadata = {
  title: "Emails · Trimise",
};

export default function AdminEmailsSentPage() {
  return <AdminEmailsClient view="sent" />;
}

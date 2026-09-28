import { AdminEmailsClient } from "@/components/admin/emails-client";

export const metadata = {
  title: "Emails · Inbox",
};

export default function AdminEmailsInboxPage() {
  return <AdminEmailsClient view="inbox" />;
}

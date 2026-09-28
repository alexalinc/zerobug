import { AdminEmailsClient } from "@/components/admin/emails-client";

export const metadata = {
  title: "Emails · Coș",
};

export default function AdminEmailsTrashPage() {
  return <AdminEmailsClient view="trash" />;
}

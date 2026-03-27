import { Resend } from "resend";

import { getStore } from "@/lib/data/demo-store";
import { env } from "@/lib/env";
import type { NotificationLog } from "@/lib/types";
import { makeId, nowIso } from "@/lib/utils";

let resend: Resend | undefined;

function getResendClient() {
  if (!env.resendApiKey) {
    return undefined;
  }

  resend ??= new Resend(env.resendApiKey);
  return resend;
}

export async function sendNotification(input: Omit<NotificationLog, "id" | "sentAt" | "channel">) {
  const store = getStore();
  const notification: NotificationLog = {
    id: makeId("notif"),
    channel: "email",
    sentAt: nowIso(),
    ...input
  };

  store.notifications.unshift(notification);

  const resendClient = getResendClient();
  if (resendClient && !env.demoMode) {
    try {
      await resendClient.emails.send({
        from: env.resendFromEmail,
        to: notification.recipient,
        subject: notification.subject,
        html: `<p>${notification.subject}</p><p>${notification.type.replace(/_/g, " ")}</p>`
      });
    } catch {
      // Notification logging remains authoritative even if provider delivery fails in MVP.
    }
  }

  return notification;
}

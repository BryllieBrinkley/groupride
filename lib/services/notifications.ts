import { Resend } from "resend";

import { createId, getStore } from "@/lib/data/demo-store";
import { env } from "@/lib/env";
import type { NotificationChannel, NotificationRecord } from "@/lib/types";
import { nowIso } from "@/lib/utils";

let resend: Resend | undefined;

function getResendClient() {
  if (!env.resendApiKey) {
    return undefined;
  }

  resend ??= new Resend(env.resendApiKey);
  return resend;
}

export async function createNotification(
  input: Omit<NotificationRecord, "id" | "status" | "createdAt" | "sentAt" | "readAt"> & {
    status?: NotificationRecord["status"];
  },
) {
  const store = getStore();
  const notification: NotificationRecord = {
    id: createId("notification"),
    status: input.status ?? "queued",
    createdAt: nowIso(),
    ...input,
  };

  store.notifications.unshift(notification);
  return notification;
}

export async function sendNotification(
  input: Omit<NotificationRecord, "id" | "status" | "createdAt" | "sentAt" | "readAt"> & {
    channel?: NotificationChannel;
  },
) {
  const notification = await createNotification({
    ...input,
    channel: input.channel ?? "email",
  });

  if (notification.channel === "email") {
    const resendClient = getResendClient();
    if (resendClient && !env.demoMode) {
      try {
        await resendClient.emails.send({
          from: env.resendFromEmail,
          to: notification.recipient,
          subject: notification.title,
          html: `<p>${notification.message}</p>`,
        });
      } catch {
        notification.status = "failed";
        return notification;
      }
    }
  }

  notification.status = notification.channel === "in_app" ? "sent" : "sent";
  notification.sentAt = nowIso();
  return notification;
}

export function listNotificationsForProfile(profileId: string) {
  return getStore().notifications.filter((notification) => notification.profileId === profileId);
}

export function markNotificationRead(notificationId: string) {
  const notification = getStore().notifications.find((entry) => entry.id === notificationId);
  if (!notification) {
    return null;
  }

  notification.status = "read";
  notification.readAt = nowIso();
  return notification;
}

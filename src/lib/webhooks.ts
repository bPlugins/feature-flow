import prisma from "@/lib/prisma";

/**
 * Fire all enabled webhooks for a given project and event type.
 * Runs asynchronously (fire-and-forget) so it doesn't block the request.
 */
export async function fireWebhooks(
  projectId: string,
  eventType: string,
  payload: Record<string, unknown>
) {
  try {
    const webhooks = await prisma.webhook.findMany({
      where: {
        projectId,
        eventType,
        enabled: true,
      },
    });

    for (const webhook of webhooks) {
      // Parse custom headers
      let customHeaders: Record<string, string> = {};
      if (webhook.headers) {
        try {
          customHeaders = JSON.parse(webhook.headers);
        } catch {
          // ignore bad JSON
        }
      }

      // Build the body - use custom content template or default payload
      let body: string;
      if (webhook.content) {
        // Replace {{variable}} placeholders with actual values
        body = webhook.content.replace(
          /\{\{(\w+(?:\.\w+)*)\}\}/g,
          (_match: string, key: string) => {
            const keys = key.split(".");
            let value: unknown = payload;
            for (const k of keys) {
              if (value && typeof value === "object" && k in value) {
                value = (value as Record<string, unknown>)[k];
              } else {
                value = undefined;
                break;
              }
            }
            return value !== undefined ? String(value) : "";
          }
        );
      } else {
        body = JSON.stringify({
          event: eventType,
          data: payload,
          timestamp: new Date().toISOString(),
        });
      }

      const fetchOptions: RequestInit = {
        method: webhook.method,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "FeatureFlow-Webhook/1.0",
          ...customHeaders,
        },
      };

      // Only attach body for methods that support it
      if (webhook.method !== "GET") {
        fetchOptions.body = body;
      }

      fetch(webhook.url, fetchOptions).catch((err) =>
        console.error(`Webhook ${webhook.id} (${webhook.name}) failed:`, err)
      );
    }
  } catch (err) {
    console.error("Error firing webhooks:", err);
  }
}

import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const ses = new SESv2Client({ region: process.env["AWS_REGION"] || "eu-north-1" });

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

export async function sendMemberEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ sent: boolean; reason?: "not_configured" | "send_failed" }> {
  const from = process.env["SES_FROM_EMAIL"];
  if (!from) return { sent: false, reason: "not_configured" };

  try {
    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: from,
        Destination: { ToAddresses: [input.to] },
        Content: {
          Simple: {
            Subject: { Data: input.subject, Charset: "UTF-8" },
            Body: {
              Text: { Data: input.text, Charset: "UTF-8" },
              Html: { Data: input.html, Charset: "UTF-8" },
            },
          },
        },
      }),
    );
    return { sent: true };
  } catch (error) {
    console.error("SES member email failed", error);
    return { sent: false, reason: "send_failed" };
  }
}

export function memberEmailHtml(name: string, message: string): string {
  return `<div style="font-family:Arial,sans-serif;color:#24170f;line-height:1.6;max-width:600px;margin:auto"><h1 style="color:#7b4d24">RSVP DXB</h1><p>Hello ${escapeHtml(name)},</p><p>${escapeHtml(message)}</p><p>Regards,<br>RSVP DXB</p></div>`;
}

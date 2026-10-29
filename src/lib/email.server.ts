import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const ses = new SESv2Client({ region: process.env["SES_REGION"] || process.env["AWS_REGION"] || "eu-north-1" });
const brand = "#80512f";

function escapeHtml(value: string): string {
  return value.replace(/[&<>\"']/g, (character) => {
    const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" };
    return entities[character] ?? character;
  });
}

export async function sendMemberEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
  from?: string;
}): Promise<{ sent: boolean; reason?: "not_configured" | "send_failed" }> {
  const from = input.from || process.env["SES_FROM_EMAIL"];
  if (!from) return { sent: false, reason: "not_configured" };

  try {
    await ses.send(new SendEmailCommand({
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
    }));
    return { sent: true };
  } catch (error) {
    const detail = error instanceof Error ? `${error.name}: ${error.message}` : "Unknown SES error";
    console.error("SES member email failed", detail);
    return { sent: false, reason: "send_failed" };
  }
}

type EmailField = { label: string; value: string };

function emailShell(options: { eyebrow: string; title: string; greeting: string; message: string; fields?: EmailField[]; actionLabel?: string; actionUrl?: string; footer?: string }): string {
  const details = options.fields?.length ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:22px 0 8px;background:#fbf9f6;border:1px solid #eee7de;border-radius:10px;overflow:hidden">
      ${options.fields.map((field) => `<tr><td style="padding:12px 14px;border-bottom:1px solid #eee7de;color:#766b60;font-size:13px;width:36%;vertical-align:top">${escapeHtml(field.label)}</td><td style="padding:12px 14px;border-bottom:1px solid #eee7de;color:#2d241d;font-size:14px;font-weight:600;vertical-align:top;overflow-wrap:anywhere">${escapeHtml(field.value || "Not provided")}</td></tr>`).join("")}
    </table>` : "";
  const action = options.actionLabel && options.actionUrl ? `<p style="margin:26px 0 8px"><a href="${escapeHtml(options.actionUrl)}" style="display:inline-block;background:${brand};color:#fff;text-decoration:none;padding:13px 21px;border-radius:6px;font-weight:700;font-size:14px">${escapeHtml(options.actionLabel)} &nbsp;→</a></p>` : "";
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head><body style="margin:0;padding:0;background:#f4f1ed;font-family:Arial,Helvetica,sans-serif;color:#2d241d;-webkit-text-size-adjust:100%"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(options.message)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ed;padding:30px 12px"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff;border:1px solid #e9e2da;border-radius:12px;overflow:hidden"><tr><td style="padding:25px 32px;background:#211b17"><div style="font-family:Georgia,'Times New Roman',serif;color:#d6b47a;font-size:26px;letter-spacing:2px;font-weight:700">RSVP DXB</div><div style="margin-top:5px;color:#c5b9a9;font-size:10px;letter-spacing:2px;text-transform:uppercase">Private events · Dubai</div></td></tr><tr><td style="height:4px;background:${brand};font-size:0;line-height:0">&nbsp;</td></tr><tr><td style="padding:34px 32px 28px"><div style="font-size:11px;line-height:1.4;letter-spacing:1.6px;text-transform:uppercase;color:${brand};font-weight:700">${escapeHtml(options.eyebrow)}</div><h1 style="margin:10px 0 22px;font-family:Georgia,'Times New Roman',serif;font-size:29px;line-height:1.2;font-weight:500;color:#261d17">${escapeHtml(options.title)}</h1><p style="margin:0 0 13px;font-size:16px;line-height:1.65">${escapeHtml(options.greeting)}</p><p style="margin:0;font-size:15px;line-height:1.75;color:#544a42">${escapeHtml(options.message)}</p>${details}${action}<p style="margin:27px 0 0;font-size:14px;line-height:1.7;color:#544a42">Warm regards,<br><strong style="color:#2d241d">The RSVP DXB team</strong></p></td></tr><tr><td style="padding:18px 32px;background:#faf8f5;border-top:1px solid #eee7de;color:#82776d;font-size:11px;line-height:1.6">${escapeHtml(options.footer || "This is an automated message from RSVP DXB. Please keep this email for your records.")}<br><span style="color:#a0978e">© RSVP DXB · Dubai, UAE</span></td></tr></table></td></tr></table></body></html>`;
}

export function applicationConfirmationEmail(name: string, track: string, email: string): string {
  return emailShell({
    eyebrow: "Membership application received",
    title: "Thank you for applying.",
    greeting: `Hello ${name},`,
    message: "Your RSVP DXB membership application has been received and is now pending review. Our membership team will review your profile and contact you at this email address with an update, typically within 48 hours.",
    fields: [
      { label: "Membership track", value: track },
      { label: "Application status", value: "Pending review" },
      { label: "Contact email", value: email },
    ],
    footer: "You received this confirmation because an RSVP DXB membership application was submitted using this email address. If you did not submit it, you can disregard this message.",
  });
}

export function newsletterConfirmationEmail(): string {
  return emailShell({
    eyebrow: "Newsletter subscription",
    title: "You’re on the list.",
    greeting: "Hello,",
    message: "Thanks for subscribing to RSVP DXB. We’ll send you occasional updates about upcoming events, new openings, and last-minute offers. You can ignore this email if you did not sign up.",
    footer: "You received this email because this address was used to subscribe to RSVP DXB updates.",
  });
}

export function newsletterAdminEmail(email: string): string {
  return emailShell({
    eyebrow: "New newsletter subscriber",
    title: "A new email joined the list.",
    greeting: "A visitor subscribed from the RSVP DXB website.",
    message: "Add this address to the RSVP DXB newsletter audience, subject to your mailing-list consent and unsubscribe process.",
    fields: [{ label: "Subscriber email", value: email }],
    footer: "Internal RSVP DXB notification · Newsletter subscription",
  });
}

export function applicationAdminEmail(input: { name: string; email: string; track: string; city: string; handle: string; followers: string; mobile: string; outlet: string; role: string; profiles: string; detail: string; id: string; dashboardUrl?: string }): string {
  return emailShell({
    eyebrow: "New membership application",
    title: input.name,
    greeting: "A new profile is ready for your review.",
    message: "The application has been added to the review queue. Here’s a quick look at the submitted details:",
    fields: [
      { label: "Applicant email", value: input.email },
      { label: "Membership track", value: input.track },
      { label: "City", value: input.city },
      { label: "Instagram", value: input.handle },
      { label: "Followers", value: Number(input.followers).toLocaleString("en-US") },
      { label: "Mobile / WhatsApp", value: input.mobile },
      { label: "Outlet / company", value: input.outlet },
      { label: "Role", value: input.role },
      { label: "Other profiles", value: input.profiles },
      { label: "About", value: input.detail },
      { label: "Application ID", value: input.id },
      { label: "Status", value: "Pending review" },
    ],
    ...(input.dashboardUrl ? { actionLabel: "Open admin dashboard", actionUrl: input.dashboardUrl } : {}),
    footer: "Internal RSVP DXB notification · Please review this application in the admin dashboard.",
  });
}

export function memberEmailHtml(name: string, message: string): string {
  return emailShell({ eyebrow: "A note from RSVP DXB", title: "A little update for you.", greeting: `Hello ${name},`, message });
}

export function memberPasswordResetEmail(name: string, resetUrl: string): string {
  return emailShell({
    eyebrow: "Member account security",
    title: "Reset your password",
    greeting: `Hello ${name},`,
    message: "We received a request to reset the password for your RSVP DXB member account. This secure link expires in 30 minutes and can be used once. If you did not request this, you can ignore this email.",
    actionLabel: "Choose a new password",
    actionUrl: resetUrl,
    footer: "For your security, never share this link. RSVP DXB will never ask you to send us your password.",
  });
}

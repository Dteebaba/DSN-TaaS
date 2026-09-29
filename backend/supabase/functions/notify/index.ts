// Supabase Edge Function: send transactional emails for platform events.
// Status: scaffold. Wire it to a Database Webhook (review_requests, applications, recruiters,
// talent_requests) once Supabase and an email provider (e.g. Resend) are set up.
//
// Env (set with `supabase secrets set`):
//   RESEND_API_KEY   API key for the email provider
//   MAIL_FROM        e.g. "DSN Talent Platform <talent@datasciencenigeria.org>"

type Payload = { type: "INSERT" | "UPDATE"; table: string; record: Record<string, unknown>; old_record?: Record<string, unknown> };

const TEMPLATES: Record<string, (r: Record<string, unknown>) => { subject: string; text: string } | null> = {
  applications: (r) => r.status === "approved"
    ? { subject: "Your DSN Talent Platform profile is ready", text: `Log in with your DSN ID ${r.dsn_id} and create your password.` }
    : null,
  review_requests: (r) => r.status === "interview"
    ? { subject: "A reviewer has requested an interview", text: `Interview: ${r.interview_at}. Link: ${r.interview_link ?? "to follow"}.` }
    : r.status === "completed" || r.status === "rejected"
      ? { subject: "Your review result is ready", text: "Log in to the DSN Talent Platform to see your result." }
      : null,
  recruiters: (r) => r.status === "approved"
    ? { subject: "Your recruiter access is approved", text: `Log in with your recruiter ID ${r.id}.` }
    : null,
};

Deno.serve(async (req) => {
  const payload = (await req.json()) as Payload;
  const make = TEMPLATES[payload.table];
  const msg = make?.(payload.record);
  if (!msg) return new Response("ignored", { status: 200 });

  const to = await lookupEmail(payload.table, payload.record);
  if (!to) return new Response("no recipient", { status: 200 });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: Deno.env.get("MAIL_FROM"), to, subject: msg.subject, text: msg.text }),
  });
  return new Response(res.ok ? "sent" : await res.text(), { status: res.ok ? 200 : 502 });
});

// TODO: look up the recipient with the service-role client (member_contacts / recruiters.email).
async function lookupEmail(_table: string, _record: Record<string, unknown>): Promise<string | null> {
  return null;
}

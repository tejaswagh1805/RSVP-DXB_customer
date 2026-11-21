import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Card, Button } from "@/components/ui-kit";
import { getCreatorTask, submitCreatorTask } from "@/lib/database";

export const Route = createFileRoute("/creator-task/$token")({
  loader: ({ params }) => getCreatorTask({ data: { token: params.token } }),
  head: () => ({ meta: [{ title: "Complete your creator task — RSVP DXB" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: CreatorTaskPage,
});

function CreatorTaskPage() {
  const task = Route.useLoaderData();
  const { token } = Route.useParams();
  const submit = useServerFn(submitCreatorTask);
  const [submission, setSubmission] = useState(task?.submission ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return <main className="min-h-[85svh] bg-background px-4 py-8 sm:grid sm:place-items-center sm:py-12"><Card className="mx-auto w-full max-w-lg p-5 sm:p-8">
    <p className="eyebrow">RSVP DXB · Creator task</p>
    {!task ? <><h1 className="mt-3 text-3xl">Task link unavailable</h1><p className="mt-3 text-sm text-muted-foreground">This link may be invalid or belong to another account. Please sign in using the member account that submitted the RSVP request.</p></> : "requiresSignIn" in task ? <><h1 className="mt-3 text-3xl">Sign in to continue</h1><p className="mt-3 text-sm text-muted-foreground">Sign in to the RSVP DXB member account used for this request. Your task details will appear after sign-in.</p><Link className="mt-6 block rounded-md bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground" to="/signin" search={{ redirect: `/creator-task/${token}` }}>Sign in to RSVP DXB</Link></> : <>
      <h1 className="mt-3 text-3xl leading-tight">Complete your task</h1>
      <p className="mt-3 text-sm text-muted-foreground">{task.eventTitle}{task.date ? ` · ${new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(`${task.date}T12:00:00`))}` : ""}{task.venue ? ` · ${task.venue}` : ""}</p>
      <section className="mt-6 rounded-lg bg-surface-2 p-4"><h2 className="text-sm font-semibold">Your agreed deliverables</h2><p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{task.deliverables}</p></section>
      <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); setBusy(true); setError(""); void submit({ data: { token, submission } }).then(() => setSaved(true)).catch((cause) => setError(cause instanceof Error ? cause.message : "Could not submit your task.")).finally(() => setBusy(false)); }}>
        <label className="block text-sm font-medium">Submission links or notes<textarea className="mt-2 min-h-36 w-full rounded-md border border-border bg-surface px-3 py-3 text-sm" required maxLength={5000} value={submission} onChange={(event) => setSubmission(event.target.value)} placeholder="Paste your Instagram Story links or add a note. If a Story has expired, describe it here and share a screenshot link." /></label>
        <p className="text-xs text-muted-foreground">Add one link per line. For expired Stories, include an accessible screenshot link. Your submission will be reviewed by the RSVP DXB team.</p>
        {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
        {saved ? <p className="text-sm text-primary" role="status">Your submission has been received. You can update it using this link until the team reviews your request.</p> : null}
        <Button className="min-h-12 w-full" size="lg" type="submit" disabled={busy || submission.trim().length < 3}>{busy ? "Submitting…" : task.taskStatus === "submitted" || saved ? "Update submission" : "Submit task"}</Button>
      </form>
    </>}
    <p className="mt-7 text-center text-xs tracking-widest text-muted-foreground">RSVPDXB.COM</p>
  </Card></main>;
}

import { useState } from "react";
import { MailPlusIcon } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";

export function InvitePeopleDialog() {
  const [open, setOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [isSending, setIsSending] = useState(false);
  const sendInvitation = useChatStore((state) => state.sendInvitation);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSending(true);
    try {
      if (await sendInvitation(emailAddress)) {
        setEmailAddress("");
        setOpen(false);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-3 mb-2 mt-3 flex w-[calc(100%-1.5rem)] items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
      >
        <MailPlusIcon className="size-4" aria-hidden />
        Invite someone
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSending) setOpen(false);
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl border border-border bg-background p-5 text-foreground shadow-2xl"
          >
            <h2 className="text-lg font-semibold">Invite someone to MultiChat</h2>
            <p className="mt-1 text-sm text-muted">
              We’ll email them a link to join your chat.
            </p>
            <label className="mt-5 block text-sm font-medium" htmlFor="invite-email">
              Email address
            </label>
            <input
              id="invite-email"
              type="email"
              autoComplete="email"
              autoFocus
              required
              maxLength={254}
              value={emailAddress}
              onChange={(event) => setEmailAddress(event.target.value)}
              placeholder="name@example.com"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isSending}
                className="rounded-lg px-4 py-2 text-sm hover:bg-accent-soft disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending || !emailAddress.trim()}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50"
              >
                {isSending ? "Sending…" : "Send invite"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

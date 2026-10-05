import { useState } from "react";
import { useChatStore } from "../../store/useChatStore";

export function CreateGroupDialog({ users }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [members, setMembers] = useState([]);
  const createGroup = useChatStore((state) => state.createGroup);

  const toggleMember = (id) => {
    setMembers((current) => current.includes(id) ? current.filter((memberId) => memberId !== id) : [...current, id]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (await createGroup({ name, members })) {
      setName("");
      setMembers([]);
      setOpen(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="mx-3 mb-2 mt-3 flex w-[calc(100%-1.5rem)] items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-accent-soft">
        <span aria-hidden>＋</span> Create group
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-border bg-background p-5 text-foreground shadow-2xl">
            <h2 className="text-lg font-semibold">Create a group chat</h2>
            <p className="mt-1 text-sm text-muted">Choose a name and at least two people to add.</p>
            <label className="mt-4 block text-sm font-medium" htmlFor="group-name">Group name</label>
            <input id="group-name" autoFocus required maxLength={60} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Weekend plans" className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" />
            <div className="mt-4 max-h-64 overflow-y-auto rounded-lg border border-border">
              {users.map((user) => (
                <label key={user._id} className="flex cursor-pointer items-center gap-3 border-b border-border px-3 py-2.5 last:border-0 hover:bg-accent-soft">
                  <input type="checkbox" checked={members.includes(user._id)} onChange={() => toggleMember(user._id)} className="size-4 accent-blue-600" />
                  <img src={user.profilePic} alt="" className="size-8 rounded-full bg-surface object-cover" />
                  <span className="text-sm font-medium">{user.fullName}</span>
                </label>
              ))}
              {users.length === 0 ? <p className="p-4 text-center text-sm text-muted">No people available to add.</p> : null}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-sm hover:bg-accent-soft">Cancel</button>
              <button type="submit" disabled={!name.trim() || members.length < 2} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50">Create group</button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  createUserAction,
  deleteUserAction,
  updateUserRoleAction,
  updateUserNameAction,
  type CreateUserState,
} from "@/app/actions/user";
import type { UserRow } from "@/lib/db/users";
import DropdownSelect, { type DropdownOption } from "./DropdownSelect";
import { useToast } from "@/components/shared/Toaster";
import Spinner from "@/components/shared/Spinner";

const ROLE_OPTIONS: DropdownOption[] = [
  { value: "editor", label: "Editor", dotClass: "bg-subtle" },
  { value: "admin", label: "Admin", dotClass: "bg-gold" },
];

// ---------------------------------------------------------------------------
// Role select cell
// ---------------------------------------------------------------------------

function RoleSelect({
  userId,
  currentRole,
  isSelf,
}: {
  userId: string;
  currentRole: string;
  isSelf: boolean;
}) {
  const [role, setRole] = useState(currentRole);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: string) {
    const prev = role;
    setRole(next);
    startTransition(async () => {
      try {
        await updateUserRoleAction(userId, next as "admin" | "editor");
      } catch {
        setRole(prev);
      }
    });
  }

  return (
    <DropdownSelect
      value={role}
      options={ROLE_OPTIONS}
      onChange={handleChange}
      isPending={isPending}
      disabled={isSelf}
      ariaLabel="User role"
    />
  );
}

// ---------------------------------------------------------------------------
// Delete button
// ---------------------------------------------------------------------------

function DeleteButton({ userId, isSelf }: { userId: string; isSelf: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const toast = useToast();

  if (isSelf) {
    return (
      <span className="text-xs text-subtle" title="Cannot delete yourself">
        —
      </span>
    );
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if (result.error) toast.error(result.error);
    });
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="cursor-pointer rounded-full px-3 py-1 text-xs font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition whitespace-nowrap inline-flex items-center gap-1.5"
        >
          {isPending && <Spinner className="h-3 w-3" />}
          {isPending ? "Deleting…" : "Confirm"}
        </button>
        <button
          type="button"
          onClick={() => setConfirm(false)}
          disabled={isPending}
          className="cursor-pointer rounded-full p-1.5 border border-border bg-surface text-muted hover:text-text disabled:opacity-50 transition"
          aria-label="Cancel"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirm(true)}
      disabled={isPending}
      className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
    >
      Delete
    </button>
  );
}

// ---------------------------------------------------------------------------
// Add user form
// ---------------------------------------------------------------------------

function AddUserForm() {
  const [state, action, isPending] = useActionState<CreateUserState, FormData>(
    createUserAction,
    null,
  );
  const [role, setRole] = useState("editor");
  const toast = useToast();
  const prevState = useRef<CreateUserState>(null);
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state?.success) toast.success("User added successfully.");
    else if (state?.formError) toast.error(state.formError);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form
      action={action}
      className="rounded-[18px] border border-border bg-surface p-5"
    >
      <h2 className="mb-4 text-sm font-semibold">Add user</h2>

      <div className="flex flex-wrap items-end gap-3">
        {/* Email */}
        <div className="flex-1 min-w-48">
          <label
            htmlFor="new-user-email"
            className="mb-1 block text-xs font-medium text-muted"
          >
            Email
          </label>
          <input
            id="new-user-email"
            name="email"
            type="email"
            autoComplete="off"
            placeholder="user@example.com"
            className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none placeholder:text-subtle transition focus-visible:ring-2 focus-visible:ring-gold/30"
          />
        </div>

        {/* Role */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Role
          </label>
          <input type="hidden" name="role" value={role} />
          <DropdownSelect
            value={role}
            options={ROLE_OPTIONS}
            onChange={setRole}
            ariaLabel="New user role"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="cursor-pointer rounded-xl bg-brand-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          {isPending && <Spinner className="h-3.5 w-3.5" />}
          {isPending ? "Adding…" : "Add user"}
        </button>
      </div>
      {state?.fieldErrors?.email && (
        <p className="mt-2 text-xs text-red-500">
          {state.fieldErrors.email[0]}
        </p>
      )}
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main table
// ---------------------------------------------------------------------------

function initials(name?: string | null, email?: string | null) {
  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  }
  return (email?.[0] ?? "?").toUpperCase();
}

// ---------------------------------------------------------------------------
// Inline name editor
// ---------------------------------------------------------------------------

function NameCell({
  userId,
  name,
  email,
  imageUrl,
  isSelf,
}: {
  userId: string;
  name: string | null;
  email: string | null;
  imageUrl: string | null;
  isSelf: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setDraft(name ?? "");
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError(null);
  }

  function save() {
    startTransition(async () => {
      const result = await updateUserNameAction(userId, draft);
      if (result.error) {
        setError(result.error);
      } else {
        setEditing(false);
        setError(null);
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name ?? email ?? ""}
          className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-border"
        />
      ) : (
        <div className="h-8 w-8 shrink-0 rounded-full bg-brand-ink text-white text-xs font-semibold flex items-center justify-center ring-1 ring-border">
          {initials(name, email)}
        </div>
      )}

      {/* Name / editor */}
      <div className="min-w-0">
        {editing ? (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") cancel();
              }}
              disabled={isPending}
              placeholder="Full name"
              className="w-36 rounded-lg border border-border bg-bg px-2 py-1 text-sm text-text outline-none transition focus-visible:ring-2 focus-visible:ring-gold/30 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={save}
              disabled={isPending}
              className="cursor-pointer rounded-lg px-2 py-1 text-xs font-medium text-green-600 transition hover:bg-green-500/10 disabled:opacity-50"
            >
              {isPending ? "…" : "Save"}
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={isPending}
              className="cursor-pointer rounded-lg px-2 py-1 text-xs font-medium text-muted transition hover:bg-black/10"
            >
              Cancel
            </button>
            {error && <span className="text-xs text-red-500">{error}</span>}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-text truncate">
              {name ?? <span className="italic text-subtle">No name</span>}
              {isSelf && (
                <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">
                  you
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={startEdit}
              title="Edit name"
              className="cursor-pointer shrink-0 rounded p-0.5 text-subtle opacity-0 transition hover:text-text group-hover:opacity-100"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
        )}
        <p className="mt-0.5 text-xs text-muted truncate">{email ?? "—"}</p>
      </div>
    </div>
  );
}

export default function UsersTable({
  users,
  selfEmail,
}: {
  users: (UserRow & { imageUrl: string | null })[];
  selfEmail: string;
}) {
  return (
    <div className="space-y-5">
      {/* Add user */}
      <AddUserForm />

      {/* Users list */}
      <div className="rounded-[18px] border border-border bg-surface overflow-hidden">
        {users.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            No users found.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-semibold text-subtle">
                  User
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-subtle">
                  Role
                </th>
                <th className="hidden px-5 py-3 text-left text-xs font-semibold text-subtle sm:table-cell">
                  Added
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-subtle">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => {
                const isSelf = user.email === selfEmail;
                return (
                  <tr key={user.id} className="group">
                    <td className="px-5 py-3.5">
                      <NameCell
                        userId={user.id}
                        name={user.name}
                        email={user.email}
                        imageUrl={user.imageUrl}
                        isSelf={isSelf}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <RoleSelect
                        userId={user.id}
                        currentRole={user.role}
                        isSelf={isSelf}
                      />
                    </td>
                    <td className="hidden px-5 py-3.5 text-xs text-muted sm:table-cell">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <DeleteButton userId={user.id} isSelf={isSelf} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

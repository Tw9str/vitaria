"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { updateProfileAction } from "@/app/actions/profile";
import {
  presignAvatarUploadAction,
  deleteStorageKeysAction,
} from "@/app/actions/createUploadUrl";
import { imageFileSchema, ACCEPTED_IMAGE_TYPES } from "@/lib/validators";
import Alert from "@/components/shared/Alert";
import Spinner from "@/components/shared/Spinner";

const ACCEPTED = ACCEPTED_IMAGE_TYPES.join(",");

function putWithProgress(
  url: string,
  file: File,
  onProgress: (p: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(file);
  });
}

function initials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  }
  return (email?.[0] ?? "?").toUpperCase();
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

type Props = {
  name: string | null;
  email: string;
  /** R2 key of the current avatar (not a URL). */
  image: string | null;
  /** Presigned view URL generated server-side. */
  imageViewUrl: string | null;
  role: string;
  emailVerified: Date | null;
  createdAt: Date;
};

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500">{msg}</p>;
}

export default function ProfileEditor({
  name,
  email,
  image,
  imageViewUrl,
  role,
  emailVerified,
  createdAt,
}: Props) {
  const [nameValue, setNameValue] = useState(name ?? "");
  const [nameError, setNameError] = useState("");

  const [avatarKey, setAvatarKey] = useState(image ?? "");
  const [avatarPreview, setAvatarPreview] = useState(imageViewUrl ?? "");
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "done" | "error"
  >("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState("");

  const [, startTransition] = useTransition();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localPreviewRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** Image key that was last successfully persisted to the DB. */
  const dbImageKeyRef = useRef(image ?? "");
  /** Latest name value — avoids stale closure in debounce. */
  const nameValueRef = useRef(name ?? "");
  /** Latest avatarKey — avoids stale closure in debounce. */
  const avatarKeyRef = useRef(image ?? "");

  // Warn the user if they try to close/refresh the tab during an upload.
  useEffect(() => {
    if (uploadStatus !== "uploading") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [uploadStatus]);

  const displayName = nameValue || email;

  function triggerSavedReset() {
    setTimeout(() => setSaveStatus((s) => (s === "saved" ? "idle" : s)), 2000);
  }

  function saveProfile(nameVal: string, imageKey: string) {
    const fd = new FormData();
    fd.append("name", nameVal);
    fd.append("image", imageKey);
    fd.append("oldImage", dbImageKeyRef.current);

    startTransition(async () => {
      setSaveStatus("saving");
      setSaveError("");
      const result = await updateProfileAction(null, fd);
      if (result?.success) {
        dbImageKeyRef.current = imageKey;
        setSaveStatus("saved");
        triggerSavedReset();
      } else {
        const msg =
          result?.fieldErrors?.name?.[0] ?? result?.formError ?? "Save failed.";
        setSaveStatus("error");
        setSaveError(msg);
        if (result?.fieldErrors?.name?.[0])
          setNameError(result.fieldErrors.name[0]);
      }
    });
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setNameValue(val);
    nameValueRef.current = val;
    setNameError("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Use avatarKeyRef to avoid stale closure.
      saveProfile(nameValueRef.current, avatarKeyRef.current);
    }, 800);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const parsed = imageFileSchema.safeParse(file);
    if (!parsed.success) {
      setUploadError(parsed.error.issues[0].message);
      setUploadStatus("error");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current);
    localPreviewRef.current = localUrl;
    setAvatarPreview(localUrl);
    setUploadStatus("uploading");
    setUploadProgress(1);
    setUploadError("");

    try {
      const signed = await presignAvatarUploadAction({
        filename: file.name,
        contentType: file.type,
        size: file.size,
      });

      await putWithProgress(signed.uploadUrl, file, setUploadProgress);

      // Delete the old R2 key (fire-and-forget).
      if (avatarKey && avatarKey !== signed.key) {
        void deleteStorageKeysAction([avatarKey]);
      }

      // Persist the new key to DB with a plain await — NOT inside startTransition.
      // This guarantees the write completes even if the component unmounts
      // (e.g. user navigates away) before this line resolves.
      const fd = new FormData();
      fd.append("name", nameValueRef.current);
      fd.append("image", signed.key);
      fd.append("oldImage", dbImageKeyRef.current);
      const result = await updateProfileAction(null, fd);
      if (result?.success) {
        dbImageKeyRef.current = signed.key;
        avatarKeyRef.current = signed.key;
      }

      // State updates below are no-ops if the component has already unmounted,
      // but the DB write above has already happened regardless.
      setAvatarKey(signed.key);
      setAvatarPreview(signed.viewUrl);
      setUploadStatus("done");
      setSaveStatus(result?.success ? "saved" : "error");
      if (result?.success) triggerSavedReset();
      else setSaveError(result?.formError ?? "Save failed.");

      URL.revokeObjectURL(localUrl);
      localPreviewRef.current = null;
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
      setUploadStatus("error");
      setAvatarPreview(imageViewUrl ?? "");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleRemoveAvatar() {
    void deleteStorageKeysAction([avatarKey]);
    avatarKeyRef.current = "";
    setAvatarKey("");
    setAvatarPreview("");
    setUploadStatus("idle");
    saveProfile(nameValueRef.current, "");
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Profile</h1>

      <div className="mt-5 rounded-[18px] border border-border bg-surface p-6">
        {/* Avatar + identity */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt={displayName}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-ink text-lg font-semibold text-white ring-2 ring-border">
                {initials(nameValue || null, email)}
              </div>
            )}
            {uploadStatus === "uploading" && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <span className="text-xs font-semibold text-white">
                  {uploadProgress}%
                </span>
              </div>
            )}
          </div>

          <div>
            <p className="text-base font-semibold text-text">{displayName}</p>
            <p className="text-sm text-muted">{email}</p>
          </div>

          <span
            className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${
              role === "admin"
                ? "bg-gold/15 text-gold"
                : "bg-black/10 text-muted"
            }`}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        </div>

        {/* Read-only info */}
        <div className="mt-6 space-y-0 divide-y divide-border rounded-xl border border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-subtle">Email</span>
            <span className="text-sm font-medium text-muted">{email}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-subtle">Email verified</span>
            <span className="text-sm font-medium">
              {emailVerified ? (
                <span className="text-green-500">
                  {new Date(emailVerified).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              ) : (
                <span className="text-red-400">Not verified</span>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-subtle">Member since</span>
            <span className="text-sm font-medium text-muted">
              {new Date(createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Upload-in-progress warning */}
        {uploadStatus === "uploading" && (
          <Alert variant="warning" className="mt-4">
            <span className="flex items-center gap-2">
              <Spinner className="h-4 w-4 shrink-0" />
              Uploading image — please don&apos;t navigate away.
            </span>
          </Alert>
        )}

        {/* Edit section */}
        <div className="mt-6 space-y-4">
          {/* Heading + save status */}
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-text">Edit profile</h2>
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <Spinner className="h-3.5 w-3.5" />
                Saving…
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1 text-xs text-green-500">
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Saved
              </span>
            )}
            {saveStatus === "error" && !nameError && (
              <span className="text-xs text-red-500">{saveError}</span>
            )}
          </div>

          {/* Avatar upload */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">
              Avatar <span className="font-normal text-subtle">(optional)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                id="avatar-upload"
                type="file"
                accept={ACCEPTED}
                className="hidden"
                onChange={handleFileChange}
                disabled={uploadStatus === "uploading"}
              />
              <label
                htmlFor="avatar-upload"
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-bg px-4 py-2 text-sm font-medium text-muted transition hover:brightness-110 ${
                  uploadStatus === "uploading"
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {uploadStatus === "uploading"
                  ? `Uploading… ${uploadProgress}%`
                  : avatarKey
                    ? "Change photo"
                    : "Upload photo"}
              </label>

              {avatarKey && uploadStatus !== "uploading" && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="text-sm text-red-400 hover:text-red-500"
                >
                  Remove
                </button>
              )}
            </div>

            {uploadStatus === "uploading" && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-full rounded-full bg-brand-ink transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            {uploadStatus === "error" && (
              <Alert variant="error" className="mt-1">
                {uploadError}
              </Alert>
            )}

            <p className="mt-1.5 text-xs text-subtle">
              JPEG, PNG, or WebP · Max 8 MB
            </p>
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-muted"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={nameValue}
              onChange={handleNameChange}
              placeholder="Jane Smith"
              autoComplete="name"
              className={`w-full rounded-2xl border px-3 py-2.5 text-sm text-muted outline-none transition focus:ring-4 focus:ring-gold/15 ${
                nameError
                  ? "border-red-500 focus:border-red-500"
                  : "border-border bg-bg focus:border-gold/60"
              }`}
            />
            <FieldError msg={nameError} />
          </div>
        </div>
      </div>
    </div>
  );
}

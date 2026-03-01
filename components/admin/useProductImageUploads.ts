"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  presignProductImageUploads,
  presignViewUrls,
  deleteStorageKeysAction,
} from "@/app/actions/createUploadUrl";
import { imageFileSchema } from "@/lib/validators";

// ---------------------------------------------------------------------------
// Upload queue reducer (inlined to avoid module-resolution issues)
// ---------------------------------------------------------------------------
export type UploadStatus = "queued" | "uploading" | "error";

export type UploadItem = {
  id: string;
  file: File;
  localUrl: string;
  progress: number;
  status: UploadStatus;
  error?: string;
};

type UploadAction =
  | { type: "ADD_FILES"; files: File[]; maxItems: number }
  | { type: "REMOVE"; id: string }
  | { type: "SET_STATUS"; id: string; status: UploadStatus; error?: string }
  | { type: "SET_PROGRESS"; id: string; progress: number }
  | { type: "RESET_ERRORS_TO_QUEUED" };

function uploadsReducer(
  state: UploadItem[],
  action: UploadAction,
): UploadItem[] {
  switch (action.type) {
    case "ADD_FILES": {
      const next = action.files.map<UploadItem>((file) => ({
        id: crypto.randomUUID(),
        file,
        localUrl: URL.createObjectURL(file),
        progress: 0,
        status: "queued",
      }));
      return [...state, ...next].slice(0, action.maxItems);
    }
    case "REMOVE":
      return state.filter((u) => u.id !== action.id);
    case "SET_STATUS":
      return state.map((u) =>
        u.id === action.id
          ? { ...u, status: action.status, error: action.error }
          : u,
      );
    case "SET_PROGRESS":
      return state.map((u) =>
        u.id === action.id ? { ...u, progress: action.progress } : u,
      );
    case "RESET_ERRORS_TO_QUEUED":
      return state.map((u) =>
        u.status === "error" ? { ...u, status: "queued", error: undefined } : u,
      );
    default:
      return state;
  }
}

const MAX_GALLERY_IMAGES = 12;
const VIEW_URL_REFRESH_MS = 120_000;

// ---------------------------------------------------------------------------
// PUT with XHR progress
// ---------------------------------------------------------------------------
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

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const copy = arr.slice();
  const [x] = copy.splice(from, 1);
  copy.splice(to, 0, x);
  return copy;
}

// ---------------------------------------------------------------------------
// Presigned view-URL refresh
// ---------------------------------------------------------------------------
function usePresignedViewUrls(keys: string[], refreshMs = VIEW_URL_REFRESH_MS) {
  const [map, setMap] = useState<Record<string, string>>({});
  const stableKeys = useMemo(() => keys.filter(Boolean), [keys]);

  useEffect(() => {
    if (!stableKeys.length) return;
    let cancelled = false;

    const refresh = async () => {
      try {
        const res = await presignViewUrls({ keys: stableKeys });
        if (cancelled) return;
        const next: Record<string, string> = {};
        for (const r of res) next[r.key] = r.viewUrl;
        setMap((prev) => ({ ...prev, ...next }));
      } catch {
        // best-effort
      }
    };

    void refresh();
    const t = setInterval(refresh, refreshMs);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [stableKeys, refreshMs]);

  return map;
}

// ---------------------------------------------------------------------------
// Main hook
// ---------------------------------------------------------------------------
type HeroUiState = {
  status: "idle" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
};

export function useProductImageUploads({
  productId,
  initialHeroKey,
  initialGalleryKeys,
}: {
  productId: string;
  initialHeroKey: string;
  initialGalleryKeys: string[];
}) {
  const [heroKey, setHeroKey] = useState(initialHeroKey);
  const [heroUi, setHeroUi] = useState<HeroUiState>({
    status: "idle",
    progress: 0,
  });

  const [galleryKeys, setGalleryKeys] = useState<string[]>(initialGalleryKeys);
  const [uploads, dispatchUploads] = useReducer(uploadsReducer, []);
  const [galleryError, setGalleryError] = useState("");

  // ── Presigned view URLs ──────────────────────────────────────────────────
  const previewKeys = useMemo(
    () => [heroKey, ...galleryKeys].filter(Boolean),
    [heroKey, galleryKeys],
  );
  const viewUrlMap = usePresignedViewUrls(previewKeys);

  // ── Object-URL cleanup ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      uploads.forEach((u) => URL.revokeObjectURL(u.localUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevUploadIds = useRef(new Map<string, string>());
  useEffect(() => {
    const next = new Map(uploads.map((u) => [u.id, u.localUrl]));
    for (const [id, url] of prevUploadIds.current.entries()) {
      if (!next.has(id)) URL.revokeObjectURL(url);
    }
    prevUploadIds.current = next;
  }, [uploads]);

  // ── Hero upload ──────────────────────────────────────────────────────────
  const uploadHero = useCallback(
    async (file: File) => {
      const parsed = imageFileSchema.safeParse(file);
      if (!parsed.success) {
        setHeroUi({
          status: "error",
          progress: 0,
          error: parsed.error.issues[0].message,
        });
        return;
      }

      const prevKey = heroKey;
      setHeroUi({ status: "uploading", progress: 1 });
      setHeroKey("");

      try {
        const [signed] = await presignProductImageUploads({
          productId,
          files: [
            { filename: file.name, contentType: file.type, size: file.size },
          ],
        });

        await putWithProgress(signed.uploadUrl, file, (p) =>
          setHeroUi((s) => ({ ...s, progress: p })),
        );

        setHeroKey(signed.key);
        setHeroUi({ status: "done", progress: 100 });

        if (prevKey && prevKey !== signed.key) {
          void deleteStorageKeysAction([prevKey]);
        }
      } catch (e) {
        setHeroKey(prevKey);
        setHeroUi({
          status: "error",
          progress: 0,
          error: e instanceof Error ? e.message : "Hero upload failed",
        });
      }
    },
    [productId, heroKey],
  );

  // ── Gallery helpers ──────────────────────────────────────────────────────
  const addGalleryFiles = useCallback((files: FileList | File[]) => {
    const all = Array.from(files);
    const invalid = all
      .map((f) => ({ f, r: imageFileSchema.safeParse(f) }))
      .filter(({ r }) => !r.success)
      .map(
        ({ f, r }) =>
          `"${f.name}": ${!r.success ? r.error.issues[0].message : ""}`,
      );

    const valid = all.filter((f) => imageFileSchema.safeParse(f).success);
    setGalleryError(invalid.length ? invalid.join(" · ") : "");
    if (valid.length)
      dispatchUploads({
        type: "ADD_FILES",
        files: valid,
        maxItems: MAX_GALLERY_IMAGES,
      });
  }, []);

  const removeGalleryKey = useCallback((key: string) => {
    setGalleryKeys((prev) => prev.filter((k) => k !== key));
    void deleteStorageKeysAction([key]);
  }, []);

  const reorderGallery = useCallback((from: number, to: number) => {
    setGalleryKeys((prev) => arrayMove(prev, from, to));
  }, []);

  const retryFailedUploads = useCallback(() => {
    dispatchUploads({ type: "RESET_ERRORS_TO_QUEUED" });
  }, []);

  const removeUpload = useCallback((id: string) => {
    dispatchUploads({ type: "REMOVE", id });
  }, []);

  // ── Sequential auto-upload ───────────────────────────────────────────────
  const uploadingRef = useRef(false);
  const startedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (uploadingRef.current) return;

    const next = uploads.find(
      (u) => u.status === "queued" && !startedRef.current.has(u.id),
    );
    if (!next) return;

    uploadingRef.current = true;
    startedRef.current.add(next.id);

    (async () => {
      try {
        dispatchUploads({
          type: "SET_STATUS",
          id: next.id,
          status: "uploading",
        });
        dispatchUploads({ type: "SET_PROGRESS", id: next.id, progress: 1 });

        const [s] = await presignProductImageUploads({
          productId,
          files: [
            {
              filename: next.file.name,
              contentType: next.file.type,
              size: next.file.size,
            },
          ],
        });

        await putWithProgress(s.uploadUrl, next.file, (p) =>
          dispatchUploads({ type: "SET_PROGRESS", id: next.id, progress: p }),
        );

        setGalleryKeys((prev) =>
          prev.includes(s.key) ? prev : [...prev, s.key],
        );
        dispatchUploads({ type: "REMOVE", id: next.id });
      } catch (e) {
        dispatchUploads({
          type: "SET_STATUS",
          id: next.id,
          status: "error",
          error: e instanceof Error ? e.message : "Upload failed",
        });
        startedRef.current.delete(next.id);
      } finally {
        uploadingRef.current = false;
      }
    })();
  }, [uploads, productId]);

  return {
    // hero
    heroKey,
    heroUi,
    uploadHero,
    // gallery
    galleryKeys,
    uploads: uploads as UploadItem[],
    galleryError,
    viewUrlMap,
    addGalleryFiles,
    removeGalleryKey,
    reorderGallery,
    retryFailedUploads,
    removeUpload,
  };
}

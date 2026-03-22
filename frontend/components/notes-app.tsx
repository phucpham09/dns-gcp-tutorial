"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  createNote,
  deleteNote,
  updateNote,
  type NoteRead,
} from "@/lib/api/notes";
import { noteQueryKeys, notesListQueryOptions } from "@/lib/queries/notes";

const field =
  "w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-[15px] leading-relaxed text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-teal-500/60 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600/80 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-400/50 dark:focus:ring-teal-400/15";

const fieldSm =
  "w-full rounded-lg border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:border-teal-500/60 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600/80 dark:bg-slate-950/50 dark:text-slate-100 dark:focus:border-teal-400/50 dark:focus:ring-teal-400/15";

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function NotesApp() {
  const queryClient = useQueryClient();
  const notesQuery = useQuery(notesListQueryOptions);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noteQueryKeys.all });
      setTitle("");
      setContent("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noteQueryKeys.all });
    },
  });

  const listError =
    notesQuery.error instanceof Error
      ? notesQuery.error.message
      : notesQuery.error
        ? String(notesQuery.error)
        : null;
  const createError =
    createMutation.error instanceof Error
      ? createMutation.error.message
      : createMutation.error
        ? String(createMutation.error)
        : null;
  const deleteError =
    deleteMutation.error instanceof Error
      ? deleteMutation.error.message
      : deleteMutation.error
        ? String(deleteMutation.error)
        : null;

  const error = listError ?? createError ?? deleteError;

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({
      title: title.trim() || null,
      content: content.trim() || "",
    });
  }

  const notes = notesQuery.data ?? [];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10 text-center sm:mb-12 sm:text-left">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50/90 px-3 py-1 text-xs font-medium text-teal-800 dark:border-teal-800/60 dark:bg-teal-950/50 dark:text-teal-200">
          <span
            className="size-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]"
            aria-hidden
          />
          FastAPI · TanStack Query · openapi-typescript
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Ghi chú
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-pretty text-sm text-slate-600 sm:mx-0 dark:text-slate-400">
          Dữ liệu từ REST API; kiểu TypeScript sinh từ OpenAPI (
          <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-slate-800">
            pnpm run generate:api-types
          </code>
          ).
        </p>
      </header>

      {error ? (
        <div
          role="alert"
          className="mb-8 flex gap-3 rounded-2xl border border-rose-200/90 bg-rose-50/95 p-4 text-sm text-rose-900 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100"
        >
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-lg font-semibold text-rose-600 dark:bg-rose-900/50 dark:text-rose-300"
            aria-hidden
          >
            !
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="font-medium">Có lỗi khi gọi API</p>
            <p className="mt-1 break-words font-mono text-xs opacity-90">
              {error}
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-10">
        <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm ring-1 ring-slate-900/[0.02] backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/40 dark:ring-white/[0.04] sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300">
              +
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Ghi chú mới
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tiêu đề tuỳ chọn — nội dung là bắt buộc
              </p>
            </div>
          </div>
          <form onSubmit={onCreate} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="note-title"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Tiêu đề
              </label>
              <input
                id="note-title"
                type="text"
                placeholder="Ví dụ: Ý tưởng cuối tuần"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label
                htmlFor="note-content"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Nội dung
              </label>
              <textarea
                id="note-content"
                required
                rows={4}
                placeholder="Viết nội dung tại đây…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`${field} min-h-[120px] resize-y`}
              />
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:pointer-events-none disabled:opacity-50 dark:bg-teal-500 dark:hover:bg-teal-400 dark:focus-visible:outline-teal-400"
            >
              {createMutation.isPending ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Đang lưu…
                </>
              ) : (
                "Tạo ghi chú"
              )}
            </button>
          </form>
        </section>

        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                ≡
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Danh sách
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {notesQuery.isPending
                    ? "Đang đồng bộ…"
                    : `${notes.length} ghi chú`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void notesQuery.refetch()}
              disabled={notesQuery.isFetching}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span
                className={notesQuery.isFetching ? "animate-spin" : ""}
                aria-hidden
              >
                ↻
              </span>
              {notesQuery.isFetching ? "Đang tải…" : "Làm mới"}
            </button>
          </div>

          {notesQuery.isPending ? (
            <ul className="flex flex-col gap-3" aria-busy>
              {[1, 2, 3].map((i) => (
                <li
                  key={i}
                  className="h-28 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60"
                />
              ))}
            </ul>
          ) : notes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300/90 bg-slate-50/50 px-6 py-16 text-center dark:border-slate-600 dark:bg-slate-900/20">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Chưa có ghi chú
              </p>
              <p className="mx-auto mt-2 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                Chạy backend + Postgres, rồi tạo ghi chú ở form phía trên.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  deleting={
                    deleteMutation.isPending &&
                    deleteMutation.variables === note.id
                  }
                  onDelete={() => deleteMutation.mutate(note.id)}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function NoteCard({
  note,
  deleting,
  onDelete,
}: {
  note: NoteRead;
  deleting: boolean;
  onDelete: () => void;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title ?? "");
  const [content, setContent] = useState(note.content);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateNote(note.id, {
        title: title.trim() || null,
        content,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noteQueryKeys.all });
      setEditing(false);
    },
  });

  const updateError =
    updateMutation.error instanceof Error
      ? updateMutation.error.message
      : updateMutation.error
        ? String(updateMutation.error)
        : null;

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate();
  }

  return (
    <li className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm ring-1 ring-slate-900/[0.03] transition hover:shadow-md dark:border-slate-700/60 dark:bg-slate-900/50 dark:ring-white/[0.04] dark:hover:border-slate-600">
      <div
        className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-teal-500 to-teal-600 opacity-90"
        aria-hidden
      />
      <div className="p-5 pl-6 sm:p-6 sm:pl-7">
        {editing ? (
          <form onSubmit={onSave} className="flex flex-col gap-4">
            {updateError ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:bg-rose-950/50 dark:text-rose-200">
                {updateError}
              </p>
            ) : null}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldSm}
              placeholder="Tiêu đề"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className={`${fieldSm} min-h-[100px] resize-y`}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-500 disabled:opacity-50 dark:bg-teal-500 dark:hover:bg-teal-400"
              >
                {updateMutation.isPending ? "Đang lưu…" : "Lưu thay đổi"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  updateMutation.reset();
                }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80"
              >
                Huỷ
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold leading-snug text-slate-900 dark:text-white">
                  {note.title?.trim() ? (
                    note.title
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">
                      Không tiêu đề
                    </span>
                  )}
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                  {note.content}
                </p>
              </div>
              <div className="flex shrink-0 gap-2 sm:flex-col sm:items-stretch">
                <button
                  type="button"
                  onClick={() => {
                    setTitle(note.title ?? "");
                    setContent(note.content);
                    setEditing(true);
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={deleting}
                  className="rounded-lg border border-rose-200/90 bg-rose-50/80 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70"
                >
                  {deleting ? "Đang xoá…" : "Xoá"}
                </button>
              </div>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-700/80 dark:text-slate-500">
              Cập nhật lần cuối · {formatDate(note.updated_at)}
            </p>
          </>
        )}
      </div>
    </li>
  );
}

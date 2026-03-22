import type { components } from "@/types/openapi";

export type NoteRead = components["schemas"]["NoteRead"];
export type NoteCreate = components["schemas"]["NoteCreate"];
export type NoteUpdate = components["schemas"]["NoteUpdate"];

function apiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "/api/backend";
}

function errorMessage(status: number, body: unknown): string {
  if (
    body &&
    typeof body === "object" &&
    "detail" in body &&
    Array.isArray((body as { detail: unknown }).detail)
  ) {
    return `${status}: ${JSON.stringify((body as { detail: unknown }).detail)}`;
  }
  if (typeof body === "string" && body) return `${status}: ${body}`;
  return `${status}: Request failed`;
}

async function readBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function fetchNotes(): Promise<NoteRead[]> {
  const res = await fetch(`${apiBase()}/notes`);
  const data = await readBody(res);
  if (!res.ok) throw new Error(errorMessage(res.status, data));
  return data as NoteRead[];
}

export async function createNote(body: NoteCreate): Promise<NoteRead> {
  const res = await fetch(`${apiBase()}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await readBody(res);
  if (!res.ok) throw new Error(errorMessage(res.status, data));
  return data as NoteRead;
}

export async function updateNote(
  noteId: string,
  body: NoteUpdate,
): Promise<NoteRead> {
  const res = await fetch(
    `${apiBase()}/notes/${encodeURIComponent(noteId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const data = await readBody(res);
  if (!res.ok) throw new Error(errorMessage(res.status, data));
  return data as NoteRead;
}

export async function deleteNote(noteId: string): Promise<void> {
  const res = await fetch(
    `${apiBase()}/notes/${encodeURIComponent(noteId)}`,
    { method: "DELETE" },
  );
  if (res.status === 204) return;
  const data = await readBody(res);
  throw new Error(errorMessage(res.status, data));
}

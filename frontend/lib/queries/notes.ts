import { queryOptions } from "@tanstack/react-query";

import { fetchNotes } from "@/lib/api/notes";

export const noteQueryKeys = {
  all: ["notes"] as const,
};

export const notesListQueryOptions = queryOptions({
  queryKey: noteQueryKeys.all,
  queryFn: fetchNotes,
});

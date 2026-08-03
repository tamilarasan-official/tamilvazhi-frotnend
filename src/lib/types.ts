/** Plain, JSON-safe shapes handed from server components to client components. */

export type ItemType = "VIDEO" | "DOCUMENT";

export type ClientItem = {
  id: string;
  title: string;
  description: string | null;
  type: ItemType;
  fileName: string;
  mimeType: string;
  sizeBytes: number; // exact to 2^53 bytes (9 PB) — no BigInt needed
  durationSec: number | null;
  downloadable: boolean;
};

export type ClientModule = {
  id: string;
  title: string;
  description: string | null;
  items: ClientItem[];
};

export type ClientCourse = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  accent: string;
  modules: ClientModule[];
};

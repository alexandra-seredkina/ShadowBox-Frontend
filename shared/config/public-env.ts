import { z } from "zod";

const publicEnvSchema = z.object({
  apiMode: z.enum(["mock", "http"]).default("http"),
  /** Absolute origin for Open Graph links; without it Next.js falls back to localhost. */
  siteUrl: z.url().optional(),
});

export type ApiMode = z.infer<typeof publicEnvSchema>["apiMode"];

// NEXT_PUBLIC_* values are inlined at build time, so each one is read by its literal name.
export const publicEnv = publicEnvSchema.parse({
  apiMode: process.env.NEXT_PUBLIC_API_MODE || undefined,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || undefined,
});

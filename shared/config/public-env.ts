import { z } from "zod";

const publicEnvSchema = z.object({
  apiMode: z.enum(["mock", "http"]).default("http"),
});

export type ApiMode = z.infer<typeof publicEnvSchema>["apiMode"];

// NEXT_PUBLIC_* values are inlined at build time, so each one is read by its literal name.
export const publicEnv = publicEnvSchema.parse({
  apiMode: process.env.NEXT_PUBLIC_API_MODE || undefined,
});

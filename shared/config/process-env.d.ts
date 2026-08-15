// Declared so public variables can be read with dot access, the only form Next.js inlines.
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_API_MODE?: string;
  }
}

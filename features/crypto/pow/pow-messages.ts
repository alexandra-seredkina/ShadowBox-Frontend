export type PowRequest = {
  readonly prefix: Uint8Array;
  readonly difficulty: number;
};

export type PowResponse =
  | { readonly type: "progress"; readonly attempts: number }
  | { readonly type: "solved"; readonly nonce: string; readonly attempts: number }
  | { readonly type: "failed" };

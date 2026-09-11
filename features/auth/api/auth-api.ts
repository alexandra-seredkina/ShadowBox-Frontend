import type { KdfParams } from "@/features/crypto/model/kdf";
import type { PowChallenge } from "@/features/crypto/pow/solve-pow";
import { mockAuthApi } from "@/features/mock-server/mock-auth-api";
import { selectApi } from "@/shared/api/client";
import type {
  LoginRequest,
  LoginResponse,
  PowPurpose,
  RegisterRequest,
  RegisterResponse,
  SessionResponse,
} from "./auth-schemas";
import { httpAuthApi } from "./http-auth-api";

/** `/auth/*` from API.md §3. Every method rejects with `ApiError`. */
export type AuthApi = {
  readonly requestPow: (purpose: PowPurpose) => Promise<PowChallenge>;
  readonly prelogin: (login: string) => Promise<KdfParams>;
  readonly register: (request: RegisterRequest, idempotencyKey: string) => Promise<RegisterResponse>;
  readonly login: (request: LoginRequest) => Promise<LoginResponse>;
  readonly logout: () => Promise<void>;
  readonly loadSession: () => Promise<SessionResponse>;
  /** Opens the 5-minute window for 🔒 actions; the server rotates the session cookie. */
  readonly reauth: (authKey: string) => Promise<void>;
};

export const authApi: AuthApi = selectApi({ http: httpAuthApi, mock: mockAuthApi });

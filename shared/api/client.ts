import { publicEnv, type ApiMode } from "@/shared/config/public-env";

type Implementations<T> = Readonly<Record<ApiMode, T>>;

/**
 * The single place that picks between real and mock API implementations (NEXT_PUBLIC_API_MODE).
 * Features pass both and never branch on the environment themselves.
 */
export function selectApi<T>(implementations: Implementations<T>): T {
  return implementations[publicEnv.apiMode];
}

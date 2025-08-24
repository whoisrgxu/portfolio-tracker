import createClient from "openapi-fetch";
import type { paths } from "../../../../packages/shared/api-types";

const baseUrl =
  (import.meta as any)?.env?.VITE_API_URL ||
  "http://localhost:8000";

export const api = createClient<paths>({ baseUrl });

import axios, { AxiosError, AxiosInstance } from "axios";
import {
  ProviderError,
  type ProviderAlias,
  type ProviderErrorKind,
} from "@paylinkhub/types";
import { env } from "../config/env.js";
import { logProvider } from "../utils/logger.js";

function classifyError(error: unknown): ProviderErrorKind {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.code === "ECONNABORTED" || axiosError.code === "ETIMEDOUT") {
      return "timeout";
    }
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status >= 500) return "http_5xx";
      if (status >= 400) return "http_4xx";
    }
    return "network";
  }
  if (error instanceof Error && error.message.includes("timeout")) {
    return "timeout";
  }
  return "network";
}

export interface RequestConfig {
  method?: "get" | "post" | "put" | "delete";
  url: string;
  params?: Record<string, unknown>;
}

export class HttpClient {
  private client: AxiosInstance;

  constructor(private alias: ProviderAlias) {
    this.client = axios.create({
      timeout: env.resilience.timeoutMs,
      headers: { Accept: "application/json" },
    });
  }

  async request<T>(config: RequestConfig): Promise<T> {
    const { url, method = "get", params } = config;
    const startedAt = Date.now();
    let lastError: unknown;

    for (let attempt = 1; attempt <= env.resilience.maxAttempts; attempt++) {
      try {
        const response = await this.client.request<T>({
          method,
          url,
          params,
        });
        logProvider({
          provider: this.alias,
          attempt,
          latencyMs: Date.now() - startedAt,
          outcome: "success",
          url,
        });
        return response.data;
      } catch (error) {
        lastError = error;
        const kind = classifyError(error);
        logProvider({
          provider: this.alias,
          attempt,
          outcome: "error",
          errorKind: kind,
          url,
        });
        const isRetryable = kind === "timeout" || kind === "network" || kind === "http_5xx";
        if (!isRetryable || attempt === env.resilience.maxAttempts) {
          break;
        }
        const delay = env.resilience.backoffMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    const kind = classifyError(lastError);
    throw new ProviderError(kind, this.alias, lastError as Error | undefined);
  }
}

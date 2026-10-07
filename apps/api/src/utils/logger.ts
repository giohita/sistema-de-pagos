export interface LogFields {
  provider?: string;
  latencyMs?: number;
  outcome?: "success" | "error" | "cached";
  errorKind?: string;
  attempt?: number;
  [key: string]: unknown;
}

export function logProvider(fields: LogFields): void {
  const timestamp = new Date().toISOString();
  const line = { timestamp, ...fields };
  if (process.env.NODE_ENV === "development") {
    console.log(`[provider] ${JSON.stringify(line)}`);
  } else {
    console.log(JSON.stringify(line));
  }
}

type ApiError = { message: string };

export async function adminApi<T = unknown>(action: string, values: Record<string, unknown> = {}) {
  try {
    const response = await fetch("/api/admin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, ...values }),
    });
    const body = (await response.json()) as { data?: T; error?: string };
    if (!response.ok) return { data: null as T | null, error: { message: body.error ?? "Request failed" } as ApiError };
    return { data: (body.data ?? null) as T | null, error: null as ApiError | null };
  } catch (error) {
    return {
      data: null as T | null,
      error: { message: error instanceof Error ? error.message : "Request failed" } as ApiError,
    };
  }
}

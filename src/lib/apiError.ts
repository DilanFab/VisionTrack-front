type ApiErrorShape = {
  response?: {
    status?: number;
    data?: {
      error?: unknown;
    };
  };
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (!isObject(error) || !("response" in error)) {
    return fallback;
  }

  const response = (error as ApiErrorShape).response;
  const apiMessage = response?.data?.error;
  return typeof apiMessage === "string" && apiMessage.trim() ? apiMessage : fallback;
};

export const getApiStatusCode = (error: unknown): number | null => {
  if (!isObject(error) || !("response" in error)) {
    return null;
  }

  const response = (error as ApiErrorShape).response;
  return typeof response?.status === "number" ? response.status : null;
};

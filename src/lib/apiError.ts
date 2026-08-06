type ApiErrorShape = {
  response?: {
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

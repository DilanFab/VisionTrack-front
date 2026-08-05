export interface PaginatedApiResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const unwrapApiList = <T>(payload: T[] | PaginatedApiResponse<T>): T[] =>
  Array.isArray(payload) ? payload : payload.data;

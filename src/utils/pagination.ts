export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function parsePagination(
  query: { page?: unknown; limit?: unknown },
  defaultLimit = 20,
  maxLimit = 100,
): PaginationParams {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number(query.limit) || defaultLimit));
  return { page, limit, offset: (page - 1) * limit };
}

export function paginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}

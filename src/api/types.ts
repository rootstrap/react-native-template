export type PaginateQuery<T> = {
  results: Array<T>;
  count: number;
  next: string | null;
  previous: string | null;
};

export type ApiResponse<T> =
  | {
      errors: Array<string>;
    }
  | T;

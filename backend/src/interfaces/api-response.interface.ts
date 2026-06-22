/**
 * Envelope every successful HTTP response is wrapped in by the global
 * `ResponseInterceptor`. Errors are shaped separately by `AllExceptionsFilter`.
 */
export interface IApiResponse<TEntity> {
  /** Always `true` for successful responses. */
  status: boolean;
  /** HTTP status code of the response (e.g. 200, 201). */
  statusCode: number;
  /** Human-readable description of the result. */
  message: string;
  /** The actual payload — a single object or an array. */
  entity: TEntity;
}

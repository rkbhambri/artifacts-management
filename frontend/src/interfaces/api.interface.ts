export interface ApiEnvelope<T> {
  status: boolean;
  statusCode: number;
  message: string;
  entity: T;
}

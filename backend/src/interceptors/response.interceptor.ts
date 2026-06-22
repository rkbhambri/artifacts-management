import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SKIP_SUCCESS_WRAPPER_KEY } from '../decorators/skip-success-wrapper.decorator';
import { IApiResponse } from '../interfaces';

/**
 * Wraps every successful response in a consistent envelope:
 * `{ status, statusCode, message, entity }`. Routes decorated with
 * `@SkipSuccessWrapper()` (e.g. SSE streams) pass through untouched.
 */
@Injectable()
export class ResponseInterceptor<TEntity>
  implements NestInterceptor<TEntity, IApiResponse<TEntity> | TEntity>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<TEntity>,
  ): Observable<IApiResponse<TEntity> | TEntity> {
    const skip = this.reflector.getAllAndOverride<boolean>(
      SKIP_SUCCESS_WRAPPER_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skip) {
      return next.handle();
    }

    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((entity) => ({
        status: true,
        statusCode: response.statusCode,
        message: messageForStatus(response.statusCode),
        entity: (entity ?? null) as TEntity,
      })),
    );
  }
}

function messageForStatus(statusCode: number): string {
  if (statusCode === HttpStatus.CREATED) {
    return 'Created';
  }
  if (statusCode === HttpStatus.NO_CONTENT) {
    return 'No content';
  }
  return 'Success';
}

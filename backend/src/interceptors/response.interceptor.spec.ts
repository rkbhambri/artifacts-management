import { CallHandler, ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom, of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';
import { IApiResponse } from '../interfaces';

const makeContext = (statusCode = HttpStatus.OK): ExecutionContext =>
  ({
    switchToHttp: () => ({ getResponse: () => ({ statusCode }) }),
    getHandler: () => () => undefined,
    getClass: () => class {},
  }) as unknown as ExecutionContext;

const makeNext = (value: unknown): CallHandler =>
  ({ handle: () => of(value) }) as CallHandler;

const makeInterceptor = (skip: boolean): ResponseInterceptor<unknown> => {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(skip),
  } as unknown as Reflector;
  return new ResponseInterceptor(reflector);
};

describe('ResponseInterceptor', () => {
  it('wraps a successful response in the envelope', async () => {
    const interceptor = makeInterceptor(false);

    const result = await lastValueFrom(
      interceptor.intercept(makeContext(HttpStatus.CREATED), makeNext({ id: 1 })),
    );

    expect(result).toEqual({
      status: true,
      statusCode: HttpStatus.CREATED,
      message: 'Created',
      entity: { id: 1 },
    });
  });

  it('uses a generic success message for 200 responses', async () => {
    const interceptor = makeInterceptor(false);

    const result = (await lastValueFrom(
      interceptor.intercept(makeContext(HttpStatus.OK), makeNext([{ id: 1 }])),
    )) as IApiResponse<unknown>;

    expect(result.message).toBe('Success');
    expect(result.entity).toEqual([{ id: 1 }]);
  });

  it('normalizes an undefined body to entity: null', async () => {
    const interceptor = makeInterceptor(false);

    const result = (await lastValueFrom(
      interceptor.intercept(makeContext(), makeNext(undefined)),
    )) as IApiResponse<unknown>;

    expect(result.entity).toBeNull();
  });

  it('passes the body through untouched when the wrapper is skipped', async () => {
    const interceptor = makeInterceptor(true);

    const result = await lastValueFrom(
      interceptor.intercept(makeContext(), makeNext('raw-body')),
    );

    expect(result).toBe('raw-body');
  });
});

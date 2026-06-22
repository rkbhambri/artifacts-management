import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiKeyGuard } from './api-key.guard';

const makeContext = (key?: string): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        header: (name: string) =>
          name === 'x-api-key' ? key : undefined,
      }),
    }),
  }) as unknown as ExecutionContext;

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;

  beforeEach(() => {
    const config = {
      get: jest.fn().mockReturnValue('expected-secret'),
    } as unknown as ConfigService;
    guard = new ApiKeyGuard(config);
  });

  it('allows the request when the key matches', () => {
    expect(guard.canActivate(makeContext('expected-secret'))).toBe(true);
  });

  it('rejects the request when the key is wrong', () => {
    expect(() => guard.canActivate(makeContext('wrong'))).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects the request when the key is missing', () => {
    expect(() => guard.canActivate(makeContext(undefined))).toThrow(
      UnauthorizedException,
    );
  });
});

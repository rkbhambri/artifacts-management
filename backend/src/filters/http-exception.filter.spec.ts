import {
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';

const makeHost = () => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ method: 'POST', url: '/systems/x/artifacts' }),
    }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
};

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    // Silence the expected error log for the unexpected-exception case.
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maps an HttpException to its status and message', () => {
    const { host, status, json } = makeHost();

    filter.catch(new BadRequestException('bad input'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'bad input',
        path: '/systems/x/artifacts',
      }),
    );
  });

  it('maps a Multer file-size error to 413', () => {
    const { host, status, json } = makeHost();
    const error = Object.assign(new Error('too big'), {
      name: 'MulterError',
      code: 'LIMIT_FILE_SIZE',
    });

    filter.catch(error, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.PAYLOAD_TOO_LARGE);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Uploaded file exceeds the maximum allowed size',
      }),
    );
  });

  it('hides internal details for unexpected errors (500)', () => {
    const { host, status, json } = makeHost();

    filter.catch(new Error('stack trace leak'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }),
    );
  });

  it('includes a path and timestamp in the error body', () => {
    const { host, json } = makeHost();

    filter.catch(new BadRequestException('x'), host);

    const body = json.mock.calls[0][0];
    expect(body.path).toBe('/systems/x/artifacts');
    expect(typeof body.timestamp).toBe('string');
  });
});

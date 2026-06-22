import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const SKIP_SUCCESS_WRAPPER_KEY = 'skipSuccessWrapper';

/**
 * Opt a route (or whole controller) out of the global success envelope.
 * Use it for raw/streaming responses such as SSE or binary downloads where
 * the `{ status, statusCode, message, entity }` shape would corrupt the body.
 */
export const SkipSuccessWrapper = (): CustomDecorator =>
  SetMetadata(SKIP_SUCCESS_WRAPPER_KEY, true);

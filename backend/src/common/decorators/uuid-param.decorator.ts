import { Param, ParseUUIDPipe } from '@nestjs/common';

/**
 * Convenience decorator that applies ParseUUIDPipe to a path parameter.
 * Usage: @UuidParam('id') id: string
 */
export const UuidParam = (name: string) =>
  Param(name, new ParseUUIDPipe({ version: '4' }));

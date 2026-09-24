export type ParseError = Readonly<{
  error: 'ParseError';
  message: string;
}>;

export const createParseError = (message: string): ParseError => {
  return {
    error: 'ParseError',
    message
  } satisfies ParseError;
};

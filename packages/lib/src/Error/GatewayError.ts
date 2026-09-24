type Detail = 'ENTITY_NOT_FOUND' | 'UNIQUE_CONSTRAINT_VIOLATION' | 'FOREIGN_KEY_VIOLATION' | 'CONNECTION_ERROR' | 'UNEXPECTED_ERROR';

export type GatewayError = Readonly<{
  error: 'GatewayError';
  detail: Detail;
  message: string;
}>;

export const createGatewayError = (detail: Detail, message: string): GatewayError => {
  return {
    error: 'GatewayError',
    detail,
    message
  };
};

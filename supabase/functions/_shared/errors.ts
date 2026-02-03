interface StatusCodeErrorMap {
  [key: string]: number;
}

const statusCodeMap: StatusCodeErrorMap = {
  UNAUTHENTICATED: 401,
  OUT_OF_SEQUENCE: 409,
  INVALID_WORKSHEET: 400,
  ALREADY_COMPLETED_TODAY: 409,
  WAITING_FOR_TOMORROW: 409,
  SUBSCRIPTION_REQUIRED: 402,
  INVALID_SEQ_INDEX: 400,
  MISSING_RESPONSE: 400,
};

export function resolveErrorStatus(message: string): number {
  for (const [key, status] of Object.entries(statusCodeMap)) {
    if (message.includes(key)) {
      return status;
    }
  }

  return 500;
}

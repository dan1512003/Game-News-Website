
export interface ApiPageError {
  status: number | 'NETWORK_ERROR' | 'ERROR';
  name: string;
  message: string;
}

type ErrorObject = Record<string, unknown>;

const STATUS_NAMES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  413: 'Payload Too Large',
  415: 'Unsupported Media Type',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
};

const NETWORK_ERROR_PATTERN =
  /network_error|failed to fetch|network error|err_connection_refused|err_internet_disconnected|err_name_not_resolved|err_connection_reset/i;

function getErrorObject(error: unknown): ErrorObject | null {
  if (
    error !== null &&
    typeof error === 'object'
  ) {
    return error as ErrorObject;
  }

  return null;
}

function getNestedObject(
  value: unknown,
): ErrorObject | null {
  return getErrorObject(value);
}

/**
 * Lấy mã HTTP từ ApiErrorResponse hoặc HttpErrorResponse.
 * Giữ nguyên statusCode = 0 khi mất kết nối.
 */
export function getApiErrorStatus(
  error: unknown,
): number | null {
  const value = getErrorObject(error);

  if (!value) {
    return null;
  }

  const errorBody = getNestedObject(value['error']);
  const response = getNestedObject(value['response']);

  const candidates: unknown[] = [
    value['statusCode'],
    value['status'],
    errorBody?.['statusCode'],
    errorBody?.['status'],
    response?.['status'],
  ];

  for (const candidate of candidates) {
    if (
      candidate === null ||
      candidate === undefined ||
      candidate === ''
    ) {
      continue;
    }

    const status = Number(candidate);

    if (
      Number.isInteger(status) &&
      status >= 0 &&
      status <= 599
    ) {
      return status;
    }
  }

  return null;
}

/**
 * Kiểm tra lỗi mất kết nối.
 */
export function isApiNetworkError(
  error: unknown,
): boolean {
  if (typeof error === 'string') {
    return (
      error === 'NETWORK_ERROR' ||
      NETWORK_ERROR_PATTERN.test(error)
    );
  }

  const value = getErrorObject(error);

  if (!value) {
    return false;
  }

  if (getApiErrorStatus(error) === 0) {
    return true;
  }

  const errorBody = getNestedObject(value['error']);

  const message = [
    value['message'],
    errorBody?.['message'],
    errorBody?.['error'],
    value['statusText'],
  ]
    .filter(
      (item): item is string =>
        typeof item === 'string',
    )
    .join(' ');

  return NETWORK_ERROR_PATTERN.test(message);
}

/**
 * Lấy tên lỗi HTTP.
 */
export function getApiErrorStatusName(
  error: unknown,
  status: number | null = getApiErrorStatus(error),
): string {
  const value = getErrorObject(error);

  const errorBody = getNestedObject(value?.['error']);
  const response = getNestedObject(value?.['response']);

  const statusText =
    value?.['statusText'] ??
    errorBody?.['statusText'] ??
    response?.['statusText'];

  if (
    typeof statusText === 'string' &&
    statusText.trim() &&
    statusText !== 'OK'
  ) {
    return statusText;
  }

  if (status === null || status === 0) {
    return 'Request Failed';
  }

  return STATUS_NAMES[status] ?? 'Request Failed';
}

/**
 * Lấy message từ lỗi API.
 * Hỗ trợ message dạng string hoặc string[].
 */
export function getApiErrorMessage(
  error: unknown,
): string {
  if (typeof error === 'string') {
    return error;
  }

  const value = getErrorObject(error);

  if (!value) {
    return 'Đã xảy ra lỗi không xác định.';
  }

  const errorBody = getNestedObject(value['error']);

  const message =
    value['message'] ??
    errorBody?.['message'] ??
    errorBody?.['error'];

  if (
    typeof message === 'string' &&
    message.trim()
  ) {
    return message;
  }

  if (
    Array.isArray(message) &&
    message.every(
      (item): item is string =>
        typeof item === 'string',
    )
  ) {
    return message.join(', ');
  }

  return 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.';
}

/**
 * Chuyển lỗi API thành dữ liệu hiển thị trên giao diện.
 */
export function toApiPageError(
  error: unknown,
): ApiPageError {
  const status = getApiErrorStatus(error);

  if (isApiNetworkError(error)) {
    return {
      status: 'NETWORK_ERROR',
      name: '',
      message: 'Không thể kết nối đến máy chủ.',
    };
  }

  return {
    status: status ?? 'ERROR',
    name: getApiErrorStatusName(error, status),
    message: getApiErrorMessage(error),
  };
}

/**
 * Kiểm tra lỗi 403 để hiển thị modal riêng.
 */
export function isApiForbiddenError(
  error: unknown,
): boolean {
  return getApiErrorStatus(error) === 403;
}

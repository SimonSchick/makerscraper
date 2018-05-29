import * as request from 'request';
import { promisify } from 'util';

export const requestPromise: (
    (opts: request.UrlOptions & request.CoreOptions) => Promise<request.RequestResponse>
  ) = <any> promisify(request);

export interface HTTPClientOptions {
  adapter?: typeof requestPromise;
}

export type RequestOptions = request.OptionsWithUrl;

export interface TypedResponse<T> extends request.RequestResponse {
  body: T;
}

export type HTTPMethod = 'get' | 'delete' | 'post' | 'put' | 'head' | 'patch';

/**
 * A HTTPResponseError is thrown when we get a non-200 response from
 * an external API.
 */
export class HTTPResponseError extends Error {
  /**
   * Creates a new HTTPResponseError instance caused by the given response.
   */
  constructor(public requestOptions: request.Options, public response: request.RequestResponse) {
    super(`HTTP Error: ${response.statusCode}`);
  }

  /**
   * Returns the cause of the error.
   */
  public cause(): {
    requestOptions: request.Options;
    statusCode: number;
    headers: any;
    body: string | object;
  } {
    return {
        body: this.response.body,
        headers: this.response.headers,
        requestOptions: this.requestOptions,
        statusCode: this.response.statusCode,
    };
  }
}

/**
 * 4xx error
 */
export class ClientError extends HTTPResponseError {}
/**
 * 400 error
 */
export class BadRequest extends ClientError {}
/**
 * 401 error
 */
export class Unauthorized extends ClientError {}
/**
 * 402 error
 */
export class PaymentRequired extends ClientError {}
/**
 * 403 error
 */
export class Forbidden extends ClientError {}
/**
 * 404 error
 */
export class NotFound extends ClientError {}
/**
 * 429 error
 */
export class RateLimited extends ClientError {}

export class ServerError extends HTTPResponseError {}
/**
 * 500 error
 */
export class Internal extends ServerError {}
/**
 * 501 error
 */
export class NotImplemented extends ServerError {}
/**
 * 502 error
 */
export class BadGateway extends ServerError {}
/**
 * 503 error
 */
export class GatewayTimeout extends ServerError {}

const errorMap: {
  [key: string]: typeof HTTPResponseError;
} = {
  400: BadRequest,
  401: Unauthorized,
  402: PaymentRequired,
  403: Forbidden,
  404: NotFound,
  429: RateLimited,

  500: Internal,
  501: NotImplemented,
  502: BadGateway,
  503: GatewayTimeout,
};

export interface HTTPClient {
  request<T>(opts: RequestOptions & HTTPClientOptions): Promise<TypedResponse<T>>;
}

/**
 * HTTP client.
 */
export class RequestHTTPClient implements HTTPClient {
  private adapter: typeof requestPromise;
  /**
   * Creates a new HTTP client.
   * Responses which do not contain a 2xx status code.
   */
  constructor(options: HTTPClientOptions = {}) {
    this.adapter = options.adapter || requestPromise;
  }

  /**
   * Performs a http request
   */
  public async request<T>(opts: RequestOptions & HTTPClientOptions): Promise<TypedResponse<T>> {
    const res = await this.adapter(opts);
    if (res.statusCode < 400 && res.statusCode >= 200) {
      return res;
    }
    let errCtor = errorMap[res.statusCode];
    if (!errCtor) {
      errCtor = HTTPResponseError;
    }
    throw new errCtor(opts, res);
  }
}

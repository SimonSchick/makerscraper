import { HTTPClient, HTTPResponseError } from './HTTPClient';
import { Scraper } from './Scraper';

export abstract class StaticTextScraper extends Scraper {
  public abstract readonly url: string;

  constructor(private http: HTTPClient) {
    super();
  }

  public abstract test(content: string): boolean;

  public async isAvailable(): Promise<boolean> {
    try {
      const res = await this.http.request<string>({
        url: this.url,
      });
      return this.test(res.body);
    } catch (err) {
      if (err instanceof HTTPResponseError && this.shouldIgnore(err.response)) {
        return false;
      }
      throw err;
    }
  }
}

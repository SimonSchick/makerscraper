import { HTTPClient } from './HTTPClient';

export class Notifier {
  constructor(
    private http: HTTPClient,
    private botToken: string,
  ) {
  }

  public async notify(target: string, text: string): Promise<void> {
    await this.http.request({
      body: {
        chat_id: target,
        text,
      },
      json: true,
      url: `https://api.telegram.org/bot${this.botToken}/sendMessage`,
    });
  }
}

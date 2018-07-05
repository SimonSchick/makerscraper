import { TypedResponse } from './HTTPClient';

export abstract class Scraper {
  public abstract readonly name: string;
  public abstract isAvailable(): Promise<boolean>;
  public shouldIgnore(_res: TypedResponse<any>): boolean {
    return false;
  }
}

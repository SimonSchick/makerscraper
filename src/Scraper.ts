export abstract class Scraper {
  public abstract readonly name: string;
  public abstract isAvailable(): Promise<boolean>;
}

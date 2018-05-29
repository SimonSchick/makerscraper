import { StaticTextScraper } from './StaticTextScraper';

export class SunnyValleyCreations extends StaticTextScraper {
  public readonly name = 'Sunny Valley Creations';
  public readonly url = 'http://www.sunnyvalleyc.com/';

  public test(str: string): boolean {
    return !str.includes('<span style="color: rgb(255, 0, 0);">CLOSED</span>');
  }
}

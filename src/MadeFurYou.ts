import { StaticTextScraper } from './StaticTextScraper';

export class MadeFurYou extends StaticTextScraper {
  public readonly name = 'Made Fur You';
  public readonly url = 'http://www.madefuryou.com/how-to-order/quote/';

  public test(str: string): boolean {
    return !str.includes('Closed for Commissions at this time');
  }
}

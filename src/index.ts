import * as config from 'config';
import { RequestHTTPClient } from './HTTPClient';
import { MadeFurYou } from './MadeFurYou';
import { Notifier } from './Notifier';
import { Scraper } from './Scraper';
import { SunnyValleyCreations } from './SunnyValleyCreations';

const http = new RequestHTTPClient();

const scrapers = [
  new MadeFurYou(http),
  new SunnyValleyCreations(http),
];

const scraperStates = new Map<Scraper, boolean>();

const notifier = new Notifier(http, config.botToken);

async function logError(title: string, err: Error | string): Promise<void> {
  console.error(title, err);
  try {
    notifier.notify(config.notify, `${title}\n\n\`\`\`${err instanceof Error ? err.stack : err}\`\`\``);
  } catch (err2) {
    console.error('Failed to notify', err2);
  }
}

async function tickLogic(): Promise<void> {
  for (const scraper of scrapers) {
    try {
      const isAvaible = await scraper.isAvailable();
      const prev = scraperStates.get(scraper) || false;
      console.log(scraper.name, 'old', prev, 'new', isAvaible);
      if (isAvaible && !prev) {
        await notifier.notify(config.notify, `${scraper.name} is now available!`);
      }
      if (!isAvaible && prev) {
        await notifier.notify(config.notify, `${scraper.name} is no longer available!`);
      }
      scraperStates.set(scraper, isAvaible);
    } catch (e) {
      await logError(`Failed to scrape ${scraper.name}`, e);
    }
  }
}

process.on('uncaughtException', err => {
  logError('Uncaught error', err);
});

process.on('unhandledRejection', err => {
  logError('Unhandled error', err);
});

setInterval(() => {
  tickLogic().catch(err => logError('Tick error', err));
}, config.interval);
tickLogic().catch(err => logError('Initial tick error', err));

notifier.notify(config.notify, 'Bot is live')
.catch(err => logError('Failed boot notify', err));

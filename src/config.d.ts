import 'config';
declare module 'config' {
  export interface IConfig {
    botToken: string;
    interval: number;
    notify: string;
  }
}

import { Log } from './types';

class HSLogger {
  public log: Log;

  setLogger(log: Log) {
    this.log = log;
  }
}

export const Logger = new HSLogger();
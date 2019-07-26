import { Log } from './interfaces/HAP';

class SesameLogger {
  public  log: Log;
  private debugMode: boolean;

  setLogger(log: Log, debugMode: boolean): void {
    this.log = log;
    this.debugMode = debugMode;
  }

  debug(message: string, data?: any): void {
    if (!this.debugMode) return;

    let result = message;
    if (data) {
      result += `: ${JSON.stringify(data)}`
    }

    this.log(result);
  }

  error(message: string, error?: Error) {
    let result = message;

    if (error) {
      result += `. Error: ${error.message}`;
    }

    this.log.error(result);
  }
}

export const Logger = new SesameLogger();
export class LoggingService {
  private static isDev = !import.meta.env.PROD;

  static info(message: string, ...args: unknown[]): void {
    if (this.isDev) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  static warn(message: string, ...args: unknown[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  static error(message: string, ...args: unknown[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }

  static debug(message: string, ...args: unknown[]): void {
    if (this.isDev) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  static time(label: string): void {
    if (this.isDev) {
      console.time(`[TIMER] ${label}`);
    }
  }

  static timeEnd(label: string): void {
    if (this.isDev) {
      console.timeEnd(`[TIMER] ${label}`);
    }
  }
}

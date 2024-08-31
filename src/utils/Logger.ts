export class Logger {
  static log(message: string, meta?: Record<string, any>) {
    console.log(`[LOG] ${new Date().toISOString()} - ${message}`, meta || "");
  }

  static error(message: string, meta?: Record<string, any>) {
    console.error(
      `[ERROR] ${new Date().toISOString()} - ${message}`,
      meta || ""
    );
  }

  static warn(message: string, meta?: object): void {
    console.warn(`[WARN] ${new Date().toISOString()} ${message}`, meta || "");
  }
}

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

export class Logger {
  private static formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, data } = entry;
    let logString = `[${timestamp}] ${level}: ${message}`;
    
    if (data) {
      logString += ` | Data: ${JSON.stringify(data)}`;
    }
    
    return logString;
  }

  private static log(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    const formattedLog = Logger.formatLogEntry(entry);
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.DEBUG:
      default:
        console.log(formattedLog);
        break;
    }
  }

  public static error(message: string, data?: any): void {
    Logger.log(LogLevel.ERROR, message, data);
  }

  public static warn(message: string, data?: any): void {
    Logger.log(LogLevel.WARN, message, data);
  }

  public static info(message: string, data?: any): void {
    Logger.log(LogLevel.INFO, message, data);
  }

  public static debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      Logger.log(LogLevel.DEBUG, message, data);
    }
  }
}

export default Logger;
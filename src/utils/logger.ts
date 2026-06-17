/**
 * Production-ready JSON logger with level hierarchy and mock Sentry metrics hook.
 */
type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

class ProductionLogger {
  private log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const logPayload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      environment: process.env.NODE_ENV || 'development',
      ...meta,
    };

    if (level === 'ERROR' || level === 'WARN') {
      console.error(JSON.stringify(logPayload));
      // Sentry setup simulated catch block
      this.sendToSentry(level, message, meta);
    } else {
      console.log(JSON.stringify(logPayload));
    }
  }

  private sendToSentry(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    // If Sentry was fully initialized:
    // Sentry.withScope((scope) => {
    //   scope.setExtras(meta || {});
    //   Sentry.captureMessage(`[${level}] ${message}`);
    // });
  }

  debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('DEBUG', message, meta);
    }
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.log('INFO', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.log('WARN', message, meta);
  }

  error(message: string, error?: unknown, meta?: Record<string, unknown>) {
    const errorDetails = error instanceof Error 
      ? { errorName: error.name, errorMessage: error.message, errorStack: error.stack }
      : { rawError: String(error) };

    this.log('ERROR', message, { ...meta, ...errorDetails });
  }
}

export const logger = new ProductionLogger();

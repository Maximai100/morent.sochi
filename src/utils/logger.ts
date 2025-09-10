/**
 * Logger utility for controlled logging
 * In production, logs are suppressed unless critical
 */

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isDebugEnabled = import.meta.env.VITE_DEBUG === 'true';

  debug(...args: any[]) {
    if (this.isDevelopment && this.isDebugEnabled) {
      console.log('[DEBUG]', ...args);
    }
  }

  info(...args: any[]) {
    if (this.isDevelopment) {
      console.info('[INFO]', ...args);
    }
  }

  warn(...args: any[]) {
    if (this.isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  }

  error(message: string, error?: any) {
    // Always log errors, even in production
    console.error('[ERROR]', message, error);
    
    // In production, you could send to error tracking service
    if (!this.isDevelopment) {
      // TODO: Send to Sentry or similar service
      // Sentry.captureException(error, { extra: { message } });
    }
  }

  // Method to log API calls (useful for debugging)
  api(method: string, endpoint: string, data?: any) {
    if (this.isDevelopment && this.isDebugEnabled) {
      console.log(`[API] ${method} ${endpoint}`, data);
    }
  }

  // Method to log performance metrics
  performance(label: string, duration: number) {
    if (this.isDevelopment) {
      console.log(`[PERF] ${label}: ${duration}ms`);
    }
  }
}

export const logger = new Logger();
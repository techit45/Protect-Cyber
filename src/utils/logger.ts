/**
 * Structured Logging Utility
 * ระบบ logging แบบมีโครงสร้างสำหรับ ProtectCyber
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
  requestId?: string;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private readonly isProduction = process.env.NODE_ENV === 'production';

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, service: string, message: string, metadata?: Record<string, any>, error?: Error): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service,
      message,
      metadata,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } as any : undefined
    };

    // In production, only log structured JSON
    if (this.isProduction) {
      console.log(JSON.stringify(logEntry));
    } else {
      // In development, log with colors and readable format
      const emoji = this.getLevelEmoji(level);
      const coloredLevel = this.colorizeLevel(level);
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      
      console.log(`${emoji} [${timestamp}] ${coloredLevel} [${service}] ${message}`);
      
      if (metadata && Object.keys(metadata).length > 0) {
        console.log('   📊 Metadata:', JSON.stringify(metadata, null, 2));
      }
      
      if (error) {
        console.log('   ❌ Error:', error.message);
        if (error.stack) {
          console.log('   📚 Stack:', error.stack);
        }
      }
    }
  }

  private getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR: return '🚨';
      case LogLevel.WARN: return '⚠️';
      case LogLevel.INFO: return 'ℹ️';
      case LogLevel.DEBUG: return '🔍';
      default: return '📝';
    }
  }

  private colorizeLevel(level: LogLevel): string {
    if (this.isProduction) return level;
    
    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[90m'  // Gray
    };
    const reset = '\x1b[0m';
    
    return `${colors[level]}${level}${reset}`;
  }

  public error(service: string, message: string, error?: Error, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, service, message, metadata, error);
  }

  public warn(service: string, message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, service, message, metadata);
  }

  public info(service: string, message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, service, message, metadata);
  }

  public debug(service: string, message: string, metadata?: Record<string, any>): void {
    if (!this.isProduction) {
      this.log(LogLevel.DEBUG, service, message, metadata);
    }
  }

  // Convenience methods for threat analysis
  public threatDetected(userId: string, threatType: string, riskLevel: string, message: string): void {
    this.warn('ThreatDetector', `Threat detected: ${threatType}`, {
      userId,
      threatType,
      riskLevel,
      originalMessage: message.substring(0, 100) // Truncate for privacy
    });
  }

  public aiAnalysisError(service: string, error: Error, context?: Record<string, any>): void {
    this.error('AIAnalyzer', `AI analysis failed: ${error.message}`, error, context);
  }

  public webhookReceived(source: string, eventCount: number, signature?: string): void {
    this.info('Webhook', `Received ${eventCount} events from ${source}`, {
      source,
      eventCount,
      hasSignature: !!signature
    });
  }

  public performanceMetric(service: string, operation: string, duration: number, success: boolean): void {
    this.info('Performance', `${operation} completed`, {
      service,
      operation,
      duration,
      success
    });
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export service-specific loggers
export const createServiceLogger = (serviceName: string) => ({
  error: (message: string, error?: Error, metadata?: Record<string, any>) => 
    logger.error(serviceName, message, error, metadata),
  warn: (message: string, metadata?: Record<string, any>) => 
    logger.warn(serviceName, message, metadata),
  info: (message: string, metadata?: Record<string, any>) => 
    logger.info(serviceName, message, metadata),
  debug: (message: string, metadata?: Record<string, any>) => 
    logger.debug(serviceName, message, metadata)
});
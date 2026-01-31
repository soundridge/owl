/**
 * Unified logger for renderer process
 * Provides consistent logging with source prefixes
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogOptions {
  source?: string
  data?: unknown
}

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '#888888',
  info: '#0ea5e9',
  warn: '#f59e0b',
  error: '#ef4444',
}

function formatMessage(level: LogLevel, message: string, options?: LogOptions): void {
  const source = options?.source ? `[${options.source}]` : ''
  const prefix = `%c${source}`
  const style = `color: ${LOG_COLORS[level]}; font-weight: bold;`

  if (options?.data !== undefined) {
    if (level === 'warn') {
      console.warn(prefix, style, message, options.data)
    }
    else if (level === 'error') {
      console.error(prefix, style, message, options.data)
    }
  }
  else {
    if (level === 'warn') {
      console.warn(prefix, style, message)
    }
    else if (level === 'error') {
      console.error(prefix, style, message)
    }
  }
}

export const logger = {
  debug: (message: string, options?: LogOptions) => formatMessage('debug', message, options),
  info: (message: string, options?: LogOptions) => formatMessage('info', message, options),
  warn: (message: string, options?: LogOptions) => formatMessage('warn', message, options),
  error: (message: string, options?: LogOptions) => formatMessage('error', message, options),

  /**
   * Create a logger with a fixed source prefix
   */
  createSource: (source: string) => ({
    debug: (message: string, data?: unknown) => formatMessage('debug', message, { source, data }),
    info: (message: string, data?: unknown) => formatMessage('info', message, { source, data }),
    warn: (message: string, data?: unknown) => formatMessage('warn', message, { source, data }),
    error: (message: string, data?: unknown) => formatMessage('error', message, { source, data }),
  }),
}

// Pre-configured loggers for common sources
export const agentLogger = logger.createSource('Agent')
export const ipcLogger = logger.createSource('IPC')

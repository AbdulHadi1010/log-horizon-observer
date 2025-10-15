// logService.ts

export type LogLevel = "info" | "warning" | "error" | "debug";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  metadata: {
    requestId: string;
    userId: string | null;
    duration: number;
    httpStatus: number;
  };
}

export const generateMockLog = (): LogEntry => {
  const sources = ["auth-service", "payment-service", "user-service", "notification-service", "database"];
  const levels: LogLevel[] = ["info", "warning", "error", "debug"];
  
  const messages: Record<LogLevel, string[]> = {
    info: [
      "User successfully authenticated",
      "Payment processed successfully",
      "Database connection established",
      "Cache warmed up successfully",
      "Background job completed",
      "API request processed in 120ms",
      "File uploaded successfully",
      "Email notification sent"
    ],
    warning: [
      "High memory usage detected (85%)",
      "API rate limit approaching threshold",
      "Database query took longer than expected",
      "Cache miss rate above 20%",
      "Disk space running low",
      "SSL certificate expiring in 30 days",
      "Deprecated API endpoint accessed"
    ],
    error: [
      "Database connection timeout after 30 seconds",
      "Payment gateway returned error 500",
      "Authentication service unreachable",
      "Memory allocation failed - out of memory",
      "API request failed with status 404",
      "File upload corrupted during transfer",
      "Email service connection refused",
      "Critical service dependency unavailable"
    ],
    debug: [
      "Starting background worker process",
      "Loading configuration from environment",
      "Initializing database connection pool",
      "Setting up webhook endpoints",
      "Validating input parameters",
      "Creating temporary file for processing",
      "Establishing secure connection"
    ]
  };

  const level = levels[Math.floor(Math.random() * levels.length)];
  const source = sources[Math.floor(Math.random() * sources.length)];
  const messageArray = messages[level];
  const message = messageArray[Math.floor(Math.random() * messageArray.length)];

  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    level,
    source,
    message,
    metadata: {
      requestId: `req_${Math.random().toString(36).substr(2, 9)}`,
      userId: level === "error" ? null : `user_${Math.floor(Math.random() * 1000)}`,
      duration: Math.floor(Math.random() * 1000),
      httpStatus: level === "error"
        ? [400, 404, 500, 503][Math.floor(Math.random() * 4)]
        : 200
    }
  };
};

export const generateMockLogs = (count: number): LogEntry[] => {
  return Array.from({ length: count }, generateMockLog);
};

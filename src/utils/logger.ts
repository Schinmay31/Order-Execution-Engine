/**
 * Logger utility with colored output for better debugging and tracking multiple orders
 */

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  // Text colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  // Text styles
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
};

// Store order-specific colors
const orderColorMap = new Map<string, string>();
const availableColors = [
  colors.cyan,
  colors.green,
  colors.magenta,
  colors.blue,
  colors.yellow,
];
let colorIndex = 0;

/**
 * Get a consistent color for a specific order ID
 */
function getOrderColor(orderId: string): string {
  if (!orderColorMap.has(orderId)) {
    orderColorMap.set(orderId, availableColors[colorIndex % availableColors.length]);
    colorIndex++;
  }
  return orderColorMap.get(orderId) || colors.reset;
}

/**
 * Format timestamp
 */
function getTimestamp(): string {
  const now = new Date();
  return now.toISOString().split('T')[1].slice(0, 12);
}

/**
 * Log info level message
 */
export function logInfo(message: string, orderId?: string): void {
  const timestamp = getTimestamp();
  if (orderId) {
    const orderColor = getOrderColor(orderId);
    console.log(
      `${colors.dim}[${timestamp}]${colors.reset} ${orderColor}[${orderId}]${colors.reset} ${colors.bright}ℹ${colors.reset} ${message}`
    );
  } else {
    console.log(
      `${colors.dim}[${timestamp}]${colors.reset} ${colors.bright}${colors.blue}ℹ${colors.reset} ${message}`
    );
  }
}

/**
 * Log success level message
 */
export function logSuccess(message: string, orderId?: string): void {
  const timestamp = getTimestamp();
  if (orderId) {
    const orderColor = getOrderColor(orderId);
    console.log(
      `${colors.dim}[${timestamp}]${colors.reset} ${orderColor}[${orderId}]${colors.reset} ${colors.green}✓${colors.reset} ${colors.green}${message}${colors.reset}`
    );
  } else {
    console.log(
      `${colors.dim}[${timestamp}]${colors.reset} ${colors.green}✓${colors.reset} ${colors.green}${message}${colors.reset}`
    );
  }
}

/**
 * Log warning level message
 */
export function logWarning(message: string, orderId?: string): void {
  const timestamp = getTimestamp();
  if (orderId) {
    const orderColor = getOrderColor(orderId);
    console.log(
      `${colors.dim}[${timestamp}]${colors.reset} ${orderColor}[${orderId}]${colors.reset} ${colors.yellow}⚠${colors.reset} ${colors.yellow}${message}${colors.reset}`
    );
  } else {
    console.log(
      `${colors.dim}[${timestamp}]${colors.reset} ${colors.yellow}⚠${colors.reset} ${colors.yellow}${message}${colors.reset}`
    );
  }
}

/**
 * Log error level message
 */
export function logError(message: string, orderId?: string, error?: any): void {
  const timestamp = getTimestamp();
  if (orderId) {
    const orderColor = getOrderColor(orderId);
    console.error(
      `${colors.dim}[${timestamp}]${colors.reset} ${orderColor}[${orderId}]${colors.reset} ${colors.red}✗${colors.reset} ${colors.red}${message}${colors.reset}`,
      error ? error : ''
    );
  } else {
    console.error(
      `${colors.dim}[${timestamp}]${colors.reset} ${colors.red}✗${colors.reset} ${colors.red}${message}${colors.reset}`,
      error ? error : ''
    );
  }
}

/**
 * Log debug level message
 */
export function logDebug(message: string, data?: any, orderId?: string): void {
  const timestamp = getTimestamp();
  if (orderId) {
    const orderColor = getOrderColor(orderId);
    console.log(
      `${colors.dim}[${timestamp}]${colors.reset} ${orderColor}[${orderId}]${colors.reset} ${colors.dim}🔍 ${message}${colors.reset}`,
      data ? JSON.stringify(data, null, 2) : ''
    );
  } else {
    console.log(
      `${colors.dim}[${timestamp}]${colors.reset} ${colors.dim}🔍 ${message}${colors.reset}`,
      data ? JSON.stringify(data, null, 2) : ''
    );
  }
}

/**
 * Log a section header
 */
export function logSection(title: string): void {
  const timestamp = getTimestamp();
  const border = '═'.repeat(50);
  console.log(`${colors.bright}${colors.blue}${border}${colors.reset}`);
  console.log(
    `${colors.dim}[${timestamp}]${colors.reset} ${colors.bright}${colors.blue}█ ${title}${colors.reset}`
  );
  console.log(`${colors.bright}${colors.blue}${border}${colors.reset}`);
}

/**
 * Clear order color cache (useful for testing)
 */
export function clearOrderColorCache(): void {
  orderColorMap.clear();
  colorIndex = 0;
}

export default {
  logInfo,
  logSuccess,
  logWarning,
  logError,
  logDebug,
  logSection,
  clearOrderColorCache,
};

/**
 * Formats a Unix timestamp to a human-readable date string
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string
 * 
 * @example
 * formatUnixTimestamp(1735555200) // "Dec 30, 2024"
 */
export function formatUnixTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  
  // If it's today, show time
  if (isToday(date)) {
    return formatTime(date);
  }
  
  // If it's yesterday
  if (isYesterday(date)) {
    return `Yesterday, ${formatTime(date)}`;
  }
  
  // If it's within the last week, show day of week
  if (isWithinWeek(date)) {
    return `${getDayName(date)}, ${formatTime(date)}`;
  }
  
  // If it's this year, don't show year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  // Otherwise show full date
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Formats an ISO timestamp string to a human-readable date
 * @param isoString - ISO timestamp string
 * @returns Formatted date string
 * 
 * @example
 * formatISOTimestamp("2025-01-04T10:13:29.000Z") // "Jan 4, 2025"
 */
export function formatISOTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return formatUnixTimestamp(Math.floor(date.getTime() / 1000));
}

/**
 * Truncates text to a specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Gets the first line of text
 * @param text - Text to process
 * @returns First line of text
 */
export function getFirstLine(text: string): string {
  const lines = text.split('\n');
  return lines[0] || '';
}

// Helper functions
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

function isWithinWeek(date: Date): boolean {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return date > weekAgo;
}

function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
} 
/**
 * Date and Time utilities configured for Asia/Kolkata (IST, UTC+05:30)
 */

export const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns today's date string 'YYYY-MM-DD' in Asia/Kolkata timezone
 */
export function getTodayDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Returns current time in 'HH:mm' in Asia/Kolkata timezone
 */
export function getCurrentTimeString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return formatter.format(date);
}

/**
 * Formats a 'YYYY-MM-DD' string to a readable format e.g. 'Sunday, Oct 25, 2026'
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Formats a 24-hour time string 'HH:mm' to 12-hour format e.g. '10:15 AM'
 */
export function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Converts 'HH:mm' to minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Converts minutes from midnight to 'HH:mm'
 */
export function minutesToTime(totalMinutes: number): string {
  const safe = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Calculates duration in minutes between two 'HH:mm' strings
 */
export function getDurationMinutes(startTime: string, endTime: string): number {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (end >= start) {
    return end - start;
  }
  return 1440 - start + end;
}

/**
 * Checks if a target date is within start and end dates (inclusive)
 */
export function isDateInRange(targetDate: string, startDate: string, endDate: string): boolean {
  return targetDate >= startDate && targetDate <= endDate;
}

/**
 * Calculates the number of days between two 'YYYY-MM-DD' dates
 */
export function daysBetween(date1: string, date2: string): number {
  const [y1, m1, d1] = date1.split('-').map(Number);
  const [y2, m2, d2] = date2.split('-').map(Number);
  const t1 = Date.UTC(y1, m1 - 1, d1);
  const t2 = Date.UTC(y2, m2 - 1, d2);
  const diffTime = t2 - t1;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Returns an array of the 7 dates ('YYYY-MM-DD') for the week containing referenceDate (Monday to Sunday)
 */
export function getWeekDates(referenceDateStr: string = getTodayDateString()): string[] {
  const [y, m, d] = referenceDateStr.split('-').map(Number);
  const refDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const dayOfWeek = refDate.getUTCDay(); // 0 is Sunday, 1 is Monday
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(refDate);
  monday.setUTCDate(refDate.getUTCDate() + distanceToMonday);

  const week: string[] = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setUTCDate(monday.getUTCDate() + i);
    const yr = cur.getUTCFullYear();
    const mo = String(cur.getUTCMonth() + 1).padStart(2, '0');
    const dy = String(cur.getUTCDate()).padStart(2, '0');
    week.push(`${yr}-${mo}-${dy}`);
  }
  return week;
}

/**
 * Returns day name e.g. "Monday"
 */
export function getDayName(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long' }).format(date);
}

/**
 * Check if a date string is Saturday or Sunday
 */
export function isWeekend(dateStr: string): boolean {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}
